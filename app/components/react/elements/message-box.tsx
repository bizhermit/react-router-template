import { type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { parseToReactNode } from "~/components/react/elements/i18n-text";
import { preventScroll } from "../../client/dom/prevent-scroll";
import { Button } from "./button";
import { FocusTrap } from "./focus-trap";
import { CrossIcon } from "./icon";
import { clsx, getColorClassName } from "./utilities";

interface MessageBoxProps {
  ref?: RefObject<HTMLDivElement>;
  header?: ReactNode;
  headerId?: string;
  body?: ReactNode;
  bodyId?: string;
  footer?: ReactNode;
  color?: StyleColor;
};

function optimizeEndOfLines(content: ReactNode) {
  if (typeof content !== "string") return content;
  return parseToReactNode(content);
};

function MessageBox(props: MessageBoxProps) {
  return (
    <FocusTrap>
      <div
        className={clsx("msgbox", getColorClassName(props.color))}
        ref={props.ref}
      >
        {
          props.header &&
          <div
            className="msgbox-header"
            id={props.headerId}
          >
            {optimizeEndOfLines(props.header)}
          </div>
        }
        {
          props.body &&
          <div
            className="msgbox-body"
            id={props.bodyId}
          >
            {optimizeEndOfLines(props.body)}
          </div>
        }
        {
          props.footer &&
          <div className="msgbox-footer">
            {props.footer}
          </div>
        }
      </div>
    </FocusTrap>
  );
};

interface OpenMessageProps {
  modeless?: boolean;
  setupElement: (element: HTMLDialogElement) => void;
  component: (props: { close: (value?: unknown) => Promise<void>; }) => ReactNode;
  escapeValue?: unknown;
  closeCallback?: (value: unknown) => void;
};

function openMessage(props: OpenMessageProps) {
  const elem = document.createElement("dialog");
  elem.classList.add("dialog", "msgbox-dialog");
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

interface MessageBaseProps {
  header?: ReactNode;
  body?: ReactNode;
  color?: StyleColor;
  t?: I18nGetter;
};

interface AlertProps extends MessageBaseProps {
  buttonText?: ReactNode;
};

const ALERT_HEADER_ID = "$alert-title";
const ALERT_BODY_ID = "$alert-body";
let alertIncrementId = 0;

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
            footer={
              <>
                <Button
                  autoFocus
                  color={props.color}
                  onClick={async () => {
                    close();
                  }}
                >
                  {props.buttonText ?? (props.t?.("OK") || "OK")}
                </Button>
              </>
            }
          />
        );
      },
    });
  });
};

interface ConfirmProps extends MessageBaseProps {
  positiveButtonText?: ReactNode;
  nevativeButtonText?: ReactNode;
};

const CONFIRM_HEADER_ID = "$confirm-title";
const CONFIRM_BODY_ID = "$confirm-body";
let confirmIncrementId = 0;

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
            footer={
              <>
                <Button
                  color={props.color}
                  onClick={async () => {
                    close(true);
                  }}
                >
                  {props.positiveButtonText ?? (props.t?.("OK") || "OK")}
                </Button>
                <Button
                  autoFocus
                  appearance="outline"
                  color={props.color}
                  onClick={async () => {
                    close(false);
                  }}
                >
                  {props.nevativeButtonText ?? (props.t?.("Cancel") || "キャンセル")}
                </Button>
              </>
            }
          />
        );
      },
    });
  });
};

interface ToastProps extends Omit<MessageBaseProps, "header"> {
  duration?: number | false;
  role?: "status" | "alert";
};

export function $toast(props: ToastProps) {
  return new Promise<void>((resolve) => {
    let timeout: NodeJS.Timeout | null;
    openMessage({
      modeless: true,
      setupElement: (elem) => {
        elem.setAttribute("role", props.role ?? "status");
        elem.setAttribute("aria-live", props.role === "alert" ? "assertive" : "polite");
      },
      closeCallback: () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        resolve();
      },
      component: ({ close }) => {
        if (props.duration !== false) {
          timeout = setTimeout(() => {
            close();
          }, props.duration ?? 10000);
        }
        return (
          <div className="msgbox-toast">
            <div
              className="msgbox-toast-body"
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
