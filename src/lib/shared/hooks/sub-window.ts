import { createContext, use, useEffect, useRef } from "react";

/** サブウィンドウ クローズトリガー */
export interface SubWindowCloseTrigger {
  /** ページ遷移 */
  transitionPage?: boolean;
  /** タブクローズ */
  closeTab?: boolean;
  /** コンポーネントアンマウント */
  unmount?: boolean;
};

/** サブウィンドウコンテキスト Props */
interface SubWindowContextProps {
  /**
   * 追加
   * @param ctx
   * @returns
   */
  append: (ctx: SubWindowControllerContext) => void;
  /** サブウィンドウ クローズトリガー */
  closeTrigger: SubWindowCloseTrigger;
  /** サブウィンドウ デフォルトURL */
  initialUrl?: string;
  /**
   * ページ遷移でクローズするサブウィンドウをクローズする
   * @returns
   */
  closeForPageTransition: () => void;
};

/** サブウィンドウコンテキスト */
export const SubWindowContext = createContext<SubWindowContextProps | null>(null);

/** サブウィンドウ Params */
interface SubWindowParams {
  /** URL */
  url?: string;
  /** target */
  target?: string;
  /** ポップアップウィンドウ @default false */
  popup?: boolean;
  /** クローズコールバック */
  closed?: () => void;
  /** ブロックコールバック */
  blocked?: () => void;
  /** クローズトリガー */
  closeTrigger?: SubWindowCloseTrigger;
  /** デフォルトURL */
  initialUrl?: string;
};

/** サブウィンドウコントローラー */
interface SubWindowController {
  /** window */
  window: Window | null;
  /**
   * URLを変更する
   * @param href 新しいURL
   * @returns
   */
  replace: (href: string) => boolean;
  /**
   * クローズする
   * @returns
   */
  close: () => boolean;
  /**
   * フォーカスする
   */
  focus: () => boolean;
  /**
   * サブウィンドウが開かれているかどうか
   * @returns
   */
  isOpened: () => boolean;
};

/** サブウィンドウコントローラーコンテキスト */
export interface SubWindowControllerContext {
  /** コントローラー */
  controller: SubWindowController;
  /** クローズトリガー */
  closeTrigger: SubWindowCloseTrigger;
};

/**
 * サブウィンドウフック
 * @param baseParams
 * @returns
 */
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
