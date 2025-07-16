import { useRef, useState } from "react";

type State = "idle" | "processing" | "aborted" | "disposed";

export function useAbortController() {
  const controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<State>("idle");

  function create() {
    if (controller.current) {
      controller.current.abort("recreated");
      console.warn("AbortController was recreated without disposal.");
    }
    controller.current = new AbortController();
    setState("processing");
    return controller.current.signal;
  };

  function abort(reason?: unknown) {
    if (!controller.current) {
      console.warn("Cannot abort: the AbortController has already been disposed or was never created.");
      return false;
    }
    controller.current.abort(reason);
    controller.current = null;
    setState("aborted");
    return true;
  };

  function dispose() {
    if (controller.current) {
      controller.current = null;
      setState("disposed");
    }
  };

  return {
    state,
    create,
    abort,
    dispose,
  } as const;
};
