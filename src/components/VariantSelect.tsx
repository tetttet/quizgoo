import type { QuizVariant, QuizVariantId, VariantProgressSummary } from "@/types/quiz";

type VariantSelectProps = {
  variants: QuizVariant[];
  summaries: Record<QuizVariantId, VariantProgressSummary>;
  onSelect: (variantId: QuizVariantId) => void;
};

export function VariantSelect({ variants, summaries, onSelect }: VariantSelectProps) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-slate-50 px-4 py-6">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Quizgoo</p>
          <h1 className="mt-1 text-xl font-bold text-slate-950">Выберите вариант</h1>
          <p className="mt-1 text-sm leading-5 text-slate-500">Подготовка по вопросам из JSON-файлов.</p>
        </div>

        <div className="grid gap-2.5">
          {variants.map((variant) => {
            const summary = summaries[variant.id];

            return (
              <button
                key={variant.id}
                type="button"
                data-testid={`variant-${variant.id}`}
                onClick={() => onSelect(variant.id)}
                className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50 active:scale-[0.99]"
              >
                <span>
                  <span className="block text-[15px] font-semibold text-slate-950">{variant.title}</span>
                  {summary?.hasProgress ? (
                    <span className="mt-0.5 block text-xs font-medium text-sky-700">
                      Продолжить - {summary.currentQuestion} из {summary.totalQuestions}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-xs text-slate-500">{variant.questions.length} вопросов</span>
                  )}
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold text-sky-700 shadow-sm">
                  {variant.id}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
