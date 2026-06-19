export const QUIZ_VARIANT_IDS = ["1", "2", "3", "4"] as const;

export type QuizVariantId = (typeof QUIZ_VARIANT_IDS)[number];

export type QuizQuestion = {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
};

export type QuizVariant = {
  id: QuizVariantId;
  title: string;
  questions: QuizQuestion[];
};

export type StoredQuizProgress = {
  version: 1;
  variantId: QuizVariantId;
  questionOrder: number[];
  answerOrders: Record<string, number[]>;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, number>;
  results: Record<string, boolean>;
  elapsedMs: number;
  isPaused: boolean;
  isCompleted: boolean;
  startedAt: number;
  updatedAt: number;
};

export type VariantProgressSummary = {
  hasProgress: boolean;
  isCompleted: boolean;
  currentQuestion: number;
  totalQuestions: number;
};
