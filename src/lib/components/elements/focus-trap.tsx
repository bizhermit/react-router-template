import type { FocusEvent, HTMLAttributes, ReactNode } from "react";
import { getNextFocusableElement, getPrevFocusableElement } from "../../client/dom/focus";

/** フォーカストラップ Props */
interface FocusTrapProps {
  /** 前方方向へのフォーカストラップ */
  onFocusHead?: boolean | ((e: FocusEvent<HTMLDivElement>) => void);
  /** 前方方向フォーカストラップ要素 Props */
  headProps?: HTMLAttributes<HTMLDivElement>;
  /** 後方方向へのフォーカストラップ */
  onFocusLast?: boolean | ((e: FocusEvent<HTMLDivElement>) => void);
  /** 後方方向フォーカストラップ要素 Props */
  lastProps?: HTMLAttributes<HTMLDivElement>;
  /** 子要素 */
  children?: ReactNode;
};

/**
 * フォーカストラップ
 * @param param {@link FocusTrapProps}
 * @returns
 */
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
