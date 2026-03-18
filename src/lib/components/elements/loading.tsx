import type { HTMLAttributes } from "react";
import { clsx, getColorClassName } from "./utilities";

/** ローディングバーオプション */
interface LoadingBarOptions {
  /** 配色 */
  color?: StyleColor;
};

/** ローディングバー Props */
type LoadingBarProps = HTMLAttributes<HTMLDivElement> & LoadingBarOptions;

/**
 * ローディングバー
 * @param param {@link LoadingBarProps}
 * @returns
 */
export function LoadingBar({
  className,
  color,
  ...props
}: LoadingBarProps) {
  return (
    <div
      {...props}
      className={clsx(
        "_loading-bar",
        getColorClassName(color),
        className,
      )}
    />
  );
};
