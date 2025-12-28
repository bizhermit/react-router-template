import type { HTMLAttributes } from "react";
import { clsx } from "../../utilities";

export type FormItemProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  InputOmitProps
>;

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
