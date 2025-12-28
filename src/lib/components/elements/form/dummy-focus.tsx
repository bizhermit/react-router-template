import type { HTMLAttributes, RefObject } from "react";
import { clsx } from "../utilities";

type InputDummyFocusProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {
    ref?: RefObject<HTMLDivElement | null>;
  }
>;

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
