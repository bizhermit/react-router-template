import { useState, type HTMLAttributes } from "react";
import { useSchemaEffect } from "~/components/react/hooks/schema";
import { InputMessageSpan } from ".";

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
