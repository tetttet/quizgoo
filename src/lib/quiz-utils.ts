import type { QuizVariant, StoredQuizProgress } from "@/types/quiz";

const PROGRESS_VERSION = 1;

export function shuffleIndexes(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

export function createQuizProgress(variant: QuizVariant): StoredQuizProgress {
  const now = Date.now();
  const answerOrders: Record<string, number[]> = {};

  variant.questions.forEach((question, questionIndex) => {
    answerOrders[String(questionIndex)] = shuffleIndexes(question.answers.length);
  });

  return {
    version: PROGRESS_VERSION,
    variantId: variant.id,
    questionOrder: shuffleIndexes(variant.questions.length),
    answerOrders,
    currentQuestionIndex: 0,
    selectedAnswers: {},
    results: {},
    elapsedMs: 0,
    isPaused: false,
    isCompleted: false,
    startedAt: now,
    updatedAt: now,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padTime(minutes)}:${padTime(seconds)}`;
  }

  return `${minutes}:${padTime(seconds)}`;
}

export function getQuestionKey(questionIndex: number) {
  return String(questionIndex);
}

export function getCorrectAnswerIndex(variant: QuizVariant, questionIndex: number) {
  const question = variant.questions[questionIndex];

  return Math.max(0, question.answers.indexOf(question.correctAnswer));
}

export function normalizeStoredQuizProgress(
  value: unknown,
  variant: QuizVariant,
): StoredQuizProgress | null {
  if (!isRecord(value) || value.version !== PROGRESS_VERSION) {
    return null;
  }

  if (value.variantId !== variant.id) {
    return null;
  }

  const questionOrder = getValidOrder(value.questionOrder, variant.questions.length);

  if (!questionOrder) {
    return null;
  }

  const answerOrdersInput = isRecord(value.answerOrders) ? value.answerOrders : null;

  if (!answerOrdersInput) {
    return null;
  }

  const answerOrders: Record<string, number[]> = {};

  for (let questionIndex = 0; questionIndex < variant.questions.length; questionIndex += 1) {
    const order = getValidOrder(
      answerOrdersInput[getQuestionKey(questionIndex)],
      variant.questions[questionIndex].answers.length,
    );

    if (!order) {
      return null;
    }

    answerOrders[getQuestionKey(questionIndex)] = order;
  }

  const selectedAnswers = normalizeSelectedAnswers(value.selectedAnswers, variant);
  const results = normalizeResults(value.results, selectedAnswers);
  const currentQuestionIndex = clampInteger(
    value.currentQuestionIndex,
    0,
    Math.max(0, variant.questions.length - 1),
  );

  return {
    version: PROGRESS_VERSION,
    variantId: variant.id,
    questionOrder,
    answerOrders,
    currentQuestionIndex,
    selectedAnswers,
    results,
    elapsedMs: normalizeNonNegativeNumber(value.elapsedMs),
    isPaused: value.isPaused === true,
    isCompleted: value.isCompleted === true,
    startedAt: normalizeNonNegativeNumber(value.startedAt),
    updatedAt: normalizeNonNegativeNumber(value.updatedAt),
  };
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getValidOrder(value: unknown, length: number) {
  if (!Array.isArray(value) || value.length !== length) {
    return null;
  }

  const seen = new Set<number>();

  for (const item of value) {
    if (!Number.isInteger(item) || item < 0 || item >= length || seen.has(item)) {
      return null;
    }

    seen.add(item);
  }

  return value as number[];
}

function normalizeSelectedAnswers(value: unknown, variant: QuizVariant) {
  const selectedAnswers: Record<string, number> = {};

  if (!isRecord(value)) {
    return selectedAnswers;
  }

  for (const [questionKey, selectedAnswerIndex] of Object.entries(value)) {
    const questionIndex = Number(questionKey);

    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= variant.questions.length) {
      continue;
    }

    if (
      typeof selectedAnswerIndex === "number" &&
      Number.isInteger(selectedAnswerIndex) &&
      selectedAnswerIndex >= 0 &&
      selectedAnswerIndex < variant.questions[questionIndex].answers.length
    ) {
      selectedAnswers[questionKey] = selectedAnswerIndex;
    }
  }

  return selectedAnswers;
}

function normalizeResults(value: unknown, selectedAnswers: Record<string, number>) {
  const results: Record<string, boolean> = {};

  if (!isRecord(value)) {
    return results;
  }

  for (const questionKey of Object.keys(selectedAnswers)) {
    if (typeof value[questionKey] === "boolean") {
      results[questionKey] = value[questionKey];
    }
  }

  return results;
}

function clampInteger(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeNonNegativeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}
