import { type ButtonHTMLAttributes, type RefObject } from "react";
import { clsx, getColorClassName } from "../utilities";

/** Button の拡張オプション */
export interface ButtonOptions {
  /** DOM 参照を外部に渡す */
  ref?: RefObject<HTMLButtonElement>;
  /** テーマベースのカラー */
  color?: StyleColor;
  /** 枠線や塗りなどの見た目 */
  appearance?: "outline" | "fill" | "text";
  /** 処理中かどうか */
  processing?: boolean;
  /** 角丸を適用する */
  round?: boolean;
};

/** Button が受け付ける props */
export type Button$Props = Overwrite<ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

/** 共通スタイル付きのボタン */
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
