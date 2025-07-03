import { useState, type HTMLAttributes } from "react";
import { useSchemaEffect } from "~/components/schema/hooks";
import { clsx } from "../utilities";

export type InputMessageProps = HTMLAttributes<HTMLSpanElement> & {
  $: Schema.DataItem<Schema.$Any>;
};

export function InputMessage({
  $,
  ...props
}: InputMessageProps) {
  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "data":
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
  return (
    <span
      {...props}
      className={clsx("ipt-msg", props.className)}
    >
      {result?.message}
    </span>
  );
};
