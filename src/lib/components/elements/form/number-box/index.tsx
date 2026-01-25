import { use, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { parseNumber } from "../../../../shared/objects/numeric";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
import { DownIcon, UpIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface NumberBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
  format: (value: unknown) => string;
  parse: (value: number | string | null | undefined) => (number | null | undefined);
};

export type NumberBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Overwrite<
      Omit<
        InputHTMLAttributes<HTMLInputElement>,
        InputOmitProps
      >,
      {
        min?: number;
        max?: number;
        step?: number;
        float?: number;
      }
    >;
    children?: ReactNode;
  } & InputValueProps<number, number | undefined>>
>;

const UP_DOWN_ROOP_WAIT = 500;
const UP_DOWN_INTERVAL = 50;

export function NumberBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  defaultValue,
  onChangeValue,
  ...props
}: NumberBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const [hasFocus, setHasFocus] = useState(false);
  const safeValue = useRef(isControlled ? value : defaultValue);
  const [rawValue, setRawValue] = useState(() => {
    return String((isControlled ? value : defaultValue) ?? "");
  });

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

  function format(v: unknown) {
    if (v == null || v === "") return "";
    const num = Number(v);
    if (isNaN(num)) return "";
    return formatter.format(num);
  };

  function parse(v: number | string | null | undefined) {
    if (v == null || v === "") return undefined;
    return Number(v);
  };

  function getInputValueAsNumber() {
    return parseNumber(iref.current.value);
  };

  function setInputValue(v: number | null | undefined) {
    iref.current.value = document.activeElement === iref.current
      ? String(value ?? "")
      : format(v);
  };

  function change(inputValue: string) {
    if (isControlled) setRawValue(inputValue);
    const [v, isValid] = parseNumber(inputValue);
    if (isValid) {
      safeValue.current = v;
      onChangeValue?.(v);
      return true;
    }
    if (isControlled) {
      setInputValue(value);
    } else {
      setInputValue(safeValue.current);
    }
    return false;
  };

  function executeChangeEvent(v: number | null | undefined) {
    if (setterRef.current == null) {
      setterRef.current = createSetter();
    }
    setterRef.current?.call(
      iref.current,
      v == null ? "" : (
        document.activeElement === iref.current ?
          String(v) :
          format(v)
      )
    );
    iref.current.dispatchEvent(
      new Event("input", { bubbles: true })
    );
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      change(e.currentTarget.value);
    }
    inputProps?.onChange?.(e);
  };

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setHasFocus(true);
    if (state === "enabled") {
      if (isControlled) {
        setRawValue(String(value ?? ""));
      } else {
        const [v, isValid] = getInputValueAsNumber();
        if (isValid) {
          setRawValue(e.currentTarget.value = (v == null || isNaN(v)) ? "" : String(v));
        } else {
          setRawValue(e.currentTarget.value);
        }
      }
    }
    inputProps?.onFocus?.(e);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setHasFocus(false);
    if (isControlled) setRawValue("");
    if (!isControlled) {
      const [v, isValid] = getInputValueAsNumber();
      if (isValid) {
        e.currentTarget.value = format(v) || "";
      }
    }
    inputProps?.onBlur?.(e);
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
    const [value, isValid] = getInputValueAsNumber();
    if (!isValid) return;
    executeChangeEvent(
      value == null ?
        (inputProps?.min ?? 0) :
        minmax(value + Math.abs(inputProps?.step || 1))
    );
  };

  function decrement() {
    const [value, isValid] = getInputValueAsNumber();
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
        if (state === "enabled") {
          increment();
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (state === "enabled") {
          decrement();
          e.preventDefault();
        }
        break;
      case "Enter":
        if (e.nativeEvent.isComposing) {
          e.preventDefault();
        } else {
          if (isControlled) {
            const [v, isValid] = getInputValueAsNumber();
            if (isValid) {
              executeChangeEvent(v);
            } else {
              setInputValue(value);
            }
          }
        }
        break;
      default: break;
    }
    inputProps?.onKeyDown?.(e);
  };

  const spinning = useRef(false);

  function startSpin(mode: "up" | "down") {
    if (spinning.current) return;
    spinning.current = true;
    if (mode === "up") increment();
    else decrement();

    const end = () => {
      spinning.current = false;
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });

    let lastTime = 0;
    function loop(time: number) {
      if (!spinning.current) return;
      if (lastTime === 0) {
        lastTime = time;
      }
      if (time - lastTime >= UP_DOWN_INTERVAL) {
        if (mode === "up") increment();
        else decrement();
        lastTime = time;
      }
      requestAnimationFrame(loop);
    };
    setTimeout(() => {
      if (spinning.current) {
        requestAnimationFrame(loop);
      }
    }, UP_DOWN_ROOP_WAIT);
  };

  function handlePointerdown(e: PointerEvent<HTMLButtonElement>, mode: "up" | "down") {
    if (state !== "enabled") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    iref.current.focus({ preventScroll: true });
    startSpin(mode);
  }

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
    format,
    parse,
  } as const satisfies NumberBox$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
      ref={wref}
      state={state}
    >
      <input
        type={validScripts ? "text" : "number"}
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        aria-invalid={invalid}
        {...inputProps}
        className={clsx(
          "_ipt-box text-right z-0",
          validScripts && "pr-input-pad-btn",
          inputProps?.className,
        )}
        ref={iref}
        name={validScripts ? undefined : inputProps?.name}
        inputMode={inputMode}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        onChange={handleChange}
        {...isControlled
          ? {
            value: validScripts
              ? (state === "enabled" && hasFocus ? rawValue : format(value))
              : value ?? "",
          }
          : {
            defaultValue: defaultValue ?? "",
          }
        }
      />
      {
        validScripts &&
        <>
          <div
            className={clsx(
              "_ipt-outer-spin-button",
              state !== "enabled" && "opacity-0"
            )}
          >
            <button
              type="button"
              aria-label="increment"
              tabIndex={-1}
              className={clsx(
                "_ipt-inner-spin-button items-end",
                state === "enabled" && "cursor-pointer",
              )}
              disabled={state !== "enabled"}
              onPointerDown={(e) => handlePointerdown(e, "up")}
              onContextMenu={(e) => e.preventDefault()}
            >
              <UpIcon />
            </button>
            <button
              type="button"
              aria-label="decrement"
              tabIndex={-1}
              className={clsx(
                "_ipt-inner-spin-button items-start",
                state === "enabled" && "cursor-pointer",
              )}
              disabled={state !== "enabled"}
              onPointerDown={(e) => handlePointerdown(e, "down")}
              onContextMenu={(e) => e.preventDefault()}
            >
              <DownIcon />
            </button>
          </div>
          {
            isControlled &&
            <input
              name={inputProps?.name}
              type="hidden"
              disabled={state === "disabled"}
              value={value ?? ""}
            />
          }
        </>
      }
      {children}
    </InputFieldWrapper>
  );
};
