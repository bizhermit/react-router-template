import { useEffect, useRef, type ReactNode } from "react";
import { SubWindowContext, type SubWindowCloseTrigger, type SubWindowControllerContext } from "../hooks/sub-window";

const DEFAULT_CLOSE_TRIGGER: SubWindowCloseTrigger = {};

export function SubWindowProvider(props: {
  closeTrigger?: SubWindowCloseTrigger;
  initialUrl?: string;
  children?: ReactNode;
}) {
  const wins = useRef<SubWindowControllerContext[]>([]);

  function append(ctx: SubWindowControllerContext) {
    wins.current.push(ctx);
  };

  function closeForPageTransition() {
    for (let i = wins.current.length - 1; i >= 0; i--) {
      const { controller, closeTrigger } = wins.current[i];
      if (closeTrigger.transitionPage) {
        controller.close();
        wins.current.splice(i, 1);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    function beforeUnloadEvent() {
      for (let i = wins.current.length - 1; i >= 0; i--) {
        const { controller, closeTrigger } = wins.current[i];
        if (
          closeTrigger.closeTab ||
          closeTrigger.transitionPage // NOTE: タブを閉じる場合もページ遷移と見なす
        ) {
          controller.close();
          wins.current.splice(i, 1);
        }
      }
    };
    window.addEventListener("beforeunload", beforeUnloadEvent);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadEvent);
    };
  }, []);

  return (
    <SubWindowContext
      value={{
        append,
        closeTrigger: props.closeTrigger ?? DEFAULT_CLOSE_TRIGGER,
        initialUrl: props.initialUrl,
        closeForPageTransition,
      }}
    >
      {props.children}
    </SubWindowContext>
  );
};
