import type { HTMLAttributes } from "react";
import { clsx } from "../utilities";

export type InputLabelTextProps = HTMLAttributes<HTMLSpanElement>;

export function InputLabelText({
  className,
  ...props
}: InputLabelTextProps) {
  if (!props.children) return;
  return (
    <span
      {...props}
      className={clsx(
        "_ipt-label-text",
        className,
      )}
    />
  );
};
