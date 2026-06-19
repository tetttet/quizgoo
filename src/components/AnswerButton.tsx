type AnswerButtonState = "idle" | "selected-correct" | "selected-wrong" | "correct";

type AnswerButtonProps = {
  text: string;
  state: AnswerButtonState;
  disabled: boolean;
  onClick: () => void;
};

const stateClasses: Record<AnswerButtonState, string> = {
  idle: "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50 active:scale-[0.99]",
  "selected-correct": "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]",
  "selected-wrong": "border-rose-500 bg-rose-50 text-rose-950 shadow-[0_0_0_1px_rgba(244,63,94,0.22)]",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-950",
};

export function AnswerButton({ text, state, disabled, onClick }: AnswerButtonProps) {
  return (
    <button
      type="button"
      data-testid="answer-button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 w-full rounded-lg border px-3 py-2.5 text-left text-[15px] leading-snug transition disabled:cursor-not-allowed disabled:opacity-70 ${stateClasses[state]}`}
    >
      {text}
    </button>
  );
}
