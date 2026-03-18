import type { HTMLAttributes } from "react";
import { clsx } from "../utilities";

/** 入力要素ラベルテキスト */
export type InputLabelTextProps = HTMLAttributes<HTMLSpanElement>;

/**
 * 入力要素ラベルテキスト
 * - ラジオボタン
 * - チェックボックス／リスト
 * @param param {@link InputLabelText}
 * @returns
 */
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
