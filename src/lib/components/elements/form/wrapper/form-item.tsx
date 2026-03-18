import type { HTMLAttributes } from "react";
import { clsx } from "../../utilities";

/** フォーム入力要素共通ラッパー Props */
export type FormItemProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  InputOmitProps
>;

/**
 * フォーム入力要素共通ラッパー
 * @param param {@link FormItemProps}
 * @returns
 */
export function FormItem({
  className,
  children,
  ...props
}: FormItemProps) {
  return (
    <div
      {...props}
      className={clsx(
        "_form-item",
        className,
      )}
    >
      {children}
    </div>
  );
};
