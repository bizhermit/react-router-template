import { FormContext } from "$/shared/hooks/form/context";
import { useFormMessage } from "$/shared/hooks/form/message";
import { I18nContext } from "$/shared/hooks/i18n";
import type { FormItem } from "$/shared/schema/form";
import { getResultMessage } from "$/shared/schema/message";
import { use, useSyncExternalStore, type HTMLAttributes } from "react";
import { InputMessageSpan } from ".";

export type FormItemMessageProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formItem: FormItem<any>;
  }
>;

export function FormItemMessage({
  formItem,
  ...props
}: FormItemMessageProps) {
  const message = useFormMessage(formItem);

  if (!message) return null;

  return (
    <InputMessageSpan
      type={message?.type}
      {...props}
    >
      {getResultMessage(use(I18nContext).t, message)}
    </InputMessageSpan>
  );
};

export type FormMessageProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    name?: string | null;
  }
>;

export function FormMessage({
  name = "",
  ...props
}: FormMessageProps) {
  const { manager } = use(FormContext);

  function getMessage() {
    return manager.getMessage(name || "");
  };

  const message = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addMessageSubscribe(name || "", callback);
      return () => cleanup();
    },
    getMessage,
    getMessage
  );

  if (!message) return null;
  return (
    <InputMessageSpan
      type={message.type}
      {...props}
    >
      {getResultMessage(use(I18nContext).t, message)}
    </InputMessageSpan>
  );
};
