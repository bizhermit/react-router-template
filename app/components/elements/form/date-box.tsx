import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { getValidationValue, InputField, type InputWrapProps } from "./common";
import { useSchemaItem, type SchemaItemProps } from "~/components/schema/hooks";
import { parseDateString } from "~/components/schema/date";

type DateBoxSchemaProps = Schema.$Date | Schema.$Month | Schema.$DateTime;

export type DateBoxProps<D extends Schema.DataItem<DateBoxSchemaProps>> = InputWrapProps & {
  $: D;
  placeholder?: string;
};

export function DateBox<P extends Schema.DataItem<DateBoxSchemaProps>>({
  placeholder,
  ...$props
}: DateBoxProps<P>) {
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
  } = useSchemaItem<Schema.DataItem<DateBoxSchemaProps>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const v = (value as string) || "";
      if (ref.current.value !== v) ref.current.value = v;
    },
    effectContext: function () {
      setMin(getMin);
      setMax(getMax);
    },
  });

  const type = dataItem._.type;

  function getMin() {
    return parseDateString(
      getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.minDate),
      type,
      type === "datetime" ? dataItem._.time : undefined,
    );
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return parseDateString(
      getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.maxDate),
      type,
      type === "datetime" ? dataItem._.time : undefined,
    );
  };

  const [max, setMax] = useState(getMax);

  function applyInputedValue() {
    const { value } = setValue(ref.current.value);
    const v = (value as string) || "";
    if (ref.current.value !== v) ref.current.value = v;
  };

  function handleChange() {
    if (!state.current.enabled) return;
    applyInputedValue();
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    if (e.key === "Enter") applyInputedValue();
  };

  const defaultValue = useMemo(() => {
    return parseDateString(
      value,
      type,
      type === "datetime" ? dataItem._.time : undefined,
    );
  }, []);

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
        type={type === "datetime" ? "datetime-local" : type}
        name={name}
        placeholder={placeholder}
        disabled={state.current.disabled}
        readOnly={state.current.readonly}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        step={type === "datetime" ? (dataItem._.time === "hm" ? 60 : undefined) : undefined}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      />
    </InputField>
  );
};
