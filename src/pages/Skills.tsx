import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import SkillTaskDialog from '@/components/SkillTaskDialog';
import { useGameState } from '@/hooks/useGameState';
import { STAT_LABELS, STAT_ICONS, StatKey, getSkillTitle } from '@/lib/gameData';
import { getTasksForStat, getTitleIndex } from '@/lib/skillTasks';
import { getTestForTier, getTierFromPoints, evaluateTest, TestQuestion, TestTheme } from '@/lib/intTests';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Skills = () => {
  const { state, completeSkillTask, completeIntTest, isSkillAvailable } = useGameState();
  const navigate = useNavigate();

  // INT test state
  const [testActive, setTestActive] = useState(false);
  const [testTheme, setTestTheme] = useState<TestTheme | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [testResult, setTestResult] = useState<{ score: number; perfect: boolean; totalPoints: number } | null>(null);
  const perfectsToday = (state as any).intPerfectsToday || 0;
  const intTestsToday = (state as any).intTestsToday || 0;

  // Skill task dialog state
  const [taskDialogStat, setTaskDialogStat] = useState<StatKey | null>(null);
  const [taskDialogTask, setTaskDialogTask] = useState<{ name: string; description: string } | null>(null);

  const handleStartInt = () => {
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

      // Collect correctly answered question IDs
      const newCorrect: string[] = [];
      for (let i = 0; i < testQuestions.length; i++) {
        if (newAnswers[i] === testQuestions[i].correctIndex) {
          newCorrect.push(testQuestions[i].id);
        }
      }

      if (result.score === 0) {
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
    // Max 6 tests: 5 perfects + 1 superior
    if (intTestsToday >= 6) return false;
    // Can only continue if perfect and under 5 perfects
    if (testResult.perfect && perfectsToday < 5) return true;
    // 5th perfect unlocks 1 superior test (6th total)
    if (testResult.perfect && perfectsToday === 5 && intTestsToday < 6) return true;
    return false;
  };

  // Skill task handling
  const handleStartSkill = (key: StatKey) => {
    if (key === 'int') {
      handleStartInt();
      return;
    }
    const titleIdx = getTitleIndex(key, state.statPoints[key]);
    const tasks = getTasksForStat(key, titleIdx);
    if (tasks.length === 0) return;
    // Pick a random task
    const task = tasks[Math.floor(Math.random() * tasks.length)];
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
          <div className="text-center py-6 space-y-4">
            <div className="text-5xl mb-2">
              {testResult.perfect ? '🌟' : testResult.score > 0 ? '✅' : '❌'}
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {testResult.perfect ? '¡Perfecto!' : testResult.score > 0 ? 'Test Aprobado' : 'Test Reprobado'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {testResult.score}/{testQuestions.length} respuestas correctas
            </p>
            {testResult.perfect && perfectsToday >= 5 && (
              <div className="text-accent font-display text-sm animate-pulse-glow p-2 rounded">
                🏆 ¡5 Perfectos! Bonificación especial obtenida
              </div>
            )}
            {testResult.score === 0 && (
              <p className="text-xs text-destructive font-display">
                El próximo test estará disponible en 2 días
              </p>
            )}
            <div className="flex gap-2 mt-4">
              {canDoAnotherTest() && (
                <button
                  onClick={handleStartInt}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider"
                >
                  {perfectsToday >= 5 ? 'Test de Título Superior' : 'Siguiente Test'}
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
          <div className="space-y-4 py-2">
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
          <div className="space-y-5 py-2">
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
                  className="w-full text-left py-3 px-4 rounded-lg bg-secondary text-secondary-foreground font-body text-sm hover:bg-primary/20 hover:border-primary/40 border border-border transition-colors"
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

  // Skill Task Dialog
  const skillTaskDialog = (
    <Dialog open={!!taskDialogStat} onOpenChange={(o) => { if (!o) { setTaskDialogStat(null); setTaskDialogTask(null); } }}>
      <DialogContent className="bg-background border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-center">
            {taskDialogStat && (
              <span className={`text-stat-${taskDialogStat}`}>
                {STAT_ICONS[taskDialogStat]} {STAT_LABELS[taskDialogStat]}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {taskDialogTask && (
          <div className="space-y-6 py-4">
            <div className="rpg-panel text-center">
              <h3 className="font-display text-base font-bold text-foreground mb-2">
                {taskDialogTask.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {taskDialogTask.description}
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground font-display">
              ¿Completaste esta tarea?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleTaskResult(true)}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider hover:bg-primary/80 transition-colors"
              >
                ✅ Sí
              </button>
              <button
                onClick={() => handleTaskResult(false)}
                className="flex-1 py-3 rounded-lg bg-destructive text-destructive-foreground font-display text-sm uppercase tracking-wider hover:bg-destructive/80 transition-colors"
              >
                ❌ No
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors"
      >
        ← Volver
      </button>
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6">
        ✨ Skills
      </h1>

      <div className="space-y-4">
        {statKeys.map(key => {
          const available = isSkillAvailable(key);
          const glowClass = `glow-${key}`;
          const currentTitle = getSkillTitle(key, state.statPoints[key]);

          return (
            <div key={key} className={`rpg-panel ${glowClass}`}>
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
                onClick={() => handleStartSkill(key)}
                disabled={!available}
                className={`w-full py-2 rounded font-display text-xs uppercase tracking-wider transition-colors ${
                  available
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }`}
              >
                {available ? (key === 'int' ? 'Iniciar Test' : 'Iniciar Tarea') : 'No disponible'}
              </button>
            </div>
          );
        })}
      </div>

      {intTestDialog}
      {skillTaskDialog}
    </VictorianFrame>
  );
};

export default Skills;
