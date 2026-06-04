import { I18nContext } from "$/shared/hooks/i18n";
import { use, type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";

export type FormGridProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {

  }
>;

export function FormGrid({
  className,
  ...props
}: FormGridProps) {
  return (
    <div
      {...props}
      className={clsx(
        "_form-container",
        className,
      )}
    />
  );
};

export type FormHeadlineProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {

  }
>;

export function FormHeadline({
  className,
  ...props
}: FormHeadlineProps) {
  return (
    <div
      {...props}
      className={clsx(
        "_form-headline",
        className,
      )}
    />
  );
};

export type FormRowProps = Overwrite<
  HTMLAttributes<HTMLDivElement>,
  {
    caption?: ReactNode;
  }
>;

export function FormRow({
  className,
  caption,
  children,
  ...props
}: FormRowProps) {
  const t = use(I18nContext).t;

  return (
    <div
      {...props}
      className={clsx(
        "_form-row",
        className,
      )}
    >
      <div className="_form-row_caption">
        {
          caption && (
            typeof caption === "string"
              ? t(caption as I18nTextKey)
              : caption
          )
        }
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
