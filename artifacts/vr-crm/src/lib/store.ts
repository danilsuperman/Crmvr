import { useState, useCallback } from "react";

export function loadStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStore(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useLocalStorage<T>(
  key: string,
  fallback: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => loadStore(key, fallback));

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        saveStore(key, next);
        return next;
      });
    },
    [key]
  );

  return [state, set];
}
