import type { HTMLAttributes, RefObject } from "react";
import { clsx } from "../../utilities";

export type InputGroupWrapperProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {
    ref?: RefObject<HTMLDivElement>;
    state?: Schema.Mode;
  }
>;

export function InputGroupWrapper({
  className,
  ref,
  state,
  ...props
}: InputGroupWrapperProps) {
  if (state === "hidden") return null;

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "_ipt _ipt-group",
        className,
      )}
    />
  );
};
