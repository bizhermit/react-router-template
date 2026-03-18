import { type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { preventScroll } from "../../client/dom/prevent-scroll";
import { Button } from "./button/button";
import { FocusTrap } from "./focus-trap";
import { parseToReactNode } from "./i18n-text";
import { CrossIcon } from "./icon";
import { clsx, getColorClassName } from "./utilities";

/** メッセージボックスオプション */
interface MessageBoxOptions {
  /** ref */
  ref?: RefObject<HTMLDivElement>;
  /** ヘッダー */
  header?: ReactNode;
  /** ヘッダーID */
  headerId?: string;
  /** ボディ */
  body?: ReactNode;
  /** ボディID */
  bodyId?: string;
  /** フッター */
  footer?: ReactNode;
  /** フッターID */
  color?: StyleColor;
};

/** メッセージボックス Props */
type MessageBoxProps = Overwrite<
  Omit<HTMLAttributes<HTMLDivElement>, "children">,
  MessageBoxOptions
>;

/**
 * ReactNodeへ変換（文字列の場合のみ）
 * @param content
 * @returns
 */
function optimizeEndOfLines(content: ReactNode) {
  if (typeof content !== "string") return content;
  return parseToReactNode(content);
};

/**
 * メッセージボックス
 * @param param {@link MessageBoxProps}
 * @returns
 */
function MessageBox({
  ref,
  header,
  headerId,
  body,
  bodyId,
  footer,
  color,
  className,
  ...props
}: MessageBoxProps) {
  return (
    <FocusTrap>
      <div
        {...props}
        className={clsx(
          "_msgbox",
          getColorClassName(color),
          className,
        )}
        ref={ref}
      >
        {
          header &&
          <div
            className="_msgbox-header"
            id={headerId}
          >
            {optimizeEndOfLines(header)}
          </div>
        }
        {
          body &&
          <div
            className="_msgbox-body"
            id={bodyId}
          >
            {optimizeEndOfLines(body)}
          </div>
        }
        {
          footer &&
          <div
            className="_msgbox-footer"
          >
            {footer}
          </div>
        }
      </div>
    </FocusTrap>
  );
};

/** メッセージボックス表示オプション */
interface OpenMessageProps {
  /** モーダル/モードレス */
  modeless?: boolean;
  /**
   * メッセージボックス要素構築コールバック
   * @param element
   * @returns
   */
  setupElement: (element: HTMLDialogElement) => void;
  /**
   * 表示コンポーネント
   * @param props
   * @returns
   */
  component: (
    props: {
      /**
       * クローズトリガー
       * @param value
       * @returns
       */
      close: (value?: unknown) => Promise<void>;
    }
  ) => ReactNode;
  /** Escapeクローズ時の戻り値 */
  escapeValue?: unknown;
  /**
   * クローズコールバック
   * @param value
   * @returns
   */
  closeCallback?: (value: unknown) => void;
};

/**
 * メッセージボックス表示
 * @param props {@link OpenMessageProps}
 * @returns
 */
function openMessage(props: OpenMessageProps) {
  const elem = document.createElement("dialog");
  elem.classList.add("_dialog", "_msgbox-dialog");
  props.setupElement(elem);
  const root = createRoot(elem);
  document.body.appendChild(elem);

  function keydownHandler(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close(props.escapeValue);
    }
  };
  elem.addEventListener("keydown", keydownHandler);

  const releaseScroll = props.modeless ? undefined : preventScroll();

  const state = {
    closing: false,
    closed: false,
  };
  function close(value: unknown) {
    state.closing = true;
    return new Promise<void>(resolve => {
      function unmount(e?: TransitionEvent) {
        if (state.closed) return;
        elem.inert = true;
        if (e != null && (e.target !== e.currentTarget || !e.pseudoElement)) return;
        elem.removeEventListener("transitioncancel", unmount);
        elem.removeEventListener("transitionend", unmount);
        elem.removeEventListener("keydown", keydownHandler);
        root.unmount();
        releaseScroll?.();
        document.body.removeChild(elem);
        resolve();
        state.closing = false;
        state.closed = true;
      };

      elem.addEventListener("transitioncancel", unmount);
      elem.addEventListener("transitionend", unmount);
      setTimeout(() => {
        // NOTE: firefox is not work closing transition.
        if (!state.closed) unmount();
      }, 300);
      elem.close();
      props.closeCallback?.(value);
    });
  };

  root.render(props.component({ close }));
  if (props.modeless) {
    elem.show();
  } else {
    elem.showModal();
  }

  return {
    state,
    close,
  } as const;
};

/** メッセージボックス 抽象Props */
interface MessageBaseProps {
  /** ヘッダー */
  header?: ReactNode;
  /** ボディ */
  body?: ReactNode;
  /** 配色 */
  color?: StyleColor;
  /** i18nアクセサー */
  t?: I18nGetter;
};

/** アラートメッセージ Props */
interface AlertProps extends MessageBaseProps {
  /** ボタンテキスト */
  buttonText?: ReactNode;
};

const ALERT_HEADER_ID = "$alert-title"; // デフォルトアラートメッセージヘッダーIDプレフィックス
const ALERT_BODY_ID = "$alert-body"; // デフォルトアラートメッセージボディIDプレフィックス
let alertIncrementId = 0; // アラートメッセージIDカウンター

/**
 * アラートメッセージ
 * - 処理インターセプト用
 * @param props {@link AlertProps}
 * @returns
 */
export function $alert(props: AlertProps) {
  return new Promise<void>((resolve) => {
    const id = alertIncrementId++;
    const headerId = `${ALERT_HEADER_ID}_${id}`;
    const bodyId = `${ALERT_BODY_ID}_${id}`;
    openMessage({
      setupElement: (elem) => {
        elem.setAttribute("role", "alertdialog");
        elem.setAttribute("aria-modal", "true");
        if (props.header) {
          elem.setAttribute("aria-labelledby", headerId);
        }
        if (props.body) {
          elem.setAttribute("aria-describedby", bodyId);
        }
      },
      closeCallback: () => {
        resolve();
      },
      component: ({ close }) => {
        return (
          <MessageBox
            color={props.color}
            header={props.header}
            headerId={headerId}
            body={props.body}
            bodyId={bodyId}
            footer={(
              <Button
                autoFocus
                color={props.color}
                appearance="fill"
                onClick={async () => {
                  close();
                }}
              >
                {props.buttonText ?? (props.t?.("OK") || "OK")}
              </Button>
            )}
          />
        );
      },
    });
  });
};

/** 確認メッセージ Props */
interface ConfirmProps extends MessageBaseProps {
  /** ポジティブボタンテキスト */
  positiveButtonText?: ReactNode;
  /** ネガティブボタンテキスト */
  nevativeButtonText?: ReactNode;
};

const CONFIRM_HEADER_ID = "$confirm-title"; // デフォルト確認メッセージヘッダーIDプレフィックス
const CONFIRM_BODY_ID = "$confirm-body"; // デフォルト確認メッセージボディIDプレフィックス
let confirmIncrementId = 0; // 確認メッセージIDカウンター

/**
 * 確認メッセージ
 * - 処理インターセプト用
 * @param props {@link ConfirmProps}
 * @returns
 */
export function $confirm(props: ConfirmProps) {
  return new Promise<boolean>((resolve) => {
    const id = confirmIncrementId++;
    const headerId = `${CONFIRM_HEADER_ID}_${id}`;
    const bodyId = `${CONFIRM_BODY_ID}_${id}`;
    openMessage({
      setupElement: (elem) => {
        elem.setAttribute("role", "alertdialog");
        elem.setAttribute("aria-modal", "true");
        if (props.header) {
          elem.setAttribute("aria-labelledby", headerId);
        }
        if (props.body) {
          elem.setAttribute("aria-describedby", bodyId);
        }
      },
      escapeValue: false,
      closeCallback: (v) => {
        resolve(v as boolean);
      },
      component: ({ close }) => {
        return (
          <MessageBox
            color={props.color}
            header={props.header}
            headerId={headerId}
            body={props.body}
            bodyId={bodyId}
            footer={(
              <>
                <Button
                  color={props.color}
                  appearance="fill"
                  onClick={async () => {
                    close(true);
                  }}
                >
                  {props.positiveButtonText ?? (props.t?.("OK") || "OK")}
                </Button>
                <Button
                  autoFocus
                  color={props.color}
                  appearance="outline"
                  onClick={async () => {
                    close(false);
                  }}
                >
                  {props.nevativeButtonText ?? (props.t?.("Cancel") || "キャンセル")}
                </Button>
              </>
            )}
          />
        );
      },
    });
  });
};

/** トーストメッセージ Props */
interface ToastProps extends Omit<MessageBaseProps, "header"> {
  /** 表示時間 @default 10000 (ms) */
  duration?: number | false;
  /** ロール @default "status" */
  role?: "status" | "alert";
};

/**
 * トーストメッセージ
 * @param props {@link ToastProps}
 * @returns
 */
export function $toast({
  role = "status",
  duration = 10000,
  ...props
}: ToastProps) {
  return new Promise<void>((resolve) => {
    let timeout: NodeJS.Timeout | null;
    openMessage({
      modeless: true,
      setupElement: (elem) => {
        elem.setAttribute("role", role);
        elem.setAttribute(
          "aria-live",
          role === "alert" ? "assertive" : "polite"
        );
      },
      closeCallback: () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        resolve();
      },
      component: ({ close }) => {
        if (duration !== false) {
          timeout = setTimeout(() => {
            close();
          }, duration);
        }
        return (
          <div
            className="_msgbox-toast"
          >
            <div
              className="_msgbox-toast-body"
            >
              {optimizeEndOfLines(props.body)}
            </div>
            <Button
              appearance="text"
              color={props.color}
              onClick={() => {
                close();
              }}
            >
              <CrossIcon />
            </Button>
          </div>
        );
      },
    });
  });
};
