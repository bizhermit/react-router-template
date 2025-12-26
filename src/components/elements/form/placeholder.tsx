import type { HTMLAttributes } from "react";
import { clsx } from "../utilities";

type PlaceholderProps = HTMLAttributes<HTMLDivElement>;

export function Placeholder({
  className,
  children,
  ...props
}: PlaceholderProps) {
  if (!children) return null;

  return (
    <div
      {...props}
      className={clsx(
        "_ipt-placeholder",
        className,
      )}
    >
      <span
        className="w-full overflow-hidden"
      >
        {children}
      </span>
    </div>
  );
};
