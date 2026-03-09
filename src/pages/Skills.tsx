import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import SkillTaskDialog from '@/components/SkillTaskDialog';
import { useGameState } from '@/hooks/useGameState';
import { STAT_LABELS, STAT_ICONS, StatKey, getSkillTitle } from '@/lib/gameData';
import { getTasksForStat, getTitleIndex, SkillTask } from '@/lib/skillTasks';
import { getTestForTier, getTierFromPoints, evaluateTest, TestQuestion, TestTheme } from '@/lib/intTests';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sfxClick, sfxHover, sfxSuccess, sfxError } from '@/lib/audioEngine';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Skills = () => {
  const { state, completeSkillTask, completeIntTest, isSkillAvailable } = useGameState();
  const navigate = useNavigate();

  // INT test state
  const [intSkillIntro, setIntSkillIntro] = useState(false);
  const [testActive, setTestActive] = useState(false);
  const [testTheme, setTestTheme] = useState<TestTheme | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [testResult, setTestResult] = useState<{ score: number; perfect: boolean; passed: boolean; totalPoints: number } | null>(null);
  const perfectsToday = (state as any).intPerfectsToday || 0;
  const intTestsToday = (state as any).intTestsToday || 0;

  // Skill task dialog state
  const [taskDialogStat, setTaskDialogStat] = useState<StatKey | null>(null);
  const [taskDialogTask, setTaskDialogTask] = useState<SkillTask | null>(null);

  const handleShowIntSkillIntro = () => {
    setIntSkillIntro(true);
  };

  const handleStartInt = () => {
    setIntSkillIntro(false);
    const tier = getTierFromPoints(state.statPoints.int);
    const answeredCorrectly: string[] = (state as any).answeredCorrectly || [];
    const { theme, questions } = getTestForTier(tier, answeredCorrectly);
    if (questions.length === 0) return;
    setTestTheme(theme);
    setTestQuestions(questions);
    setTestAnswers([]);
    setCurrentQ(0);
    setShowIntro(true);
    setTestResult(null);
    setTestActive(true);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...testAnswers, answerIndex];
    setTestAnswers(newAnswers);

    if (newAnswers.length >= testQuestions.length) {
      const result = evaluateTest(testQuestions, newAnswers);
      setTestResult(result);

      const newCorrect: string[] = [];
      for (let i = 0; i < testQuestions.length; i++) {
        if (newAnswers[i] === testQuestions[i].correctIndex) {
          newCorrect.push(testQuestions[i].id);
        }
      }

      if (!result.passed) {
        completeIntTest(0, true, 0, newCorrect);
      } else if (result.perfect) {
        const newPerfects = perfectsToday + 1;
        let bonus = result.totalPoints;
        if (newPerfects >= 5) {
          bonus += 10;
        }
        completeIntTest(bonus, false, newPerfects, newCorrect);
      } else {
        completeIntTest(result.totalPoints, false, 0, newCorrect);
      }
    } else {
      setCurrentQ(newAnswers.length);
    }
  };

  const handleCloseTest = () => {
    setTestActive(false);
    setTestResult(null);
    setTestTheme(null);
  };

  const canDoAnotherTest = () => {
    if (!testResult) return false;
    if (intTestsToday >= 6) return false;
    if (testResult.perfect && perfectsToday < 5) return true;
    if (testResult.perfect && perfectsToday === 5 && intTestsToday < 6) return true;
    return false;
  };

  const handleStartSkill = (key: StatKey) => {
    if (key === 'int') {
      handleShowIntSkillIntro();
      return;
    }
    const titleIdx = getTitleIndex(key, state.statPoints[key]);
    const tasks = getTasksForStat(key, titleIdx);
    if (tasks.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const seed = Array.from(dateStr + key).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const task = tasks[seed % tasks.length];
    setTaskDialogTask(task);
    setTaskDialogStat(key);
  };

  const skillPoints: Record<string, { success: number; fail: number }> = {
    str: { success: 4, fail: 1 },
    agi: { success: 1, fail: 0 },
    vit: { success: 1, fail: 0 },
    end: { success: 4, fail: 1 },
  };

  const handleTaskResult = (success: boolean) => {
    if (!taskDialogStat) return;
    const pts = success ? (skillPoints[taskDialogStat]?.success || 0) : (skillPoints[taskDialogStat]?.fail || 0);
    completeSkillTask(taskDialogStat, pts);
    setTaskDialogStat(null);
    setTaskDialogTask(null);
  };

  const handleTaskClose = () => {
    setTaskDialogStat(null);
    setTaskDialogTask(null);
  };

  // INT Test Dialog
  const intTestDialog = (
    <Dialog open={testActive} onOpenChange={(o) => { if (!o && !testResult && testAnswers.length === 0) handleCloseTest(); }}>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-center text-stat-int text-glow-primary">
            🧠 Test de Inteligencia
          </DialogTitle>
        </DialogHeader>

        {testResult ? (
          <div className="text-center py-6 space-y-4 animate-scale-up">
            <div className="text-5xl mb-2">
              {testResult.perfect ? '🌟' : testResult.passed ? '✅' : '❌'}
            </div>
            <h2 className="font-display text-lg font-bold text-foreground animate-glitch-in delay-200">
              {testResult.perfect ? '¡Perfecto!' : testResult.passed ? 'Test Aprobado' : 'Test Reprobado'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {testResult.score}/{testQuestions.length} respuestas correctas ({Math.round((testResult.score / testQuestions.length) * 100)}%)
            </p>
            {testResult.perfect && perfectsToday >= 5 && (
              <div className="text-accent font-display text-sm animate-pulse-glow p-2 rounded">
                🏆 ¡5 Perfectos! Bonificación especial obtenida
              </div>
            )}
            {!testResult.passed && (
              <p className="text-xs text-destructive font-display">
                Necesitas al menos 70% para aprobar
              </p>
            )}

            {(() => {
              const wrongIndices = testQuestions
                .map((q, i) => (testAnswers[i] !== q.correctIndex ? i : -1))
                .filter(i => i >= 0);
              if (wrongIndices.length === 0) return null;
              return (
                <div className="text-left rpg-panel space-y-2 mt-2 animate-slide-up delay-300">
                  <p className="text-xs font-display text-primary uppercase tracking-wider mb-2">
                    📝 Retroalimentación
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {wrongIndices.map(i => (
                      <div key={i} className="border-b border-border/30 pb-2 last:border-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          <span className="text-destructive font-display">✗</span> {testQuestions[i].question}
                        </p>
                        <p className="text-[11px] text-destructive/70 line-through">
                          Tu respuesta: {testQuestions[i].options[testAnswers[i]]}
                        </p>
                        <p className="text-[11px] text-primary">
                          Correcta: {testQuestions[i].options[testQuestions[i].correctIndex]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2 mt-4">
              {canDoAnotherTest() && (
                <button
                  onClick={handleStartInt}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider"
                >
                  Siguiente Test
                </button>
              )}
              <button
                onClick={handleCloseTest}
                className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-display text-xs uppercase tracking-wider"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : showIntro && testTheme ? (
          <div className="space-y-4 py-2 animate-fade-in">
            <h3 className="font-display text-sm text-primary uppercase tracking-wider text-center">
              📖 {testTheme.name}
            </h3>
            <div className="rpg-panel max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {testTheme.intro}
              </p>
            </div>
            <p className="text-xs text-center text-muted-foreground font-display">
              Lee atentamente, las preguntas se basarán en este texto
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider"
            >
              Estoy listo – Comenzar Preguntas
            </button>
          </div>
        ) : testQuestions[currentQ] ? (
          <div className="space-y-5 py-2 animate-slide-up">
            <div className="flex justify-between items-center">
              <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                Pregunta {currentQ + 1} de {testQuestions.length}
              </span>
            </div>

            <div className="stat-bar-track h-1.5">
              <div
                className="stat-bar-fill bg-primary"
                style={{ width: `${((currentQ + 1) / testQuestions.length) * 100}%` }}
              />
            </div>

            <p className="text-foreground font-display text-sm leading-relaxed">
              {testQuestions[currentQ].question}
            </p>

            <div className="space-y-2">
              {testQuestions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full text-left py-3 px-4 rounded-lg bg-secondary text-secondary-foreground font-body text-sm hover:bg-primary/20 hover:border-primary/40 border border-border transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">Cargando...</div>
        )}
      </DialogContent>
    </Dialog>
  );

  const skillTaskDialog = (
    <SkillTaskDialog
      stat={taskDialogStat}
      task={taskDialogTask}
      open={!!taskDialogStat}
      onResult={handleTaskResult}
      onClose={handleTaskClose}
    />
  );

  const availableSkills = statKeys.filter(key => isSkillAvailable(key));

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors animate-slide-down"
      >
        ← Volver
      </button>
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6 animate-glitch-in delay-100">
        ✨ Skills
      </h1>

      <div className="space-y-4">
        {availableSkills.length === 0 && (
          <div className="rpg-panel text-center py-8 animate-fade-in">
            <div className="text-4xl mb-3">🌙</div>
            <p className="text-sm text-muted-foreground font-display">No hay tareas disponibles hoy</p>
          </div>
        )}
        {availableSkills.map((key, i) => {
          const glowClass = `glow-${key}`;
          const currentTitle = getSkillTitle(key, state.statPoints[key]);

          return (
            <div key={key} className={`rpg-panel ${glowClass} animate-slide-up`} style={{ animationDelay: `${200 + i * 120}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{STAT_ICONS[key]}</span>
                  <h3 className={`font-display text-sm uppercase tracking-wider text-stat-${key}`}>
                    {STAT_LABELS[key]}
                  </h3>
                </div>
                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
                  {currentTitle.name}
                </span>
              </div>

              <div className="mb-3">
                <div className="text-sm text-muted-foreground">
                  {key === 'int' ? '• Test de conocimiento' : '• Prueba de habilidad'}
                </div>
              </div>

              <button
                onClick={() => { handleStartSkill(key); sfxClick(); }}
                onMouseEnter={() => sfxHover()}
                className="w-full py-2 rounded font-display text-xs uppercase tracking-wider transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {key === 'int' ? 'Iniciar Test' : 'Iniciar Tarea'}
              </button>
            </div>
          );
        })}
      </div>

      {/* INT Skill Intro Dialog */}
      <Dialog open={intSkillIntro} onOpenChange={(o) => { if (!o) setIntSkillIntro(false); }}>
        <DialogContent className="bg-background border-border max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
            <DialogTitle className="font-display text-center text-stat-int">
              🧠 Inteligencia
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-6 space-y-5">
            <div className="rpg-panel space-y-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-display text-primary uppercase tracking-[0.2em]">
                  Tarea Asignada
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Test de Conocimiento
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se te presentará un texto informativo sobre un tema específico. Léelo con atención, ya que luego deberás responder preguntas basadas en su contenido.
              </p>
            </div>

            <div className="rpg-panel bg-primary/5 border-primary/20 animate-slide-up delay-200">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-display font-bold">📋 Instrucciones:</span>{' '}
                Primero leerás un texto introductorio. Después responderás entre 15 y 20 preguntas de opción múltiple. 
                Necesitas al menos un <span className="text-primary font-bold">70%</span> de respuestas correctas para aprobar.
              </p>
            </div>

            <button
              onClick={handleStartInt}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.2em] glow-primary hover:opacity-90 transition-all animate-scale-up delay-300"
            >
              ▶ Iniciar Test
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {intTestDialog}
      {skillTaskDialog}
    </VictorianFrame>
  );
};

export default Skills;
