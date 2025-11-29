import { use, useState, type HTMLAttributes } from "react";
import { useSchemaEffect } from "~/components/react/hooks/schema";
import { getResultMessage } from "~/components/schema/message";
import { I18nContext } from "../../hooks/i18n";
import { clsx } from "../utilities";

export type InputMessageProps = HTMLAttributes<HTMLSpanElement> & {
  $: Schema.DataItem;
};

export function InputMessage({
  $,
  ...props
}: InputMessageProps) {
  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "refresh":
        setResult(params.results[$.name]);
        break;
      case "value-result":
      case "result": {
        const item = params.items.find(item => item.name === $.name);
        if (item) {
          setResult(item.result);
        }
        break;
      }
      default:
        break;
    }
  });

  const [result, setResult] = useState(() => {
    return schema.getResult($.name);
  });

  return (
    <InputMessageSpan
      id={`${schema.id}_${$.name}__msg`}
      {...props}
      result={result}
    />
  );
};

export function InputMessageSpan({
  result,
  ...props
}: {
  result: Schema.Result | null | undefined;
} & HTMLAttributes<HTMLSpanElement>) {
  if (!result || result.type !== "e") return null;

  const t = use(I18nContext).t;
  const message = getResultMessage(t, result);

  return (
    <span
      {...props}
      className={clsx("ipt-msg", props.className)}
    >
      {message}
    </span>
  );
};
