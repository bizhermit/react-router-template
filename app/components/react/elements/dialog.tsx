import { useCallback, useEffect, useRef, useState, type DialogHTMLAttributes, type KeyboardEvent, type MouseEvent, type RefObject } from "react";
import { preventScroll } from "../../client/dom/prevent-scroll";
import throttle from "../../utilities/throttle";
import { clsx } from "./utilities";

interface DialogAnchor {
  element?: RefObject<HTMLElement>;
  x?: "inner" | "outer" | "center" | "inner-left" | "inner-right" | "outer-left" | "outer-right";
  y?: "inner" | "outer" | "center" | "inner-top" | "inner-bottom" | "outer-top" | "outer-bottom";
  flexible?: boolean;
  width?: "fill";
  height?: "fill";
};

interface DialogOptions {
  anchor?: DialogAnchor;
  preventRootScroll?: boolean;
  closeWhenScrolled?: boolean;
  preventEscapeClose?: boolean;
};

type DialogProps = DialogHTMLAttributes<HTMLDialogElement>;

export function useDialog(options?: DialogOptions & {
  defaultOpen?: "modal" | "modeless";
}) {
  const dref = useRef<HTMLDialogElement>(null!);
  const [state, setState] = useState<"closed" | "modeless" | "modal">(() => {
    return options?.defaultOpen || "closed";
  });
  const [showOptions, setShowOptions] = useState<DialogOptions | null | undefined>();

  function resetPosition() {
    const anchor = showOptions?.anchor;

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

    rect = anchor.element?.current.getBoundingClientRect() ?? document.documentElement.getBoundingClientRect();

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

  const Dialog = useCallback((props: DialogProps) => {
    function handleClick(e: MouseEvent<HTMLDialogElement>) {
      const { offsetX, offsetY } = e.nativeEvent;
      const { offsetWidth, offsetHeight } = e.currentTarget;
      if (offsetX < 0 || offsetY < 0 || offsetX - offsetWidth > 0 || offsetY - offsetHeight > 0) {
        setState("closed");
      }
      props.onClick?.(e);
    };

    function handleKeydown(e: KeyboardEvent<HTMLDialogElement>) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!showOptions?.preventEscapeClose) setState("closed");
      }
      props.onKeyDown?.(e);
    };

    return (
      <dialog
        {...props}
        className={clsx(
          "_dialog",
          props.className,
        )}
        ref={dref}
        onClick={handleClick}
        onKeyDown={handleKeydown}
        inert
      />
    );
  }, []);

  function showModal(showOptions?: DialogOptions) {
    setState("modal");
    setShowOptions({
      ...options,
      ...showOptions,
    });
  };

  function show(showOptions?: DialogOptions) {
    setState("modeless");
    setShowOptions({
      ...options,
      ...showOptions,
    });
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
      if (showOptions?.preventRootScroll) return;
      if (showOptions?.closeWhenScrolled) {
        const ev = () => {
          setState("closed");
        };
        window.addEventListener("scroll", ev, { once: true });
      }
      return preventScroll();
    })();

    resetPosition();

    return () => {
      window.removeEventListener("resize", handleResize);
      releaseScroll?.();
    };
  }, [state, showOptions]);

  return {
    Dialog,
    showModal,
    show,
    close,
  } as const;
};
