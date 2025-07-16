import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { parseTypedDateString } from "~/components/schema/date";
import { useSchemaItem } from "~/components/schema/hooks";
import { getValidationValue, InputField, type InputWrapProps } from "./common";
import { useSource } from "./utilities";

type DateBoxSchemaProps = Schema.$Date | Schema.$Month | Schema.$DateTime;

export type DateBoxProps<D extends Schema.DataItem<DateBoxSchemaProps>> = InputWrapProps & {
  $: D;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  placeholder?: string;
};

export function DateBox<P extends Schema.DataItem<DateBoxSchemaProps>>({
  placeholder,
  source: propsSource,
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
    getCommonParams,
    setRefs,
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
      setPair(getPair);
      resetDataItemSource();
    },
  });

  const type = dataItem._.type;
  const time = (dataItem._ as Schema.$DateTime).time;

  function getMin() {
    return parseTypedDateString(
      getValidationValue(getCommonParams(), dataItem._.minDate),
      type,
      time,
    );
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return parseTypedDateString(
      getValidationValue(getCommonParams(), dataItem._.maxDate),
      type,
      time,
    );
  };

  const [max, setMax] = useState(getMax);

  function getPair() {
    const pair = getValidationValue(getCommonParams(), dataItem._.pair);
    setRefs(pair?.name ? [pair.name] : []);
    return pair;
  };

  const [_pair, setPair] = useState(getPair);

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
    return parseTypedDateString(
      value,
      type,
      time,
    );
  }, []);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  const dataListId = source == null ? undefined : `${name}_dl`;

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
        list={dataListId}
      />
      {
        source &&
        <datalist id={dataListId}>
          {source.map(item => {
            return (
              <option
                key={item.value}
                value={item.value || ""}
              >
                {item.text}
              </option>
            );
          })}
        </datalist>
      }
    </InputField>
  );
};
