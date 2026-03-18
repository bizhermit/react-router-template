import type { HTMLAttributes, RefObject } from "react";
import { clsx } from "../utilities";

/** ダミーフォーカス要素 Props */
type InputDummyFocusProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {
    ref?: RefObject<HTMLDivElement | null>;
  }
>;

/**
 * ダミーフォーカス要素
 * - select等でReadOnlyをdisabledで制御した場合にタブ移動で止めるために使用する
 * @param param {@link InputDummyFocusProps}
 * @returns
 */
export function InputDummyFocus({
  className,
  tabIndex = 0,
  ref,
  ...props
}: InputDummyFocusProps) {
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={tabIndex}
      className={clsx(
        "_ipt-dummy-focus",
        className,
      )}
    />
  );
};
