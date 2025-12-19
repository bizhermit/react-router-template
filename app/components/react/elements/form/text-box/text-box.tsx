import { useImperativeHandle, useRef, useState, type ChangeEvent, type HTMLAttributes, type HTMLInputTypeAttribute, type InputHTMLAttributes, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue } from "~/components/schema/utilities";
import { TextBox$, type TextBox$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { type InputRef, type InputWrapProps } from "../common";
import { WithMessage } from "../message";

export interface TextBoxRef extends TextBox$Ref { };

export type TextBoxProps<D extends Schema.DataItem<Schema.$String>> = Overwrite<
  InputWrapProps,
  {
    $: D;
    placeholder?: string;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    ref?: RefObject<InputRef | null>;
  } & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoComplete"
    | "autoCapitalize"
    | "enterKeyHint"
  >
>;

function getPatternInputProps(pattern: Schema.StringProps["pattern"]): { type?: HTMLInputTypeAttribute; inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]; } {
  if (pattern == null || typeof pattern !== "string") return {};
  switch (pattern) {
    case "int":
    case "h-num":
      return { inputMode: "decimal" };
    case "h-alpha":
    case "h-alpha-num":
    case "h-alpha-num-syn":
      return { inputMode: "url" };
    case "email":
      return { type: "email" };
    case "tel":
      return { type: "tel" };
    case "url":
      return { type: "url" };
    default:
      return {};
  }
}

export function TextBox<D extends Schema.DataItem<Schema.$String>>({
  className,
  style,
  placeholder,
  source: propsSource,
  autoFocus,
  autoComplete = "off",
  autoCapitalize,
  enterKeyHint,
  ...$props
}: TextBoxProps<D>) {
  const ref = useRef<TextBox$Ref>(null!);

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
    env,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<Schema.$String>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value || "");
      if (ref.current.inputElement.value !== sv) {
        ref.current.inputElement.value = sv;
      }
    },
    effectContext: function () {
      setMinLen(getMinLen);
      setMaxLen(getMaxLen);
      resetDataItemSource();
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

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  const patternProps = getPatternInputProps(dataItem._.pattern);

  const dataListId = source == null ? undefined : `${name}_dl`;

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <TextBox$
        className={className}
        style={style}
        ref={ref}
        state={state}
        inputProps={{
          type: patternProps.type || "text",
          name: omitOnSubmit ? undefined : name,
          required,
          minLength: minLen,
          maxLength: maxLen,
          placeholder,
          inputMode: patternProps.inputMode,
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          list: dataListId,
          autoFocus,
          autoComplete,
          autoCapitalize,
          enterKeyHint,
          defaultValue: value || "",
          onChange: handleChange,
        }}
      >
        {
          source &&
          <datalist
            id={dataListId}
          >
            {source.map(item => {
              return (
                <option
                  key={item.value}
                  value={item.value ?? ""}
                >
                  {item.text}
                </option>
              );
            })}
          </datalist>
        }
      </TextBox$>
    </WithMessage>
  );
};
