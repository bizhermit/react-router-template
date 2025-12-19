import { useImperativeHandle, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { getValidationValue } from "~/components/schema/utilities";
import { PasswordBox$, type PasswordBox$Ref } from ".";
import { useSchemaItem } from "../../../hooks/schema";
import { WithMessage } from "../message";

export interface PasswordBoxRef extends PasswordBox$Ref { };

export type PasswordBoxProps<D extends Schema.DataItem<Schema.$String>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
  } & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoComplete"
    | "autoCapitalize"
  >
>;

export function PasswordBox<D extends Schema.DataItem<Schema.$String>>({
  className,
  style,
  placeholder,
  autoFocus,
  autoComplete = "off",
  autoCapitalize,
  ...$props
}: PasswordBoxProps<D>) {
  const ref = useRef<PasswordBox$Ref>(null!);

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
      if (ref.current.inputElement.value !== sv) {
        ref.current.inputElement.value = sv;
      }
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

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <PasswordBox$
        className={className}
        style={style}
        ref={ref}
        state={state}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          minLength: minLen,
          maxLength: maxLen,
          placeholder,
          inputMode: "url",
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          autoFocus,
          autoComplete,
          autoCapitalize,
          defaultValue: value || "",
          onChange: handleChange,
        }}
      />
    </WithMessage>
  );
};
