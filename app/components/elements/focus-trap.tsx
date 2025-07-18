import type { FocusEvent, HTMLAttributes, ReactNode } from "react";
import { getNextFocusableElement, getPrevFocusableElement } from "../dom/focus";

interface FocusTrapProps {
  onFocusHead?: boolean | ((e: FocusEvent<HTMLDivElement>) => void);
  headProps?: HTMLAttributes<HTMLDivElement>;
  onFocusLast?: boolean | ((e: FocusEvent<HTMLDivElement>) => void);
  lastProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

export function FocusTrap({
  onFocusHead,
  headProps,
  onFocusLast,
  lastProps,
  children,
}: FocusTrapProps) {
  function handleFocusHead(e: FocusEvent<HTMLDivElement>) {
    if (typeof onFocusHead === "function") {
      onFocusHead(e);
    } else {
      getNextFocusableElement(e.currentTarget)?.focus();
    }
  };

  function handleFocusLast(e: FocusEvent<HTMLDivElement>) {
    if (typeof onFocusLast === "function") {
      onFocusLast(e);
    } else {
      getPrevFocusableElement(e.currentTarget)?.focus();
    }
  };

  return (
    <>
      {
        onFocusHead !== false &&
        <div
          {...headProps}
          className="fixed"
          tabIndex={0}
          onFocus={handleFocusHead}
        />
      }
      {children}
      {
        onFocusLast !== false &&
        <div
          {...lastProps}
          className="fixed"
          tabIndex={0}
          onFocus={handleFocusLast}
        />
      }
    </>
  );
};
