import { use, useLayoutEffect, useState, type HTMLAttributes } from "react";
import { InputMessageSpan } from ".";
import { I18nContext } from "../../../../shared/hooks/i18n";
import { SchemaContext } from "../../../../shared/hooks/schema";
import { getResultMessage } from "../../../../shared/schema/message";

export type InputMessageProps = Overwrite<
  HTMLAttributes<HTMLSpanElement>,
  {
    $: Schema.DataItem;
  }
>;

export function InputMessage({
  $,
  ...props
}: InputMessageProps) {
  const schema = use(SchemaContext);

  const [result, setResult] = useState(() => {
    return schema.getResult($.name);
  });

  useLayoutEffect(() => {
    const unmount = schema.addSubscribe((params) => {
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
    return () => unmount();
  }, []);

  if (!result || result.type !== "e") return null;

  const t = use(I18nContext).t;
  const message = getResultMessage(t, result);

  return (
    <InputMessageSpan
      id={`${schema.id}_${$.name}__msg`}
      type={result.type}
      {...props}
    >
      {message}
    </InputMessageSpan>
  );
};
