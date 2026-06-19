"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createQuizProgress, normalizeStoredQuizProgress } from "@/lib/quiz-utils";
import {
  QUIZ_VARIANT_IDS,
  type QuizVariant,
  type QuizVariantId,
  type StoredQuizProgress,
  type VariantProgressSummary,
} from "@/types/quiz";

const SELECTED_VARIANT_KEY = "quizgoo:selected-variant";

type ProgressByVariant = Record<QuizVariantId, StoredQuizProgress | null>;

type ProgressUpdater = (progress: StoredQuizProgress) => StoredQuizProgress;

const EMPTY_PROGRESS: ProgressByVariant = {
  "1": null,
  "2": null,
  "3": null,
  "4": null,
};

export function useQuizStorage(variants: QuizVariant[]) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedVariantId, setSelectedVariantIdState] = useState<QuizVariantId | null>(null);
  const [progressByVariant, setProgressByVariant] = useState<ProgressByVariant>(EMPTY_PROGRESS);

  const variantMap = useMemo(() => new Map(variants.map((variant) => [variant.id, variant])), [variants]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextProgressByVariant: ProgressByVariant = { ...EMPTY_PROGRESS };

      for (const variant of variants) {
        nextProgressByVariant[variant.id] = readStoredProgress(variant);
      }

      const selectedVariant = readSelectedVariant();

      setProgressByVariant(nextProgressByVariant);
      setSelectedVariantIdState(selectedVariant);
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [variants]);

  const setSelectedVariantId = useCallback((variantId: QuizVariantId | null) => {
    setSelectedVariantIdState(variantId);

    if (variantId) {
      window.localStorage.setItem(SELECTED_VARIANT_KEY, variantId);
      return;
    }

    window.localStorage.removeItem(SELECTED_VARIANT_KEY);
  }, []);

  const startNewProgress = useCallback(
    (variantId: QuizVariantId) => {
      const variant = variantMap.get(variantId);

      if (!variant) {
        return;
      }

      const progress = createQuizProgress(variant);

      window.localStorage.setItem(getProgressKey(variantId), JSON.stringify(progress));
      setProgressByVariant((currentProgress) => ({
        ...currentProgress,
        [variantId]: progress,
      }));
      setSelectedVariantId(variantId);
    },
    [setSelectedVariantId, variantMap],
  );

  const openVariant = useCallback(
    (variantId: QuizVariantId) => {
      const existingProgress = progressByVariant[variantId];

      if (existingProgress) {
        setSelectedVariantId(variantId);
        return;
      }

      startNewProgress(variantId);
    },
    [progressByVariant, setSelectedVariantId, startNewProgress],
  );

  const updateProgress = useCallback((variantId: QuizVariantId, updater: ProgressUpdater) => {
    setProgressByVariant((currentProgress) => {
      const existingProgress = currentProgress[variantId];

      if (!existingProgress) {
        return currentProgress;
      }

      const nextProgress = {
        ...updater(existingProgress),
        updatedAt: Date.now(),
      };

      window.localStorage.setItem(getProgressKey(variantId), JSON.stringify(nextProgress));

      return {
        ...currentProgress,
        [variantId]: nextProgress,
      };
    });
  }, []);

  const summaries = useMemo(() => {
    return variants.reduce(
      (accumulator, variant) => {
        const progress = progressByVariant[variant.id];

        accumulator[variant.id] = {
          hasProgress: Boolean(progress && !progress.isCompleted),
          isCompleted: Boolean(progress?.isCompleted),
          currentQuestion: progress ? progress.currentQuestionIndex + 1 : 1,
          totalQuestions: variant.questions.length,
        };

        return accumulator;
      },
      {} as Record<QuizVariantId, VariantProgressSummary>,
    );
  }, [progressByVariant, variants]);

  return {
    hydrated,
    selectedVariantId,
    progressByVariant,
    summaries,
    openVariant,
    startNewProgress,
    updateProgress,
    setSelectedVariantId,
  };
}

function getProgressKey(variantId: QuizVariantId) {
  return `quizgoo:progress:${variantId}`;
}

function readSelectedVariant() {
  const storedValue = window.localStorage.getItem(SELECTED_VARIANT_KEY);

  return QUIZ_VARIANT_IDS.includes(storedValue as QuizVariantId) ? (storedValue as QuizVariantId) : null;
}

function readStoredProgress(variant: QuizVariant) {
  const storedValue = window.localStorage.getItem(getProgressKey(variant.id));

  if (!storedValue) {
    return null;
  }

  try {
    return normalizeStoredQuizProgress(JSON.parse(storedValue), variant);
  } catch {
    return null;
  }
}
