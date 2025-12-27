import { useEffect, useImperativeHandle, useRef, useState, type DialogHTMLAttributes, type MouseEvent, type RefObject } from "react";
import { preventScroll } from "../../client/dom/prevent-scroll";
import throttle from "../../shared/timing/throttle";
import { clsx } from "./utilities";

interface DialogRef {
  element: HTMLDialogElement;
  showModal: () => void;
  show: () => void;
  close: () => void;
  resetPosition: () => void;
};

export function useDialog() {
  return useRef<DialogRef | null>(null);
};

interface DialogAnchor {
  element?: RefObject<HTMLElement>;
  x?: "inner" | "outer" | "center" | "inner-left" | "inner-right" | "outer-left" | "outer-right";
  y?: "inner" | "outer" | "center" | "inner-top" | "inner-bottom" | "outer-top" | "outer-bottom";
  flexible?: boolean;
  width?: "fill";
  height?: "fill";
};

interface DialogOptions {
  ref?: RefObject<DialogRef | null>;
  defaultOpen?: "modal" | "modeless";
  anchor?: DialogAnchor;
  preventRootScroll?: boolean;
  closeWhenScrolled?: boolean;
  preventCloseWhenClickOuter?: boolean;
  preventEscapeClose?: boolean;
};

type DialogProps = Overwrite<
  DialogHTMLAttributes<HTMLDialogElement>,
  DialogOptions
>;

export function Dialog({
  ref,
  defaultOpen,
  anchor,
  preventRootScroll,
  closeWhenScrolled,
  preventCloseWhenClickOuter,
  preventEscapeClose,
  className,
  ...props
}: DialogProps) {
  const dref = useRef<HTMLDialogElement>(null!);
  const [state, setState] = useState<"closed" | "modeless" | "modal">(() => {
    return defaultOpen || "closed";
  });

  function resetPosition() {
    if (anchor == null) {
      dref.current.setAttribute("data-center", "true");
      dref.current.style.removeProperty("top");
      dref.current.style.removeProperty("bottom");
      dref.current.style.removeProperty("left");
      dref.current.style.removeProperty("right");
      return;
    }
    dref.current.removeAttribute("data-center");

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const wMax = dref.current.offsetWidth;
    const hMax = dref.current.offsetHeight;
    const posX = anchor.x || "center";
    const posY = anchor.y || "center";
    let rect = { top: 0, bottom: 0, left: 0, right: 0, width: winW, height: winH };

    const parseStyleNum = (num: number) => `${num}px`;

    rect = anchor.element?.current.getBoundingClientRect()
      ?? document.documentElement.getBoundingClientRect();

    switch (anchor.width) {
      case "fill":
        dref.current.style.width = parseStyleNum(rect.width);
        break;
      default:
        break;
    }

    switch (anchor.height) {
      case "fill":
        dref.current.style.height = parseStyleNum(rect.height);
        break;
      default:
        break;
    }

    const posAbs = anchor.flexible === false;

    const scrollLeft = 0;
    switch (posX) {
      case "center":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.left + rect.width / 2 - wMax / 2 + scrollLeft :
          Math.min(Math.max(0, rect.left + rect.width / 2 - wMax / 2 + scrollLeft), winW - wMax + scrollLeft)
        );
        break;
      case "inner":
        if (rect.left + wMax > winW && rect.right >= wMax) {
          dref.current.style.left = "unset";
          dref.current.style.right = parseStyleNum(winW - rect.right);
        } else {
          dref.current.style.right = "unset";
          dref.current.style.left = parseStyleNum(Math.min(rect.left, winW - wMax));
        }
        break;
      case "inner-left":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.left :
          Math.min(rect.left, winW - wMax)
        );
        break;
      case "inner-right":
        dref.current.style.left = "unset";
        dref.current.style.right = parseStyleNum(posAbs ?
          winW - rect.right :
          winW - Math.max(rect.right, wMax)
        );
        break;
      case "outer":
        if (rect.right + wMax > winW && rect.left >= wMax) {
          dref.current.style.left = "unset";
          dref.current.style.right = parseStyleNum(winW - rect.left);
        } else {
          dref.current.style.right = "unset";
          dref.current.style.left = parseStyleNum(Math.min(rect.right, winW - wMax));
        }
        break;
      case "outer-left":
        dref.current.style.left = "unset";
        dref.current.style.right = parseStyleNum(posAbs ?
          winW - rect.left :
          Math.min(winW - rect.left, winW - wMax)
        );
        break;
      case "outer-right":
        dref.current.style.right = "unset";
        dref.current.style.left = parseStyleNum(posAbs ?
          rect.right :
          Math.min(rect.right, winW - wMax)
        );
        break;
      default: break;
    }

    const scrollTop = 0;
    switch (posY) {
      case "center":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.top + rect.height / 2 - hMax / 2 + scrollTop :
          Math.min(Math.max(0, rect.top + rect.height / 2 - hMax / 2 + scrollTop), winH - hMax + scrollTop)
        );
        break;
      case "inner":
        if (rect.bottom > winH - rect.top && rect.bottom >= hMax) {
          dref.current.style.top = "unset";
          dref.current.style.bottom = parseStyleNum(winH - rect.bottom);
        } else {
          dref.current.style.bottom = "unset";
          dref.current.style.top = parseStyleNum(Math.min(rect.top, winH - hMax));
        }
        break;
      case "inner-top":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.top :
          Math.min(rect.top, winH - hMax)
        );
        break;
      case "inner-bottom":
        dref.current.style.top = "unset";
        dref.current.style.bottom = parseStyleNum(posAbs ?
          winH - rect.bottom :
          Math.min(winH - rect.bottom, winH - hMax)
        );
        break;
      case "outer":
        if (rect.top > winH - rect.bottom && rect.top >= hMax) {
          dref.current.style.top = "unset";
          dref.current.style.bottom = parseStyleNum(Math.max(winH - rect.top));
        } else {
          dref.current.style.bottom = "unset";
          dref.current.style.top = parseStyleNum(Math.min(rect.bottom, winH - hMax));
        }
        break;
      case "outer-top":
        dref.current.style.top = "unset";
        dref.current.style.bottom = parseStyleNum(posAbs ?
          winH - rect.top :
          Math.min(winH - rect.top, winH - hMax)
        );
        break;
      case "outer-bottom":
        dref.current.style.bottom = "unset";
        dref.current.style.top = parseStyleNum(posAbs ?
          rect.bottom :
          Math.min(rect.bottom, winH - hMax)
        );
        break;
      default: break;
    }
  }

  function showModal() {
    setState("modal");
  };

  function show() {
    setState("modeless");
  };

  function close() {
    setState("closed");
  };

  useEffect(() => {
    if (!dref.current) return;
    switch (state) {
      case "modal":
        dref.current.showModal();
        dref.current.inert = false;
        break;
      case "modeless":
        dref.current.show();
        dref.current.inert = false;
        break;
      case "closed":
        dref.current.close();
        dref.current.inert = true;
        break;
      default:
        break;
    }
  }, [state]);

  useEffect(() => {
    if (state === "closed") return;

    const handleResize = throttle(() => {
      resetPosition();
    }, 50);
    window.addEventListener("resize", handleResize);

    const releaseScroll = (() => {
      if (preventRootScroll) return;
      if (closeWhenScrolled) {
        const ev = () => {
          setState("closed");
        };
        window.addEventListener("scroll", ev, { once: true });
      }
      return preventScroll();
    })();

    const keydownEventListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (preventEscapeClose) return;
        setState("closed");
      }
    };
    window.addEventListener("keydown", keydownEventListener);
    resetPosition();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", keydownEventListener);
      releaseScroll?.();
    };
  }, [
    state,
    preventRootScroll,
    preventEscapeClose,
    closeWhenScrolled,
  ]);

  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    if (!preventCloseWhenClickOuter) {
      const { offsetX, offsetY } = e.nativeEvent;
      const { offsetWidth, offsetHeight } = e.currentTarget;
      if (offsetX < 0 || offsetY < 0 || offsetX - offsetWidth > 0 || offsetY - offsetHeight > 0) {
        setState("closed");
      }
    }
    props.onClick?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: dref.current,
    close,
    show,
    showModal,
    resetPosition,
  } as const satisfies DialogRef));

  return (
    <dialog
      {...props}
      className={clsx(
        "_dialog",
        className,
      )}
      ref={dref}
      onClick={handleClick}
      inert
    />
  );
};
