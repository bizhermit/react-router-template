import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { clsx } from "./utilities";

interface DetailsOptions {
  summary: ReactNode;
  summaryProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
};

type DetailsProps = Overwrite<DetailsHTMLAttributes<HTMLDetailsElement>, DetailsOptions>;

export function Details({
  summary,
  summaryProps,
  className,
  children,
  ...props
}: DetailsProps) {
  return (
    <details
      {...props}
      className={clsx(
        "_details",
        className,
      )}
    >
      {
        summary &&
        <summary
          {...summaryProps}
          className={clsx(
            "_summary",
            summaryProps?.className,
          )}
        >
          {summary}
        </summary>
      }
      <div
        className="_detail-content"
      >
        {children}
      </div>
    </details>
  );
};
