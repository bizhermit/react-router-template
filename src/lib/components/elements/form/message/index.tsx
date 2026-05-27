import { use, type HTMLAttributes, type ReactNode } from "react";
import { I18nContext } from "../../../../shared/hooks/i18n";
import { getResultMessage } from "../../../../shared/schema/message";
import { clsx } from "../../utilities";

/** メッセージ Props */
export type InputMessageSpanProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    /** メッセージタイプ */
    type?: "e" | "w" | "i";
    /** メッセージコード */
    code?: string | number;
  }
>;

/**
 * メッセージテキスト
 * @param param {@link InputMessageSpanProps}
 * @returns
 */
export function InputMessageSpan({
  className,
  type = "e",
  code,
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
      data-code={code}
    />
  );
};

type WithMessageProps = {
  /** id */
  id?: string;
  /** 非表示 @default false */
  hide?: boolean;
  /** 状態 @default "enabled" */
  state: $Schema.Mode;
  /** メッセージ */
  message: $Schema.Message | null | undefined;
  /** メッセージ表示対象要素 */
  children?: ReactNode;
};

export function WithMessage({
  id,
  hide,
  state,
  message,
  children,
}: WithMessageProps) {
  return (
    <>
      {children}
      {
        !hide &&
        state === "enabled" &&
        message &&
        <InputMessageSpan
          id={id}
          type={message.type}
        >
          {getResultMessage(use(I18nContext).t, message)}
        </InputMessageSpan>
      }
    </>
  );
}
