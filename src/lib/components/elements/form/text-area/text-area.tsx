import { useState } from "react";
import { TextArea$, type TextArea$Ref, type TextAreaResize } from ".";
import { useSchemaItem } from "../../../../shared/hooks/schema";
import { getValidationValue } from "../../../../shared/schema/utilities";
import { WithMessage } from "../message";

/** テキストエリア ref オブジェクト */
export interface TextAreaRef extends TextArea$Ref { };

/** テキストエリア Props */
export type TextAreaProps<D extends Schema.DataItem<Schema.$String>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    /** プレースホルダー */
    placeholder?: string;
    /** cols */
    cols?: number;
    /** リサイズモード */
    resize?: TextAreaResize;
  } & ({
    /** 行数 */
    rows?: number;
    /** 最小行数（undefined固定） */
    minRows?: undefined;
    /** 最大行数（undefined固定） */
    maxRows?: undefined;
  } | {
    /** 行数（可変） */
    rows: "fit";
    /** 最小行数 */
    minRows?: number;
    /** 最大行数 */
    maxRows?: number;
  })
>;

/**
 * テキストエリア
 * @param param {@link TextAreaProps}
 * @returns
 */
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
