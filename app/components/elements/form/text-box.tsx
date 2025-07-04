import { useRef, useState, type ChangeEvent, type HTMLAttributes, type HTMLInputTypeAttribute } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { getValidationValue, InputField, type InputWrapProps } from "./common";

export type TextBoxProps<D extends Schema.DataItem<Schema.$String>> = InputWrapProps & {
  $: D;
  placeholder?: string;
};

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
  placeholder,
  ...$props
}: TextBoxProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);

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
    data,
    dep,
    env,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$String>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value || "");
      if (ref.current.value !== sv) ref.current.value = sv;
    },
    effectContext: function () {
      setMinLen(getMinLen);
      setMaxLen(getMaxLen);
    },
  });

  function getMinLen() {
    return getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.minLength);
  };

  const [minLen, setMinLen] = useState<number | undefined>(getMinLen);

  function getMaxLen() {
    const params: Schema.DynamicValidationValueParams = { data, dep, env, label: dataItem.label };
    const len = getValidationValue(params, dataItem._.length);
    if (len != null) return len;
    return getValidationValue(params, dataItem._.maxLength);
  };

  const [maxLen, setMaxLen] = useState<number | undefined>(getMaxLen);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    setValue(e.target.value);
  };

  const patternProps = getPatternInputProps(dataItem._.pattern);

  return (
    <InputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <input
        className="ipt-main"
        ref={ref}
        type={patternProps.type || "text"}
        name={name}
        disabled={state.current.disabled}
        readOnly={state.current.readonly}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        defaultValue={value || undefined}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={patternProps.inputMode}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      />
    </InputField>
  );
};
