"use client";

import * as React from "react";

import { getRelativeTimeLeft } from "@/lib/utils";

type UseCounterReturn = {
  count: number;
  prettyCount: string;
  increment: (amt: number) => void;
  decrement: (amt: number) => void;
  reset: (resetValue?: number) => void;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};

export function useCounter(initialValue?: number): UseCounterReturn {
  const safeInitial = initialValue ?? 0;
  const [count, setCount] = React.useState(safeInitial);

  const prettyCount = getRelativeTimeLeft(count);

  const increment = React.useCallback((amt = 1) => {
    setCount((x) => x + amt);
  }, []);

  const decrement = React.useCallback((amt = 1) => {
    setCount((x) => x - amt);
  }, []);

  const reset = React.useCallback(
    (resetValue?: number) => {
      if (resetValue !== undefined) setCount(resetValue);
      else setCount(initialValue ?? 0);
    },
    [initialValue]
  );

  return {
    count,
    prettyCount,
    increment,
    decrement,
    reset,
    setCount,
  };
}
