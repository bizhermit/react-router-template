import { type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { preventScroll } from "../dom/prevent-scroll";
import { Button } from "./button";

interface MessageBoxProps {
  ref?: RefObject<HTMLDivElement>;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  color?: StyleColor;
};

function optimizeEndOfLines(content: ReactNode) {
  if (typeof content !== "string") return content;
  return content.split(/\r\n|\r|\n/g).map((t, i) => {
    return <span key={i}>{t}</span>;
  });
};

function MessageBox(props: MessageBoxProps) {
  return (
    <div
      className="msgbox"
      data-color={props.color}
      ref={props.ref}
    >
      {
        props.header &&
        <div className="msgbox-header">
          {optimizeEndOfLines(props.header)}
        </div>
      }
      {
        props.body &&
        <div className="msgbox-body">
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
  );
};

interface OpenMessageProps {
  role: string;
  component: (props: { close: () => Promise<void>; }) => ReactNode;
};

function openMessage(props: OpenMessageProps) {
  const elem = document.createElement("dialog");
  elem.classList.add("dialog", "msgbox-dialog");
  elem.role = props.role;
  elem.ariaModal = "true";
  const root = createRoot(elem);
  document.body.appendChild(elem);

  function keydownHandler(e: KeyboardEvent) {
    if (e.key === "Escape") e.preventDefault();
  };
  elem.addEventListener("keydown", keydownHandler);

  const releaseScroll = preventScroll();

  const state = {
    closing: false,
    closed: false,
  };
  function close() {
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
        releaseScroll();
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
    });
  };

  root.render(props.component({ close }));
  elem.showModal();

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

export function $alert(props: AlertProps) {
  return new Promise<void>((resolve) => {
    openMessage({
      role: "alert",
      component: ({ close }) => {
        return (
          <MessageBox
            color={props.color}
            header={props.header}
            body={props.body}
            footer={
              <>
                <Button
                  autoFocus
                  color={props.color}
                  onClick={async () => {
                    await close();
                    resolve();
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

export function $confirm(props: ConfirmProps) {
  return new Promise<boolean>((resolve) => {
    openMessage({
      role: "alert",
      component: ({ close }) => {
        return (
          <MessageBox
            color={props.color}
            header={props.header}
            body={props.body}
            footer={
              <>
                <Button
                  color={props.color}
                  onClick={async () => {
                    close();
                    resolve(true);
                  }}
                >
                  {props.positiveButtonText ?? (props.t?.("OK") || "OK")}
                </Button>
                <Button
                  autoFocus
                  appearance="outline"
                  color={props.color}
                  onClick={async () => {
                    close();
                    resolve(false);
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
