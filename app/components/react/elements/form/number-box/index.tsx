import { use, useImperativeHandle, useMemo, useRef, type ChangeEvent, type CompositionEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { parseNumber } from "~/components/objects/numeric";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { DownIcon, UpIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps, type InputRef } from "../common";

export interface NumberBox$Ref extends InputRef<HTMLInputElement> {
  format: (value: unknown) => string;
  parse: (value: number | string | null | undefined) => (number | null | undefined);
  isComposing: () => boolean;
};

export type NumberBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: Overwrite<InputHTMLAttributes<HTMLInputElement>, {
    defaultValue?: number | null;
    value?: number | null;
    min?: number;
    max?: number;
    step?: number;
    float?: number;
    onChangeValue?: (v: number | null | undefined) => void;
  }>;
  children?: ReactNode;
  bindMode?: "state" | "dom";
}>;

const UP_DOWN_ROOP_WAIT = 500;
const UP_DOWN_INTERVAL = 50;

export function NumberBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
  className,
  children,
  bindMode = "state",
  ...props
}: NumberBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const isComposing = useRef(false);
  const safeValueRef = useRef("");

  function createSetter() {
    return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  };
  const setterRef = useRef<ReturnType<typeof createSetter> | null>(null);

  const { inputMode, formatter } = useMemo(() => {
    return {
      inputMode: (inputProps?.float ?? 0) > 0 ? "numeric" : "decimal",
      formatter: new Intl.NumberFormat(undefined, {
        useGrouping: true,
        minimumFractionDigits: inputProps?.float,
        maximumFractionDigits: inputProps?.float,
      }),
    } as const;
  }, [inputProps?.float]);

  function format(value: unknown) {
    if (value == null || value === "") return "";
    const num = Number(value);
    if (isNaN(num)) return "";
    return formatter.format(num);
  };

  function parse(value: number | string | null | undefined) {
    if (value == null || value === "") return undefined;
    return Number(value);
  };

  function getInputValue() {
    return parseNumber(iref.current.value);
  };

  function executeChangeEvent(value: number | null | undefined) {
    if (setterRef.current == null) {
      setterRef.current = createSetter();
    }
    setterRef.current?.call(
      iref.current,
      value == null ? "" : (
        document.activeElement === iref.current ?
          String(value) :
          format(value)
      )
    );
    iref.current.dispatchEvent(
      new Event("input", { bubbles: true })
    );
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const [value, isValid] = parseNumber(e.target.value);
    if (!isValid) {
      iref.current.value = safeValueRef.current ?? "";
      return;
    }
    safeValueRef.current = document.activeElement === iref.current ?
      String(value ?? "") :
      format(value);
    inputProps?.onChange?.(e);
  };

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    const [value, isValid] = getInputValue();
    if (isValid) {
      e.currentTarget.value = value == null || isNaN(value) ? "" : String(value);
    }
    inputProps?.onFocus?.(e);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const [value, isValid] = getInputValue();
    if (isValid) {
      const text = format(value);
      e.currentTarget.value = text || "";
    }
    inputProps?.onBlur?.(e);
  };

  function handleCompositionStart(e: CompositionEvent<HTMLInputElement>) {
    isComposing.current = true;
    inputProps?.onCompositionStart?.(e);
  };

  function handleCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    isComposing.current = false;
    inputProps?.onCompositionEnd?.(e);
  };

  function minmax(num: number | null | undefined) {
    if (num == null) return num;
    let ret = num;
    if (inputProps?.min != null) {
      ret = Math.max(inputProps.min, ret);
    }
    if (inputProps?.max != null) {
      ret = Math.min(inputProps.max, ret);
    }
    return ret;
  };

  function increment() {
    const [value, isValid] = getInputValue();
    if (!isValid) return;
    executeChangeEvent(
      value == null ?
        (inputProps?.min ?? 0) :
        minmax(value + Math.abs(inputProps?.step || 1))
    );
  };

  function decrement() {
    const [value, isValid] = getInputValue();
    if (!isValid) return;
    executeChangeEvent(
      value == null ?
        (inputProps?.min ?? 0) :
        minmax(value - Math.abs(inputProps?.step || 1))
    );
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
          executeChangeEvent(inputProps?.value);
        }
        break;
      default: break;
    }
    inputProps?.onKeyDown?.(e);
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

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
    format,
    parse,
    isComposing: () => isComposing.current,
  }));

  return (
    <InputField
      {...props}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
      ref={wref}
      state={state}
    >
      <input
        type={validScripts ? "text" : "number"}
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
        {...inputProps}
        className={clsx(
          "_ipt-box text-right z-0",
          validScripts && "pr-input-pad-btn",
          inputProps?.className,
        )}
        ref={iref}
        name={validScripts ? undefined : inputProps?.name}
        defaultValue={(() => {
          const v = bindMode === "state" ?
            inputProps?.defaultValue :
            inputProps?.value;
          if (v === undefined) return v;
          if (validScripts) return format(v);
          return v ?? "";
        })()}
        value={
          bindMode === "dom" ? undefined : (
            inputProps?.value === undefined ?
              undefined :
              inputProps?.value ?? ""
          )
        }
        inputMode={inputMode}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeydown}
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
            name={inputProps?.name}
            type="hidden"
            disabled={state.current === "disabled"}
            value={inputProps?.value ?? ""}
          />
        </>
      }
      {children}
    </InputField>
  );
};
