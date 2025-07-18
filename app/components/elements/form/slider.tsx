import { useRef, useState, type ChangeEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { DummyFocus, getValidationValue, InputLabel, type InputWrapProps } from "./common";
import { useSource } from "./utilities";

export type SliderProps<D extends Schema.DataItem<Schema.$Number>> = InputWrapProps & {
  $: D;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  step?: number;
  hideValueLabel?: boolean;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export function Slider<D extends Schema.DataItem<Schema.$Number>>({
  source: propsSource,
  step,
  hideValueLabel,
  ...$props
}: SliderProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);
  const $step = Math.abs(step || 1);

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
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Number>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const v = value == null ? "" : String(value);
      if (ref.current.value !== v) ref.current.value = v;
    },
    effectContext: function () {
      setMin(getMin);
      setMax(getMax);
      resetDataItemSource();
    },
  });

  function getMin() {
    return getValidationValue(getCommonParams(), dataItem._.min) ?? DEFAULT_MIN;
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return getValidationValue(getCommonParams(), dataItem._.max) ?? DEFAULT_MAX;
  };

  const [max, setMax] = useState(getMax);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    const rawValue = e.currentTarget.value;
    setValue(rawValue as `${number}`);
  };

  const dataListId = source == null ? undefined : `${name}_dl`;

  return (
    <InputLabel
      {...props}
      core={{
        state,
        result,
        classNames: "ipt-slider-wrap",
      }}
    >
      <input
        className="ipt-slider"
        ref={ref}
        type="range"
        name={omitOnSubmit ? undefined : name}
        disabled={!state.current.enabled}
        aria-disabled={state.current.disabled}
        aria-readonly={state.current.readonly}
        required={required}
        min={min}
        max={max}
        step={$step}
        value={value == null ? "" : String(value)}
        onChange={handleChange}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
        list={dataListId}
        title={value == null ? undefined : String(value)}
      />
      {
        !hideValueLabel && value != null &&
        <span className="ipt-slider-label">
          {value}
        </span>
      }
      {
        !state.current.disabled && state.current.readonly &&
        <>
          <input
            type="hidden"
            name={name}
            value={value == null ? "" : String(value)}
          />
          <DummyFocus />
        </>
      }
      {
        source &&
        <datalist id={dataListId}>
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
    </InputLabel>
  );
};
