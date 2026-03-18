import { useEffect, useRef, useState } from "react";

/** 状態 */
type State = "idle" | "processing" | "aborted" | "disposed";

/** Abortコントローラーオプション */
interface AbortControllerOptions {
  /** アンマウント時に中止処理を実行しない @default false */
  preventAbortOnUnmount?: boolean;
};

/**
 * Abortコントローラーフック
 * @param options {@link AbortControllerOptions}
 * @returns
 */
export function useAbortController(options?: AbortControllerOptions) {
  const controller = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortCallbackRef = useRef<((reason: unknown) => void) | null>(null);
  const [state, setState] = useState<State>("idle");

  /**
   * コントローラー作成
   * @param timeout
   * @returns
   */
  function create(timeout?: number) {
    if (controller.current) {
      controller.current.abort("recreated");
      console.warn("AbortController was recreated without disposal.");
    }
    controller.current = new AbortController();
    setState("processing");
    if (timeout != null) {
      timeoutRef.current = setTimeout(() => {
        if (controller.current) {
          abort("timeout");
        }
        timeoutRef.current = null;
      }, timeout);
    }
    return controller.current.signal;
  };

  /**
   * 中断する
   * @param reason
   * @returns
   */
  function abort(reason?: unknown) {
    if (!controller.current) {
      console.warn("Cannot abort: the AbortController has already been disposed or was never created.");
      return false;
    }
    if (abortCallbackRef.current) {
      abortCallbackRef.current(reason);
      abortCallbackRef.current = null;
    }
    controller.current.abort(reason);
    controller.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState("aborted");
    return true;
  };

  /**
   * 開放
   */
  function dispose() {
    if (controller.current) {
      controller.current = null;
      abortCallbackRef.current = null;
      setState("disposed");
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  function setAbortCallback(callback: typeof abortCallbackRef.current) {
    abortCallbackRef.current = callback;
  };

  /**
   * 開始
   * @param process 処理
   * @param timeout タイムアウト時間
   * @returns
   */
  async function start<T>(process: (
    signal: AbortSignal,
    setAbortCallback: (callback: typeof abortCallbackRef.current) => void
  ) => Promise<T>, timeout?: number) {
    try {
      setAbortCallback(null);
      return await process(create(timeout), setAbortCallback) as T;
    } finally {
      dispose();
    }
  };

  useEffect(() => {
    return () => {
      if (options?.preventAbortOnUnmount) return;
      if (!controller.current) return;
      abort("unmount");
    };
  }, []);

  return {
    state,
    start,
    create,
    abort,
    dispose,
    setAbortCallback,
  } as const;
};
