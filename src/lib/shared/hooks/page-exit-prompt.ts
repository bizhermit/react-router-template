import { useLayoutEffect, useRef } from "react";
import { unstable_usePrompt } from "react-router";
import { useText } from "./i18n";

interface Options {
  message?: string;
}

export function usePageExitPropmt(options?: Options) {
  const enabledRef = useRef(false);
  const t = useText();

  // eslint-disable-next-line react-hooks/refs
  unstable_usePrompt({
    when: () => {
      return enabledRef.current;
    },
    message: options?.message ?? (t("formPrompt") || ""),
  });

  useLayoutEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (enabledRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return function handleBlockEnabled(enabled: boolean) {
    return enabledRef.current = enabled;
  };
};
