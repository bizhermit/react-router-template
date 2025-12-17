import { useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { DownIcon, UpIcon } from "../icon";
import { clsx } from "../utilities";
import { getValidationValue, OldInputField, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";
import { useSource } from "./utilities";

export type NumberBoxProps<D extends Schema.DataItem<Schema.$Number>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  step?: number;
  hook?: FormItemHookProps;
} & Pick<InputHTMLAttributes<HTMLInputElement>,
  | "autoComplete"
  | "enterKeyHint"
>;

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
  source: propsSource,
  step,
  autoFocus,
  autoComplete,
  enterKeyHint,
  hook,
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
    getCommonParams,
    env,
    omitOnSubmit,
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
    effectContext: function () {
      setMin(getMin);
      setMax(getMax);
      setFloat(getFloat);
      resetDataItemSource();
    },
  });

  function getMin() {
    return getValidationValue(getCommonParams(), dataItem._.min);
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return getValidationValue(getCommonParams(), dataItem._.max);
  };

  const [max, setMax] = useState(getMax);

  function getFloat() {
    return getValidationValue(getCommonParams(), dataItem._.float);
  };

  const [float, setFloat] = useState(getFloat);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

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
    if (state.current !== "enabled") return;
    const rawValue = e.currentTarget.value;
    setValue(rawValue as `${number}`);
  };

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    if (preventParse(result)) return;
    const num = parse(getValue());
    e.currentTarget.value = num == null || isNaN(num) ? "" : String(num);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    if (preventParse(result)) return;
    const text = format(getValue());
    e.currentTarget.value = text || "";
  };

  function handleCompositionStart() {
    isComposing.current = true;
  };

  function handleCompositionEnd() {
    isComposing.current = false;
  };

  function format(value: unknown) {
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
        if (state.current === "enabled") {
          increment();
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (state.current === "enabled") {
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
    if (state.current !== "enabled") return;
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

  const dataListId = source == null ? undefined : `${name}_dl`;

  if (hook) {
    hook.focus = () => ref.current.focus();
  }

  return (
    <OldInputField
      {...props}
      core={{
        className: "_ipt-default-width",
        state,
        result,
      }}
    >
      <input
        className={clsx(
          "_ipt-box text-right z-0",
          validScripts && "pr-input-pad-btn"
        )}
        ref={ref}
        type={validScripts ? "text" : "number"}
        inputMode={inputMode}
        name={validScripts ? undefined : (omitOnSubmit ? undefined : name)}
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
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
        list={dataListId}
        autoFocus={autoFocus}
        autoComplete={autoComplete || "off"}
        enterKeyHint={enterKeyHint}
      />
      {
        validScripts &&
        <>
          <div
            className={clsx(
              "_ipt-outer-spin-button",
              state.current !== "enabled" && "opacity-0"
            )}
          >
            <button
              type="button"
              aria-label="increment"
              tabIndex={-1}
              className={clsx(
                "_ipt-inner-spin-button items-end",
                state.current === "enabled" && "cursor-pointer",
              )}
              disabled={state.current !== "enabled"}
              onMouseDown={handleMousedownIncrement}
            >
              <UpIcon />
            </button>
            <button
              type="button"
              aria-label="decrement"
              tabIndex={-1}
              className={clsx(
                "_ipt-inner-spin-button items-start",
                state.current === "enabled" && "cursor-pointer",
              )}
              disabled={state.current !== "enabled"}
              onMouseDown={handleMousedownDecrement}
            >
              <DownIcon />
            </button>
          </div>
          <input
            name={omitOnSubmit ? undefined : name}
            type="hidden"
            disabled={state.current === "disabled"}
            value={value ?? ""}
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
                value={item.value ?? ""}
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
