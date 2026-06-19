import variant1 from "@/data/variants/1.json";
import variant2 from "@/data/variants/2.json";
import variant3 from "@/data/variants/3.json";
import variant4 from "@/data/variants/4.json";
import { QUIZ_VARIANT_IDS, type QuizQuestion, type QuizVariant, type QuizVariantId } from "@/types/quiz";

type RawQuestion = {
  question?: unknown;
  options?: unknown;
  correct_answer?: unknown;
};

const RAW_VARIANTS = {
  "1": variant1,
  "2": variant2,
  "3": variant3,
  "4": variant4,
} satisfies Record<QuizVariantId, unknown>;

export function getQuizVariants(): QuizVariant[] {
  return QUIZ_VARIANT_IDS.map((id) => {
    const rawQuestions = readVariantFile(id);

    return {
      id,
      title: `Вариант ${id}`,
      questions: rawQuestions.map((question, index) => normalizeQuestion(question, id, index)),
    };
  });
}

function readVariantFile(id: QuizVariantId): RawQuestion[] {
  const parsed = RAW_VARIANTS[id];

  if (!Array.isArray(parsed)) {
    throw new Error(`${id}.json должен быть массивом вопросов`);
  }

  return parsed as RawQuestion[];
}

function normalizeQuestion(rawQuestion: RawQuestion, variantId: QuizVariantId, index: number): QuizQuestion {
  const question = normalizeText(rawQuestion.question);
  const answers = normalizeAnswers(rawQuestion.options, variantId, index);
  const rawCorrectAnswer = normalizeText(rawQuestion.correct_answer);
  const correctAnswer = findCorrectAnswer(answers, rawCorrectAnswer);

  if (!question) {
    throw new Error(`${variantId}.json, вопрос ${index + 1}: пустой текст вопроса`);
  }

  if (!correctAnswer) {
    throw new Error(`${variantId}.json, вопрос ${index + 1}: правильный ответ не найден среди вариантов`);
  }

  return {
    id: `${variantId}-${index}`,
    question,
    answers,
    correctAnswer,
  };
}

function normalizeAnswers(value: unknown, variantId: QuizVariantId, index: number) {
  if (!Array.isArray(value)) {
    throw new Error(`${variantId}.json, вопрос ${index + 1}: поле options должно быть массивом`);
  }

  const answers = value.map((answer) => normalizeText(answer)).filter(Boolean);

  if (answers.length !== 4) {
    throw new Error(`${variantId}.json, вопрос ${index + 1}: должно быть ровно 4 варианта ответа`);
  }

  return answers;
}

function findCorrectAnswer(answers: string[], rawCorrectAnswer: string) {
  const exactAnswer = answers.find((answer) => answer === rawCorrectAnswer);

  if (exactAnswer) {
    return exactAnswer;
  }

  const normalizedCorrectAnswer = normalizeForCompare(rawCorrectAnswer);
  const normalizedAnswer = answers.find((answer) => normalizeForCompare(answer) === normalizedCorrectAnswer);

  if (normalizedAnswer) {
    return normalizedAnswer;
  }

  const closestAnswer = answers
    .map((answer) => ({
      answer,
      similarity: getSimilarityScore(normalizeForCompare(answer), normalizedCorrectAnswer),
    }))
    .sort((left, right) => right.similarity - left.similarity)[0];

  return closestAnswer?.similarity && closestAnswer.similarity > 0.72 ? closestAnswer.answer : null;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeForCompare(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function getSimilarityScore(left: string, right: string) {
  if (!left || !right) {
    return 0;
  }

  const leftTokens = new Set(left.split(" "));
  const rightTokens = new Set(right.split(" "));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  return union === 0 ? 0 : intersection / union;
}
