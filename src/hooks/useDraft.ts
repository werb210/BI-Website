import { useEffect, useState } from "react";

export function useDraft<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;

    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  };

  return { state, setState, clearDraft };
}
