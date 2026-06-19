"use client";

import { useCallback } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { formatDuration, getCorrectAnswerIndex, getQuestionKey } from "@/lib/quiz-utils";
import type { QuizVariant, StoredQuizProgress } from "@/types/quiz";

type QuizScreenProps = {
  variant: QuizVariant;
  progress: StoredQuizProgress;
  onProgressChange: (updater: (progress: StoredQuizProgress) => StoredQuizProgress) => void;
  onRestart: () => void;
  onBack: () => void;
};

export function QuizScreen({ variant, progress, onProgressChange, onRestart, onBack }: QuizScreenProps) {
  const currentOriginalQuestionIndex = progress.questionOrder[progress.currentQuestionIndex];
  const currentQuestionKey = getQuestionKey(currentOriginalQuestionIndex);
  const selectedAnswerIndex = progress.selectedAnswers[currentQuestionKey];
  const hasAnswer = selectedAnswerIndex !== undefined;
  const totalQuestions = variant.questions.length;
  const progressPercent = Math.round(((progress.currentQuestionIndex + 1) / totalQuestions) * 100);
  const isLastQuestion = progress.currentQuestionIndex === totalQuestions - 1;

  const handleTimerTick = useCallback(
    () => {
      onProgressChange((currentProgress) => ({
        ...currentProgress,
        elapsedMs: currentProgress.elapsedMs + 1000,
      }));
    },
    [onProgressChange],
  );

  useQuizTimer({
    isRunning: !progress.isPaused && !progress.isCompleted,
    onTick: handleTimerTick,
  });

  const handleAnswer = (answerIndex: number) => {
    if (progress.isPaused || hasAnswer) {
      return;
    }

    onProgressChange((currentProgress) => {
      const questionIndex = currentProgress.questionOrder[currentProgress.currentQuestionIndex];
      const questionKey = getQuestionKey(questionIndex);
      const isCorrect = answerIndex === getCorrectAnswerIndex(variant, questionIndex);

      return {
        ...currentProgress,
        selectedAnswers: {
          ...currentProgress.selectedAnswers,
          [questionKey]: answerIndex,
        },
        results: {
          ...currentProgress.results,
          [questionKey]: isCorrect,
        },
      };
    });
  };

  const handleNext = () => {
    onProgressChange((currentProgress) => {
      if (currentProgress.currentQuestionIndex >= totalQuestions - 1) {
        return {
          ...currentProgress,
          isCompleted: true,
          isPaused: false,
        };
      }

      return {
        ...currentProgress,
        currentQuestionIndex: currentProgress.currentQuestionIndex + 1,
      };
    });
  };

  const handlePauseToggle = () => {
    onProgressChange((currentProgress) => ({
      ...currentProgress,
      isPaused: !currentProgress.isPaused,
    }));
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-slate-50 px-4 py-4">
      <section className="relative w-full max-w-[420px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{variant.title}</p>
                <h1 className="mt-1 text-lg font-bold text-slate-950">
                  Вопрос {progress.currentQuestionIndex + 1} из {totalQuestions}
                </h1>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-right">
                <p className="text-[11px] font-medium text-slate-500">Время</p>
                <p data-testid="timer" className="font-mono text-sm font-bold text-slate-950">
                  {formatDuration(progress.elapsedMs)}
                </p>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </header>

          <div className="mt-4">
            <QuestionCard
              variant={variant}
              questionIndex={currentOriginalQuestionIndex}
              answerOrder={progress.answerOrders[currentQuestionKey]}
              selectedAnswerIndex={selectedAnswerIndex}
              isPaused={progress.isPaused}
              onAnswer={handleAnswer}
            />
          </div>

          <div className="mt-3 grid gap-2">
            {hasAnswer ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-11 rounded-lg bg-sky-700 px-3 text-sm font-semibold text-white transition hover:bg-sky-800 active:scale-[0.99]"
              >
                {isLastQuestion ? "Завершить" : "Следующий вопрос"}
              </button>
            ) : null}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handlePauseToggle}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
              >
                {progress.isPaused ? "Продолжить" : "Пауза"}
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Начать заново
              </button>
              <button
                type="button"
                onClick={onBack}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Варианты
              </button>
            </div>
          </div>
        </div>

        {progress.isPaused ? (
          <div
            data-testid="pause-overlay"
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/78 px-6 backdrop-blur-[2px]"
          >
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center shadow-lg">
              <p className="text-lg font-bold text-slate-950">Пауза</p>
              <p className="mt-1 text-sm text-slate-500">Таймер остановлен, ответы временно закрыты.</p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
