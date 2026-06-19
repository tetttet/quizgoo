import { formatDuration, getQuestionKey } from "@/lib/quiz-utils";
import type { QuizVariant, StoredQuizProgress } from "@/types/quiz";

type QuizResultProps = {
  variant: QuizVariant;
  progress: StoredQuizProgress;
  onRestart: () => void;
  onBack: () => void;
};

export function QuizResult({ variant, progress, onRestart, onBack }: QuizResultProps) {
  const totalQuestions = variant.questions.length;
  const correctAnswers = Object.values(progress.results).filter(Boolean).length;
  const percent = Math.round((correctAnswers / totalQuestions) * 100);
  const mistakes = progress.questionOrder.filter((questionIndex) => progress.results[getQuestionKey(questionIndex)] === false);

  return (
    <main data-testid="quiz-result" className="flex min-h-dvh w-full items-center justify-center bg-slate-50 px-4 py-6">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{variant.title}</p>
        <h1 className="mt-1 text-xl font-bold text-slate-950">Результат</h1>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ResultMetric label="Правильно" value={`${correctAnswers}/${totalQuestions}`} />
          <ResultMetric label="Процент" value={`${percent}%`} />
          <ResultMetric label="Время" value={formatDuration(progress.elapsedMs)} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="min-h-11 rounded-lg bg-sky-700 px-3 text-sm font-semibold text-white transition hover:bg-sky-800 active:scale-[0.99]"
          >
            Пройти заново
          </button>
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Выбрать другой
          </button>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-slate-950">Ошибки</h2>
          {mistakes.length === 0 ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Ошибок нет. Отличный результат.</p>
          ) : (
            <div className="mt-2 grid max-h-[44dvh] gap-2 overflow-y-auto pr-1">
              {mistakes.map((questionIndex) => {
                const question = variant.questions[questionIndex];
                const selectedAnswerIndex = progress.selectedAnswers[getQuestionKey(questionIndex)];

                return (
                  <article key={question.id} className="rounded-lg border border-rose-100 bg-rose-50/70 p-3">
                    <p className="text-sm font-semibold leading-snug text-slate-950">{question.question}</p>
                    <p className="mt-2 text-xs leading-5 text-rose-900">
                      Мой ответ: {question.answers[selectedAnswerIndex] ?? "Нет ответа"}
                    </p>
                    <p className="text-xs leading-5 text-emerald-900">Правильный ответ: {question.correctAnswer}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-bold text-slate-950">{value}</p>
    </div>
  );
}
