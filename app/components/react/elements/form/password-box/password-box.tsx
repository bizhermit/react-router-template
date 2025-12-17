import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { PasswordBox$ } from ".";
import { useSchemaItem } from "../../../hooks/schema";
import { getValidationValue, WithMessage, type InputWrapProps } from "../common";
import type { FormItemHookProps } from "../hooks";

export type PasswordBoxProps<D extends Schema.DataItem<Schema.$String>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  hook?: FormItemHookProps;
} & Pick<InputHTMLAttributes<HTMLInputElement>,
  | "autoComplete"
  | "autoCapitalize"
>;

export function PasswordBox<D extends Schema.DataItem<Schema.$String>>({
  className,
  style,
  placeholder,
  autoFocus,
  hook,
  autoComplete = "off",
  autoCapitalize,
  ...$props
}: PasswordBoxProps<D>) {
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
    getCommonParams,
    omitOnSubmit,
    hideMessage,
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <PasswordBox$
        className={className}
        style={style}
        state={state.current}
        inputRef={ref}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          minLength: minLen,
          maxLength: maxLen,
          defaultValue: value || undefined,
          onChange: handleChange,
          placeholder,
          inputMode: "url",
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          autoFocus,
          autoComplete,
          autoCapitalize,
        }}
      />
    </WithMessage>
  );
};
