import { use, useLayoutEffect, useState, type HTMLAttributes } from "react";
import { InputMessageSpan } from ".";
import { SchemaContext } from "../../../hooks/schema";

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

  return (
    <InputMessageSpan
      id={`${schema.id}_${$.name}__msg`}
      {...props}
      result={result}
    />
  );
};
