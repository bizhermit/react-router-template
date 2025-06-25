import { useMemo, useRef, useState, type ChangeEvent, type CompositionEvent, type FocusEvent, type KeyboardEvent } from "react";
import { getValidationValue, InputField, type InputWrapProps } from "./common";
import { clsx } from "../utilities";
import { useSchemaItem } from "~/components/schema/hooks";

export type NumberBoxProps<D extends Schema.DataItem<Schema.$Number>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  step?: number;
};

const UP_DOWN_ROOP_WAIT = 500;
const UP_DOWN_INTERVAL = 50;

function preventParse(result: Schema.Result | null | undefined) {
  return result?.type === "e" && (
    result.code === "parse" ||
    result.code === "float"
  );
};

export function NumberBox<D extends Schema.DataItem<Schema.$Number>>({
  placeholder,
  step,
  ...$props
}: NumberBoxProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);
  const $step = Math.abs(step || 1);

  const isComposing = useRef(false);

  const {
    name,
    dataItem,
    state,
    required,
    value,
    getValue,
    setValue,
    result,
    label,
    invalid,
    errormessage,
    validScripts,
    data,
    dep,
    env,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Number>>($props, {
    effect: function ({ value, result }) {
      if (!ref.current) return;
      if (preventParse(result)) return;
      const sv = (() => {
        if (document.activeElement === ref.current) {
          const num = parse(value);
          if (num == null || isNaN(num)) return "";
          return String(num);
        }
        return format(value);
      })();
      if (!isComposing.current && ref.current.value !== sv) ref.current.value = sv;
    },
    effectContext: function() {
      setMin(getMin);
      setMax(getMax);
      setFloat(getFloat);
    },
  });

  function getMin() {
    return getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.min);
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.max);
  };

  const [max, setMax] = useState(getMax);

  function getFloat() {
    return getValidationValue({ data, dep, env, label: dataItem.label }, dataItem._.float);
  };

  const [float, setFloat] = useState(getFloat);

  const { inputMode, formatter } = useMemo(() => {
    return {
      inputMode: (float ?? 0) > 0 ? "numeric" : "decimal",
      formatter: new Intl.NumberFormat(undefined, {
        useGrouping: true,
        minimumFractionDigits: float,
        maximumFractionDigits: float,
      }),
    } as const;
  }, [float]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    const rawValue = e.currentTarget.value;
    setValue(rawValue as `${number}`);
  };

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    if (preventParse(result)) return;
    const num = parse(getValue());
    e.currentTarget.value = num == null || isNaN(num) ? "" : String(num);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    if (preventParse(result)) return;
    const text = format(getValue());
    e.currentTarget.value = text || "";
  };

  function handleCompositionStart(e: CompositionEvent<HTMLInputElement>) {
    isComposing.current = true;
  };

  function handleCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    isComposing.current = false;
  };

  function format(value: any) {
    if (value == null || value === "") return "";
    const num = Number(value);
    if (isNaN(num)) return "";
    return formatter.format(num);
  };

  function parse(text: string | number | null | undefined) {
    if (text == null || text === "") return null;
    return Number(text);
  };

  function minmax(num: number | null | undefined) {
    if (num == null) return num;
    let ret = num;
    if (min != null) ret = Math.max(min, ret);
    if (max != null) ret = Math.min(max, ret);
    return ret;
  };

  function increment() {
    let v = getValue();
    if (v == null) v = min ?? 0;
    else v = minmax(v + $step);
    setValue(v);
  };

  function decrement() {
    let v = getValue();
    if (v == null) v = min ?? 0;
    else v = minmax(v - $step);
    setValue(v);
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowUp":
        if (state.current.enabled) {
          increment();
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (state.current.enabled) {
          decrement();
          e.preventDefault();
        }
        break;
      case "Enter":
        if (!isComposing.current) {
          ref.current.value = String(value ?? "");
        }
        break;
      default: break;
    }
  };

  function handleMousedown(mode: "up" | "down") {
    if (!state.current.enabled) return;
    if (mode === "up") increment();
    else decrement();
    let finished = false;
    window.addEventListener("mouseup", () => {
      finished = true;
    }, { once: true });

    let lastTime = performance.now();
    function loop(time: number) {
      if (finished) return;
      if (time - lastTime >= UP_DOWN_INTERVAL) {
        if (mode === "up") increment();
        else decrement();
        lastTime = time;
      }
      requestAnimationFrame(loop);
    };
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, UP_DOWN_ROOP_WAIT);
  };


  function handleMousedownIncrement() {
    handleMousedown("up");
  };

  function handleMousedownDecrement() {
    handleMousedown("down");
  };

  return (
    <InputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <input
        className={clsx(
          "ipt-main text-right z-0",
          validScripts && "pr-input-pad-btn"
        )}
        ref={ref}
        type={validScripts ? "text" : "number"}
        inputMode={inputMode}
        name={validScripts ? undefined : name}
        disabled={state.current.disabled}
        readOnly={state.current.readonly}
        required={required}
        min={min}
        max={max}
        step={$step}
        defaultValue={(validScripts && !preventParse(result)) ? format(value) : (value ?? "")}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeydown}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      />
      {validScripts &&
        <>
          <div
            className={clsx(
              "ipt-outer-spin-button",
              !state.current.enabled && "opacity-0"
            )}
          >
            <button
              type="button"
              aria-label="increment"
              tabIndex={-1}
              className={clsx(
                "ipt-inner-spin-button mask-[var(--image-up)] mask-bottom",
                state.current.enabled && "cursor-pointer",
              )}
              disabled={!state.current.enabled}
              onMouseDown={handleMousedownIncrement}
            />
            <button
              type="button"
              aria-label="decrement"
              tabIndex={-1}
              className={clsx(
                "ipt-inner-spin-button mask-[var(--image-down)] mask-top",
                state.current.enabled && "cursor-pointer",
              )}
              disabled={!state.current.enabled}
              onMouseDown={handleMousedownDecrement}
            />
          </div>
          <input
            name={name}
            type="hidden"
            disabled={state.current.disabled}
            value={value ?? ""}
          />
        </>
      }
    </InputField>
  );
};