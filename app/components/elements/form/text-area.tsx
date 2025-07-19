import { useRef, useState, type ChangeEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { getValidationValue, InputField, type InputWrapProps } from "./common";

type Resize = "none" | "vertical" | "horizontal" | "both";

export type TextAreaProps<D extends Schema.DataItem<Schema.$String>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  rows?: number;
  cols?: number;
  resize?: Resize;
};

function getResizeClassName(resize: Resize | undefined) {
  switch (resize) {
    case "none": return "resize-none";
    case "vertical": return "resize-x";
    case "horizontal": return "resize-y";
    default: return "resize";
  }
};

export function TextArea<D extends Schema.DataItem<Schema.$String>>({
  placeholder,
  rows,
  cols,
  resize,
  ...$props
}: TextAreaProps<D>) {
  const ref = useRef<HTMLTextAreaElement>(null!);

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

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  return (
    <InputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <textarea
        className={`ipt-main py-input-pad-y min-h-input min-w-input ${getResizeClassName(resize)}`}
        ref={ref}
        name={omitOnSubmit ? undefined : name}
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        defaultValue={value || undefined}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows ?? 3}
        cols={cols}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      />
    </InputField>
  );
};
