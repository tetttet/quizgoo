import { AnswerButton } from "@/components/AnswerButton";
import { getCorrectAnswerIndex } from "@/lib/quiz-utils";
import type { QuizVariant } from "@/types/quiz";

type QuestionCardProps = {
  variant: QuizVariant;
  questionIndex: number;
  answerOrder: number[];
  selectedAnswerIndex?: number;
  isPaused: boolean;
  onAnswer: (answerIndex: number) => void;
};

export function QuestionCard({
  variant,
  questionIndex,
  answerOrder,
  selectedAnswerIndex,
  isPaused,
  onAnswer,
}: QuestionCardProps) {
  const question = variant.questions[questionIndex];
  const correctAnswerIndex = getCorrectAnswerIndex(variant, questionIndex);
  const hasAnswer = selectedAnswerIndex !== undefined;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 data-testid="question-text" className="text-[17px] font-semibold leading-snug text-slate-950">
        {question.question}
      </h2>

      <div className="mt-4 grid gap-2.5">
        {answerOrder.map((answerIndex) => {
          const isSelected = selectedAnswerIndex === answerIndex;
          const isCorrect = correctAnswerIndex === answerIndex;
          const state = getAnswerState(hasAnswer, isSelected, isCorrect);

          return (
            <AnswerButton
              key={answerIndex}
              text={question.answers[answerIndex]}
              state={state}
              disabled={isPaused || hasAnswer}
              onClick={() => onAnswer(answerIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}

function getAnswerState(hasAnswer: boolean, isSelected: boolean, isCorrect: boolean) {
  if (!hasAnswer) {
    return "idle";
  }

  if (isSelected && isCorrect) {
    return "selected-correct";
  }

  if (isSelected && !isCorrect) {
    return "selected-wrong";
  }

  if (isCorrect) {
    return "correct";
  }

  return "idle";
}
