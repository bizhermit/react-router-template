import { createContext, use, useEffect, useRef } from "react";

export interface SubWindowCloseTrigger {
  transitionPage?: boolean;
  closeTab?: boolean;
  unmount?: boolean;
};

interface SubWindowContextProps {
  append: (ctx: SubWindowControllerContext) => void;
  closeTrigger: SubWindowCloseTrigger;
  initialUrl?: string;
};

export const SubWindowContext = createContext<SubWindowContextProps | null>(null);

interface SubWindowParams {
  url?: string;
  target?: string;
  popup?: boolean;
  closed?: () => void;
  blocked?: () => void;
  closeTrigger?: SubWindowCloseTrigger;
  initialUrl?: string;
};

interface SubWindowController {
  window: Window | null;
  replace: (href: string) => boolean;
  close: () => boolean;
  focus: () => boolean;
  isOpened: () => boolean;
};

export interface SubWindowControllerContext {
  controller: SubWindowController;
  closeTrigger: SubWindowCloseTrigger;
};

export function useSubWindow(baseParams?: {
  closeTrigger?: SubWindowCloseTrigger;
  initialUrl?: string;
}) {
  const ctx = use(SubWindowContext);
  const wins = useRef<SubWindowControllerContext[]>([]);

  function open(params?: SubWindowParams) {
    if (typeof window === "undefined") {
      throw new Error("useSubWindow.open() can only be called in a browser environment (window is undefined in SSR).");
    }

    const closeTrigger = {
      ...ctx?.closeTrigger,
      ...baseParams?.closeTrigger,
      ...params?.closeTrigger,
    };

    const win = window.open(
      params?.url || baseParams?.initialUrl || ctx?.initialUrl,
      params?.target,
      [
        params?.popup ? "popup" : undefined,
      ].filter(s => !!s).join(","),
    );

    const controller = {
      window: win,
      replace: function (href) {
        if (!win || win.closed) return false;
        win.location.replace(href);
        return true;
      },
      close: function () {
        if (!win || win.closed) return false;
        win.close();
        params?.closed?.();
        return true;
      },
      focus: function () {
        if (!win || win.closed) return false;
        win.focus();
        return true;
      },
      isOpened: function () {
        return !!win && !win.closed;
      },
    } as const satisfies SubWindowController;

    if (win) {
      const subCtx = {
        controller,
        closeTrigger,
      } as const satisfies SubWindowControllerContext;

      wins.current.push(subCtx);

      if (closeTrigger.transitionPage || closeTrigger.closeTab) {
        if (ctx) {
          ctx.append(subCtx);
        } else {
          console.warn(
            "SubWindowContext is not provided. Auto-close on page transition or tab close is disabled. " +
            "Wrap your component tree with SubWindowProvider to enable this behavior."
          );
        }
      }
    } else {
      console.warn("Failed to open sub window. The popup may have been blocked by the browser.");
      params?.blocked?.();
    }

    return controller;
  };

  function closeAll() {
    wins.current.forEach(win => {
      win.controller.close();
    });
    wins.current = [];
  };

  useEffect(() => {
    return () => {
      wins.current.forEach(win => {
        if (win.closeTrigger.unmount) {
          win.controller.close();
        }
      });
      wins.current = [];
    };
  }, []);

  return {
    open,
    closeAll,
  };
};
