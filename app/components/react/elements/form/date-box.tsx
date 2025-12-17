import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { parseTypedDateString } from "~/components/schema/date";
import { clsx } from "../utilities";
import { getValidationValue, InputDummyFocus, OldInputField, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";
import { useSource } from "./utilities";

type DateBoxSchemaProps = Schema.$Date | Schema.$Month | Schema.$DateTime;

export type DateBoxProps<D extends Schema.DataItem<DateBoxSchemaProps>> = InputWrapProps & {
  $: D;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  placeholder?: string;
  hook?: FormItemHookProps;
};

export function DateBox<P extends Schema.DataItem<DateBoxSchemaProps>>({
  placeholder,
  autoFocus,
  source: propsSource,
  hook,
  ...$props
}: DateBoxProps<P>) {
  const ref = useRef<HTMLInputElement>(null!);
  const dummyRef = useRef<HTMLDivElement | null>(null);

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
    omitOnSubmit,
    validScripts,
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
    if (state.current !== "enabled") return;
    applyInputedValue();
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    if (e.key === "Enter") applyInputedValue();
  };

  function handleBlur() {
    ref.current.value = ref.current.value || ""; // NOTE: 日付が揃っていない場合はクリア
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

  if (hook) {
    hook.focus = () => (dummyRef.current ?? ref.current).focus();
  }

  return (
    <OldInputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <input
        className={clsx(
          "_ipt-box",
          validScripts && "_ipt-date",
        )}
        ref={ref}
        type={type === "datetime" ? "datetime-local" : type}
        name={omitOnSubmit ? undefined : name}
        placeholder={placeholder}
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        onBlur={handleBlur}
        step={type === "datetime" ? (dataItem._.time === "hm" ? 60 : undefined) : undefined}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
        data-hasvalue={!!value}
        list={dataListId}
        autoFocus={autoFocus}
      />
      {
        state.current === "readonly" &&
        <>
          <input
            type="hidden"
            name={name}
            value={value as string || undefined}
          />
          <InputDummyFocus
            ref={dummyRef}
          />
        </>
      }
      {
        source &&
        <datalist
          id={dataListId}
        >
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
    </OldInputField>
  );
};
