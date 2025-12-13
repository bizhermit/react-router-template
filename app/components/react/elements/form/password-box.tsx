import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { useSchemaItem } from "../../hooks/schema";
import { CircleFillIcon, CircleIcon } from "../icon";
import { clsx } from "../utilities";
import { getValidationValue, InputField, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";

export type PasswordBoxProps<D extends Schema.DataItem<Schema.$String>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  hook?: FormItemHookProps;
} & Pick<InputHTMLAttributes<HTMLInputElement>,
  | "autoComplete"
  | "autoCapitalize"
>;

export function PasswordBox<D extends Schema.DataItem<Schema.$String>>({
  placeholder,
  autoFocus,
  hook,
  autoComplete,
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
    validScripts,
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

  const [type, setType] = useState<"password" | "text">("password");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  function handleClickToggleButton() {
    if (state.current !== "enabled") return;
    setType(type => type === "password" ? "text" : "password");
  };

  return (
    <InputField
      {...props}
      core={{
        className: "_ipt-default-width",
        state,
        result,
      }}
    >
      <input
        className={clsx(
          "_ipt-main",
          validScripts && "pr-input-pad-bt"
        )}
        ref={ref}
        type={type}
        name={omitOnSubmit ? undefined : name}
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        defaultValue={value || undefined}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="url"
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
        autoFocus={autoFocus}
        autoComplete={autoComplete || "off"}
        autoCapitalize={autoCapitalize}
      />
      {
        validScripts &&
        state.current === "enabled" &&
        <button
          type="button"
          className={clsx(
            "_ipt-btn",
            state.current === "enabled" && "cursor-pointer",
          )}
          aria-label="toggle masked"
          tabIndex={-1}
          onClick={handleClickToggleButton}
        >
          {type === "text" ? <CircleFillIcon /> : <CircleIcon />}
        </button>
      }
    </InputField>
  );
};
