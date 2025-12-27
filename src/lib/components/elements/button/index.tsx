import { type ButtonHTMLAttributes, type RefObject } from "react";
import { clsx, getColorClassName } from "../utilities";

export interface ButtonOptions {
  ref?: RefObject<HTMLButtonElement>;
  color?: StyleColor;
  appearance?: "outline" | "fill" | "text";
  processing?: boolean;
  round?: boolean;
};

export type Button$Props = Overwrite<ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

export function Button$({
  className,
  color,
  appearance = "outline",
  round,
  disabled,
  processing,
  ...props
}: Button$Props) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "_btn",
        getColorClassName(color),
        className,
      )}
      disabled={disabled || processing}
      data-appearance={appearance}
      data-round={round}
      data-processing={processing}
    />
  );
};
