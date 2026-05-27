import type { LabelHTMLAttributes, RefObject } from "react";
import { clsx } from "../../utilities";

/** ラベルラッパー Props */
export type InputLabelWrapperProps = Overwrite<
  Omit<LabelHTMLAttributes<HTMLLabelElement>, InputOmitProps>,
  {
    ref?: RefObject<HTMLLabelElement>;
    state?: Schema.Mode;
  }
>;

/**
 * ラベルラッパー
 * @param param {@link InputLabelWrapperProps}
 * @returns
 */
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

/** ラベル共通 Props */
export type InputLabelProps<T = {}> = Overwrite<
  InputLabelWrapperProps,
  Overwrite<InputProps, T>
>;
