import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useDebounce<T extends Array<unknown>>(
  callback: (...args: T) => void,
  delay = 0,
) {
  const t = useRef<NodeJS.Timeout | null>(null);
  const c = useRef(callback);
  useLayoutEffect(() => {
    c.current = callback;
  }, [callback]);

  const debounceCallback = useCallback((...args: T) => {
    if (t.current) clearTimeout(t.current);

    t.current = setTimeout(() => {
      c.current(...args);
      t.current = null;
    }, delay);
  }, [delay]);

  function cancel() {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return [
    debounceCallback,
    cancel,
  ] as const;
};
