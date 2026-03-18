import { type ButtonHTMLAttributes, type RefObject } from "react";
import { clsx, getColorClassName } from "../utilities";

/** ボタンオプション */
export interface ButtonOptions {
  /** ref */
  ref?: RefObject<HTMLButtonElement>;
  /** 配色 */
  color?: StyleColor;
  /** 見た目 */
  appearance?: "outline" | "fill" | "text";
  /** 処理中 */
  processing?: boolean;
  /** 角丸 */
  round?: boolean;
};

/** ボタン Props */
export type Button$Props = Overwrite<
  ButtonHTMLAttributes<HTMLButtonElement>,
  ButtonOptions
>;

/**
 * ボタン
 * @param props {@link Button$Props}
 * @returns
 */
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
