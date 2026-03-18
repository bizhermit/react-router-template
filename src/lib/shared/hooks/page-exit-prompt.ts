import { useLayoutEffect, useRef } from "react";
import { unstable_usePrompt } from "react-router";
import { useText } from "./i18n";

/** ページ離脱制御フック */
interface PageExitPromptOptions {
  /** メッセージ */
  message?: string;
}

/**
 * ページ離脱制御フック
 * @param options
 * @returns
 */
export function usePageExitPrompt(options?: PageExitPromptOptions) {
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
