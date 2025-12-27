import { useState } from "react";
import { TextArea$, type TextArea$Ref } from ".";
import { useSchemaItem } from "../../../../shared/hooks/schema";
import { getValidationValue } from "../../../../shared/schema/utilities";
import { WithMessage } from "../message";

type Resize = "none" | "vertical" | "horizontal" | "both";

export interface TextAreaRef extends TextArea$Ref { };

export type TextAreaProps<D extends Schema.DataItem<Schema.$String>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
    cols?: number;
    resize?: Resize;
  } & ({
    rows?: number;
    minRows?: undefined;
    maxRows?: undefined;
  } | {
    rows: "fit";
    minRows?: number;
    maxRows?: number;
  })
>;

export function TextArea<D extends Schema.DataItem<Schema.$String>>({
  className,
  style,
  placeholder,
  rows,
  minRows,
  maxRows,
  cols,
  resize,
  autoFocus,
  ref,
  ...$props
}: TextAreaProps<D>) {
  const {
    name,
    dataItem,
    state,
    required,
    value,
    setValue,
    result,
    label,
    invalid,
    errormessage,
    getCommonParams,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<Schema.$String>>($props, {
    effectContext: function () {
      setMinLen(getMinLen);
      setMaxLen(getMaxLen);
    },
  });

  function getMinLen() {
    return getValidationValue(getCommonParams(), dataItem._.minLength);
  };

  const [minLen, setMinLen] = useState<number | undefined>(getMinLen);

  function getMaxLen() {
    const params = getCommonParams();
    const len = getValidationValue(params, dataItem._.length);
    if (len != null) return len;
    return getValidationValue(params, dataItem._.maxLength);
  };

  const [maxLen, setMaxLen] = useState<number | undefined>(getMaxLen);

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <TextArea$
        className={className}
        style={style}
        ref={ref}
        invalid={invalid}
        state={state}
        resize={resize}
        minRows={minRows}
        maxRows={maxRows}
        value={value}
        onChangeValue={setValue}
        textAreaProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          minLength: minLen,
          maxLength: maxLen,
          placeholder,
          rows,
          cols,
          "aria-label": label,
          "aria-errormessage": errormessage,
          autoFocus,
        }}
      />
    </WithMessage>
  );
};
