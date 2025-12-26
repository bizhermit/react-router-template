import { use, type HTMLAttributes, type ReactNode } from "react";
import { I18nContext } from "~/components/react/hooks/i18n";
import { getResultMessage } from "~/components/schema/message";
import { clsx } from "../../utilities";

export type InputMessageSpanProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    result: Schema.Result | null | undefined;
  }
>;

export function InputMessageSpan({
  result,
  ...props
}: InputMessageSpanProps) {
  if (!result || result.type !== "e") return null;

  const t = use(I18nContext).t;
  const message = getResultMessage(t, result);

  return (
    <span
      {...props}
      className={clsx(
        "_ipt-msg",
        props.className,
      )}
    >
      {message}
    </span>
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
  return (
    <>
      {children}
      {
        !hide &&
        state === "enabled" &&
        <InputMessageSpan
          result={result}
        />
      }
    </>
  );
}
