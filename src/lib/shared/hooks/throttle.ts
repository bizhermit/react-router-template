import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useThrottle<T extends Array<unknown>>(
  callback: (...args: T) => void,
  timeout = 0,
  delayFirst = false
) {
  const t = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line react-hooks/purity
  const l = useRef<number>(delayFirst ? Date.now() : 0);
  const c = useRef(callback);
  useLayoutEffect(() => {
    c.current = callback;
  }, [callback]);

  const throttleCallback = useCallback((...args: T) => {
    if (t.current) clearTimeout(t.current);
    const remaining = timeout - (Date.now() - l.current);

    if (remaining <= 0) {
      c.current(...args);
      t.current = null;
      l.current = Date.now();
      return;
    }

    t.current = setTimeout(() => {
      c.current(...args);
      t.current = null;
      l.current = Date.now();
    }, remaining);
  }, [timeout]);

  const cancel = useCallback(() => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
    l.current = delayFirst ? Date.now() : 0;
  }, [delayFirst]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [
    throttleCallback,
    cancel,
  ] as const;
};
