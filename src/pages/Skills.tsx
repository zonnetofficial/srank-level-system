import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { STAT_LABELS, STAT_ICONS, StatKey, getSkillTitle } from '@/lib/gameData';
import { getTasksForStat, getTitleIndex } from '@/lib/skillTasks';
import { getTestForTier, getTierFromPoints, evaluateTest, TestQuestion } from '@/lib/intTests';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Skills = () => {
  const { state, completeSkillTask, completeIntTest, isSkillAvailable } = useGameState();
  const [confirming, setConfirming] = useState<StatKey | null>(null);

  // INT test state
  const [testActive, setTestActive] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [testResult, setTestResult] = useState<{ score: number; perfect: boolean; totalPoints: number } | null>(null);
  const [perfectsToday, setPerfectsToday] = useState((state as any).intPerfectsToday || 0);

  const handleStartInt = () => {
    const tier = getTierFromPoints(state.statPoints.int);
    const questions = getTestForTier(tier);
    setTestQuestions(questions);
    setTestAnswers([]);
    setCurrentQ(0);
    setTestResult(null);
    setTestActive(true);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...testAnswers, answerIndex];
    setTestAnswers(newAnswers);

    if (newAnswers.length >= testQuestions.length) {
      // Evaluate
      const result = evaluateTest(testQuestions, newAnswers);
      setTestResult(result);

      if (result.score === 0) {
        // Failed completely
        completeIntTest(0, true, 0);
        setPerfectsToday(0);
      } else if (result.perfect) {
        const newPerfects = perfectsToday + 1;
        setPerfectsToday(newPerfects);
        let bonus = result.totalPoints;
        if (newPerfects >= 5) {
          bonus += 10; // 5 perfect bonus
        }
        completeIntTest(bonus, false, newPerfects);
      } else {
        // Passed but not perfect
        completeIntTest(result.totalPoints, false, 0);
      }
    } else {
      setCurrentQ(newAnswers.length);
    }
  };

  const handleCloseTest = () => {
    setTestActive(false);
    setTestResult(null);
  };

  const handleStart = (key: StatKey) => {
    if (key === 'int') {
      handleStartInt();
      return;
    }
    setConfirming(key);
  };

  const skillPoints: Record<string, { success: number; fail: number }> = {
    str: { success: 4, fail: 1 },
    agi: { success: 1, fail: 0 },
    vit: { success: 1, fail: 0 },
    end: { success: 4, fail: 1 },
  };

  const handleResult = (key: StatKey, success: boolean) => {
    const pts = success ? (skillPoints[key]?.success || 0) : (skillPoints[key]?.fail || 0);
    completeSkillTask(key, pts);
    setConfirming(null);
  };

  // INT Test Modal
  if (testActive) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
        <h1 className="font-display text-xl font-bold text-center text-stat-int text-glow-primary mb-6">
          🧠 Test de Inteligencia
        </h1>

        {testResult ? (
          <div className="rpg-panel-glow text-center py-8 space-y-4">
            <div className="text-5xl mb-2">
              {testResult.perfect ? '🌟' : testResult.score > 0 ? '✅' : '❌'}
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {testResult.perfect
                ? '¡Perfecto!'
                : testResult.score > 0
                ? 'Test Aprobado'
                : 'Test Reprobado'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {testResult.score}/{testQuestions.length} respuestas correctas
            </p>
            {testResult.perfect && perfectsToday >= 5 && (
              <div className="text-accent font-display text-sm animate-pulse-glow p-2 rounded">
                🏆 ¡5 Perfectos! Bonificación especial obtenida
              </div>
            )}
            {testResult.perfect && perfectsToday < 5 && (
              <p className="text-xs text-primary font-display">
                ⚡ Has desbloqueado otro test hoy
              </p>
            )}
            {testResult.score === 0 && (
              <p className="text-xs text-destructive font-display">
                El próximo test estará disponible en 2 días
              </p>
            )}
            <div className="flex gap-2 mt-4">
              {testResult.perfect && perfectsToday < 5 && (
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
        ) : (
          <div className="rpg-panel space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                Pregunta {currentQ + 1} de {testQuestions.length}
              </span>
              <span className="text-xs font-display text-primary">
                {perfectsToday}/5 perfectos hoy
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
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6">
        ✨ Skills
      </h1>

      <div className="space-y-4">
        {statKeys.map(key => {
          const available = isSkillAvailable(key);
          const isConfirming = confirming === key;
          const glowClass = `glow-${key}`;
          const titleIdx = getTitleIndex(key, state.statPoints[key]);
          const currentTitle = getSkillTitle(key, state.statPoints[key]);

          // Get tasks for non-INT stats
          const tasks = key === 'int' ? [] : getTasksForStat(key, titleIdx);

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

              {key === 'int' ? (
                // INT: show test prompt
                <div className="space-y-2 mb-3">
                  <div className="text-sm text-muted-foreground">• Test de conocimiento</div>
                  <div className="text-xs text-muted-foreground/70">Responde preguntas para demostrar tu intelecto</div>
                </div>
              ) : (
                // Other stats: show assigned tasks
                <div className="space-y-1 mb-3">
                  {tasks.map((task, i) => (
                    <div key={i} className="text-sm text-muted-foreground">• {task.name}</div>
                  ))}
                </div>
              )}

              {isConfirming ? (
                <div className="space-y-2">
                  <p className="text-xs text-center text-foreground font-display">
                    ¿Completaste la tarea?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResult(key, true)}
                      className="flex-1 py-2 rounded bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider hover:bg-primary/80 transition-colors"
                    >
                      ✅ Sí
                    </button>
                    <button
                      onClick={() => handleResult(key, false)}
                      className="flex-1 py-2 rounded bg-destructive text-destructive-foreground font-display text-xs uppercase tracking-wider hover:bg-destructive/80 transition-colors"
                    >
                      ❌ No
                    </button>
                  </div>
                  <button
                    onClick={() => setConfirming(null)}
                    className="w-full py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleStart(key)}
                  disabled={!available}
                  className={`w-full py-2 rounded font-display text-xs uppercase tracking-wider transition-colors ${
                    available
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  }`}
                >
                  {available ? (key === 'int' ? 'Iniciar Test' : 'Iniciar Tarea') : 'No disponible'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skills;
