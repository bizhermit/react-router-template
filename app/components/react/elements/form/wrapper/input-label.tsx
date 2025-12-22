import type { LabelHTMLAttributes, RefObject } from "react";
import { clsx } from "../../utilities";

export type InputLabelWrapperProps = Overwrite<
  LabelHTMLAttributes<HTMLLabelElement>,
  {
    ref?: RefObject<HTMLLabelElement>;
    state?: Schema.Mode;
  }
>;

export function InputLabelWrapper({
  className,
  ref,
  state,
  ...props
}: InputLabelWrapperProps) {
  if (state === "hidden") return null;

  return (
    <label
      {...props}
      className={clsx(
        "_ipt-label",
        className,
      )}
    />
  );
};

export type InputLabelProps<T = {}> = Overwrite<
  InputLabelWrapperProps,
  Overwrite<InputProps, T>
>;
