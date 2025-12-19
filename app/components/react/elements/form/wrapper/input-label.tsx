import type { LabelHTMLAttributes, RefObject } from "react";
import { clsx } from "../../utilities";

export type InputLabelWrapperProps = Overwrite<
  LabelHTMLAttributes<HTMLLabelElement>,
  {
    ref?: RefObject<HTMLLabelElement>;
    state?: RefObject<Schema.Mode>;
  }
>;

export function InputLabelWrapper({
  className,
  ref,
  state,
  ...props
}: InputLabelWrapperProps) {
  if (state?.current === "hidden") return null;

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
