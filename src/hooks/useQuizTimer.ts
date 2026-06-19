"use client";

import { useEffect } from "react";

type UseQuizTimerOptions = {
  isRunning: boolean;
  onTick: () => void;
};

export function useQuizTimer({ isRunning, onTick }: UseQuizTimerOptions) {
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onTick();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, onTick]);
}
