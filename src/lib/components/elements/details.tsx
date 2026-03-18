import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { clsx } from "./utilities";

/** 詳細折りたたみ要素オプション */
interface DetailsOptions {
  /** 概要明示要素 */
  summary: ReactNode;
  /** 概要明示要素 Props */
  summaryProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
};

/** 詳細折りたたみ要素 Props */
type DetailsProps = Overwrite<
  DetailsHTMLAttributes<HTMLDetailsElement>,
  DetailsOptions
>;

/**
 * 詳細折りたたみ要素（開閉アニメーションあり）
 * @param param {@link DetailsProps}
 * @returns
 */
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
