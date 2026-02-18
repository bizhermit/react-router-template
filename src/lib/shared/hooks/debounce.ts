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

  const cancel = useCallback(() => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [
    debounceCallback,
    cancel,
  ] as const;
};

export function useDebounceLeading<T extends Array<unknown>>(
  callback: (...args: T) => void,
  delay = 0,
  noExtend = false
) {
  const t = useRef<NodeJS.Timeout | null>(null);
  const c = useRef(callback);
  useLayoutEffect(() => {
    c.current = callback;
  }, [callback]);

  const debounceLeadingCallback = useCallback((...args: T) => {
    if (t.current) {
      if (noExtend) return;
      clearTimeout(t.current);
    }

    const shouldInvoke = !t.current;

    t.current = setTimeout(() => {
      t.current = null;
    }, delay);

    if (shouldInvoke) {
      c.current(...args);
    }
  }, [
    delay,
    noExtend,
  ]);

  const cancel = useCallback(() => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [
    debounceLeadingCallback,
    cancel,
  ] as const;
};
