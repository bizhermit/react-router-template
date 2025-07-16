import { useRef, useState } from "react";

type State = "idle" | "processing" | "aborted" | "disposed";

export function useAbortController() {
  const controller = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<State>("idle");

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

  function abort(reason?: unknown) {
    if (!controller.current) {
      console.warn("Cannot abort: the AbortController has already been disposed or was never created.");
      return false;
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

  function dispose() {
    if (controller.current) {
      controller.current = null;
      setState("disposed");
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  async function start<T>(process: (signal: AbortSignal) => Promise<T>, timeout?: number) {
    try {
      return await process(create(timeout)) as T;
    } finally {
      dispose();
    }
  };

  return {
    state,
    start,
    create,
    abort,
    dispose,
  } as const;
};
