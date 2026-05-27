import type { HTMLAttributes, RefObject } from "react";
import { clsx } from "../../utilities";

/** 選択グループラッパー Props */
export type InputGroupWrapperProps = Overwrite<
  Omit<HTMLAttributes<HTMLDivElement>, InputOmitProps>,
  {
    ref?: RefObject<HTMLDivElement>;
    state?: Schema.Mode;
  }
>;

/** 選択グループラッパー */
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
