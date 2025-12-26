import { I18nContext } from "$/shared/hooks/i18n";
import { getResultMessage } from "$/shared/schema/message";
import { use, type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";

export type InputMessageSpanProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    type?: "e" | "w" | "i";
  }
>;

export function InputMessageSpan({
  className,
  type = "e",
  ...props
}: InputMessageSpanProps) {
  return (
    <span
      {...props}
      className={clsx(
        "_ipt-msg",
        className,
      )}
      data-type={type}
    />
  );
};

export interface WithMessage {
  hide?: boolean;
  state: Schema.Mode;
  result: Schema.Result | null | undefined;
  children?: ReactNode;
};

export function WithMessage({
  hide = false,
  state = "enabled",
  result,
  children,
}: WithMessage) {
  const t = use(I18nContext).t;
  const message = getResultMessage(t, result);

  return (
    <>
      {children}
      {
        !hide &&
        state === "enabled" &&
        result &&
        <InputMessageSpan
          type={result.type}
        >
          {message}
        </InputMessageSpan>
      }
    </>
  );
}
