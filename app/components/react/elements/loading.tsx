import type { HTMLAttributes } from "react";
import { clsx, getColorClassName } from "./utilities";

interface LoadingBarOptions {
  color?: StyleColor;
};

type LoadingBarProps = HTMLAttributes<HTMLDivElement> & LoadingBarOptions;

export function LoadingBar({
  className,
  color,
  ...props
}: LoadingBarProps) {
  return (
    <div
      {...props}
      className={clsx(
        "loading-bar",
        getColorClassName(color),
        className,
      )}
    />
  );
};
