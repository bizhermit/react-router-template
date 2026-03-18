import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * 連続する最後の処理を実行する
 * @param callback 処理
 * @param delay 連続と見なす間隔 @default 0
 * @returns
 */
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

/**
 * 連続する最初の処理を実行し、その後はロックが解除されるまで呼び出しを無視する
 * @param callback 処理
 * @param delay ロックを解除する間隔 @default 0
 * @param noExtend ロック期間を延長しない @default false
 * - false: 連打されるとロック期間が延長される
 * - true: 連打されてもロック期間は延長されない
 * @returns
 */
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
