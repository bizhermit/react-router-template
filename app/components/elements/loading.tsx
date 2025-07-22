import type { HTMLAttributes } from "react";
import { clsx } from "./utilities";

export function LoadingBar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx("loading-bar", className)}
    />
  );
};
