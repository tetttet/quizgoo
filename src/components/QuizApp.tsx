"use client";

import { QuizResult } from "@/components/QuizResult";
import { QuizScreen } from "@/components/QuizScreen";
import { VariantSelect } from "@/components/VariantSelect";
import { useQuizStorage } from "@/hooks/useQuizStorage";
import type { QuizVariant } from "@/types/quiz";

type QuizAppProps = {
  variants: QuizVariant[];
};

export function QuizApp({ variants }: QuizAppProps) {
  const {
    hydrated,
    selectedVariantId,
    progressByVariant,
    summaries,
    openVariant,
    startNewProgress,
    updateProgress,
    setSelectedVariantId,
  } = useQuizStorage(variants);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh w-full items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Загрузка quiz...
        </div>
      </main>
    );
  }

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const selectedProgress = selectedVariantId ? progressByVariant[selectedVariantId] : null;

  if (!selectedVariant || !selectedProgress) {
    return <VariantSelect variants={variants} summaries={summaries} onSelect={openVariant} />;
  }

  const handleBack = () => setSelectedVariantId(null);
  const handleRestart = () => startNewProgress(selectedVariant.id);

  if (selectedProgress.isCompleted) {
    return <QuizResult variant={selectedVariant} progress={selectedProgress} onRestart={handleRestart} onBack={handleBack} />;
  }

  return (
    <QuizScreen
      variant={selectedVariant}
      progress={selectedProgress}
      onProgressChange={(updater) => updateProgress(selectedVariant.id, updater)}
      onRestart={handleRestart}
      onBack={handleBack}
    />
  );
}
