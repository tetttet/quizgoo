import { QuizApp } from "@/components/QuizApp";
import { getQuizVariants } from "@/lib/quiz-data";

export default function Home() {
  const variants = getQuizVariants();

  return <QuizApp variants={variants} />;
}
