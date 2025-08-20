import { useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { clsx, getColorClassName } from "../utilities";
import { getValidationValue, InputDummyFocus, InputLabel, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";
import { useSource } from "./utilities";

export type SliderProps<D extends Schema.DataItem<Schema.$Number>> = InputWrapProps & {
  $: D;
  color?: StyleColor;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  step?: number;
  showValueText?: boolean;
  hideScales?: boolean;
  hook?: FormItemHookProps;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export function Slider<D extends Schema.DataItem<Schema.$Number>>({
  color,
  source: propsSource,
  step,
  showValueText,
  hideScales,
  autoFocus,
  hook,
  ...$props
}: SliderProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);
  const dummyRef = useRef<HTMLDivElement | null>(null);
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
    validScripts,
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
    if (state.current !== "enabled") return;
    setValue(e.currentTarget.value as `${number}`);
  };

  function handleClickOption(v: number | null | undefined) {
    if (state.current !== "enabled") return;
    setValue(v);
  };

  function getRate(value: number | null | undefined) {
    if (value == null) return 0;
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const dataListId = source == null ? undefined : `${name}_dl`;

  if (hook) {
    hook.focus = () => (dummyRef.current ?? ref.current).focus();
  }

  return (
    <InputLabel
      {...props}
      core={{
        state,
        result,
        className: "ipt-slider-wrap",
      }}
    >
      <input
        className={clsx("ipt-slider", getColorClassName(color))}
        style={validScripts ? {
          "--rate": `${getRate(value)}%`,
        } as CSSProperties : undefined}
        ref={ref}
        type="range"
        name={omitOnSubmit ? undefined : name}
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
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
        autoFocus={autoFocus}
      />
      {
        showValueText && value != null &&
        <span className="ipt-slider-label">
          {value}
        </span>
      }
      {
        state.current === "readonly" &&
        <>
          <input
            type="hidden"
            name={name}
            value={value == null ? "" : String(value)}
          />
          <InputDummyFocus ref={dummyRef} />
        </>
      }
      {
        source &&
        <>
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
          {
            !hideScales &&
            <ul className="ipt-slider-scales">
              {source.map(item => {
                return (
                  <li
                    key={item.value}
                    className="ipt-slider-tick"
                    style={{
                      "--rate": `${getRate(item.value)}%`,
                    } as CSSProperties}
                    onClick={() => {
                      handleClickOption(item.value);
                    }}
                  >
                    {item.text}
                  </li>
                );
              })}
            </ul>
          }
        </>
      }
    </InputLabel>
  );
};
