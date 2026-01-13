import { createContext, use, useId, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { containElement } from "../../../../client/dom/contain";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
import { DownIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

type AtomValueType = string | number | boolean;

export interface ComboBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type ComboBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    name?: string;
    initValue?: AtomValueType | null | undefined;
    placeholder?: string;
    children?: ReactNode;
  } & (
      | ({
        multiple?: false;
      } & InputValueProps<AtomValueType, string>)
      | ({
        multiple: true;
      } & InputValueProps<AtomValueType[]>)
    )
  >
>;

export interface ComboBoxContextProps {
  name: string;
  popoverId: string;
  multiple: boolean;
  state: Schema.Mode;
  value: AtomValueType[];
  isControlled: boolean;
  filterText: string;
  change: () => void;
};

const ComboBoxContext = createContext<ComboBoxContextProps | null>(null);

const ITEM_SELECTOR_BASE = `label[aria-hidden="false"]`;

export function ComboBox$({
  ref,
  invalid,
  inputProps,
  className,
  style,
  placeholder,
  state = "enabled",
  children,
  name,
  multiple = false,
  autoFocus,
  defaultValue,
  initValue,
  onChangeValue,
  onBlur,
  ...props
}: ComboBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const id = useId();
  const $name = name || id;
  const popoverId = `${$name}_picker`;

  const arrayValue = useMemo(() => {
    if (value == null || value === "") return [];
    if (Array.isArray(value)) return value.map(v => String(v ?? ""));
    return [String(value)];
  }, [value]);

  const [filterText, setFilterText] = useState("");

  const iref = useRef<HTMLInputElement>(null!);
  const lref = useRef<HTMLDivElement>(null!);

  function scrollIntoValue(focus = false) {
    let target = lref.current.querySelector(`${ITEM_SELECTOR_BASE}:has(input:checked)`) as HTMLElement | null;
    if (!target && initValue != null) {
      target = lref.current.querySelector(`${ITEM_SELECTOR_BASE}:has(input[value="${initValue}"])`);
    }
    if (!target) target = lref.current.querySelector(ITEM_SELECTOR_BASE);
    if (!target) return;
    lref.current.scrollTop = target.offsetTop - (lref.current.offsetHeight - target.offsetHeight) / 2;
    if (focus) target.querySelector(`input`)?.focus();
  }

  function handleChange() {
    if (state !== "enabled") return;
    if (multiple) {
      const elems = Array.from(lref.current.querySelectorAll(`input:checked`)) as HTMLInputElement[];
      const vals = elems.map(elem => elem.value).filter(v => !(v == null || v === ""));
      (onChangeValue as ((v: string[]) => void) | undefined)?.(vals);
    } else {
      const elem = lref.current.querySelector(`input:checked`) as HTMLInputElement | null;
      const val = elem?.value || "";
      (onChangeValue as ((v: string) => void) | undefined)?.(val);
    }
  };

  function handleChangeText(e: ChangeEvent<HTMLInputElement>) {
    setFilterText(e.currentTarget.value);
    inputProps?.onChange?.(e);
  };

  function handleKeydownText(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
        scrollIntoValue(true);
        break;
      case "Tab":
        if (!e.shiftKey) {
          e.preventDefault();
          scrollIntoValue(true);
        }
        break;
      default:
        break;
    }
    inputProps?.onKeyDown?.(e);
  };

  function handleFocusText(e: FocusEvent<HTMLInputElement>) {
    scrollIntoValue(false);
    inputProps?.onFocus?.(e);
  };

  function handleKeyDownList(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "Escape":
        iref.current.focus();
        break;
      default:
        break;
    }
  };

  function handleBlur(e: FocusEvent<HTMLDivElement>) {
    const target = e.relatedTarget;
    if (
      target == null ||
      !(target === iref.current || containElement(lref.current, target))
    ) {
      setFilterText(iref.current.value = "");
    }
    onBlur?.(e);
  };

  return (
    <InputFieldWrapper
      {...wrapperProps}
      className={clsx(
        "_ipt-combox-box",
        className,
      )}
      style={{
        ...style,
        anchorName: `--${popoverId}`,
      }}
      state={state}
      onBlur={handleBlur}
    >
      <input
        type="text"
        disabled={state === "disabled"}
        readOnly={state === "readonly" || !validScripts}
        aria-invalid={invalid}
        {...inputProps}
        className={clsx(
          "_ipt-box _ipt-combo-text",
          inputProps?.className,
        )}
        ref={iref}
        onChange={handleChangeText}
        onKeyDown={handleKeydownText}
        onFocus={handleFocusText}
        placeholder={placeholder}
        data-validjs={validScripts}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className={clsx(
          "_ipt-btn",
          state === "enabled" ? "cursor-pointer" : "opacity-0",
        )}
        tabIndex={-1}
      >
        <DownIcon />
      </button>
      <div
        className="_ipt-combo-dummy"
        aria-hidden
      >
        {children}
      </div>
      <div
        className="_ipt-combo-picker"
        style={{
          positionAnchor: `--${popoverId}`,
        }}
      >
        <div
          ref={lref}
          className="_ipt-combo-list"
          tabIndex={-1}
          onChange={handleChange}
          onKeyDown={handleKeyDownList}
        >
          <ComboBoxContext
            value={{
              name: $name,
              popoverId,
              multiple,
              state,
              value: arrayValue,
              isControlled,
              filterText,
              change: handleChange,
            }}
          >
            {children}
          </ComboBoxContext>
        </div>
      </div>
    </InputFieldWrapper>
  );
};

export type ComboBoxItemProps = Overwrite<
  HTMLAttributes<HTMLLabelElement>,
  {
    ref?: RefObject<HTMLLabelElement>;
    value: string | number | boolean | null | undefined;
    onMovePrev?: () => void;
    onMoveNext?: () => void;
  } & (
    | {
      displayValue: string;
      children?: ReactNode;
    }
    | {
      displayValue?: never;
      children?: string;
    }
  )
>;

export function ComboBoxItem({
  ref,
  value,
  className,
  children,
  displayValue,
  onMovePrev,
  onMoveNext,
  onKeyDown,
  ...props
}: ComboBoxItemProps) {
  const ctx = use(ComboBoxContext);

  const text = displayValue ?? children;

  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  function movePrevItem() {
    if (onMovePrev) {
      onMovePrev();
      return;
    }
    let elem: HTMLElement | null = wref.current;
    while (elem) {
      elem = (elem.previousElementSibling as HTMLElement | null);
      if (!elem) return;
      if (elem.getAttribute("aria-hidden") === "true") continue;
      elem.scrollIntoView();
      elem.focus();
      break;
    }
  };

  function moveNextItem() {
    if (onMoveNext) {
      onMoveNext();
      return;
    }
    let elem: HTMLElement | null = wref.current;
    while (elem) {
      elem = (elem.nextElementSibling as HTMLElement | null);
      if (!elem) return;
      if (elem.getAttribute("aria-hidden") === "true") continue;
      elem.scrollIntoView();
      elem.focus();
      break;
    }
  };

  function handleKeydown(e: KeyboardEvent<HTMLLabelElement>) {
    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        iref.current.checked = ctx?.multiple ? !iref.current.checked : true;
        ctx?.change();
        break;
      }
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        movePrevItem();
        break;
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        moveNextItem();
        break;
      default:
        break;
    }
    onKeyDown?.(e);
  };

  useImperativeHandle(ref, () => wref.current);

  const isHidden = !!ctx?.filterText && !text?.includes(ctx.filterText);

  const valueStr = String(value ?? "");

  return (
    <label
      {...props}
      ref={wref}
      className={clsx(
        "_ipt-combo-item",
        className,
      )}
      aria-hidden={isHidden}
      onKeyDown={handleKeydown}
    >
      {ctx &&
        <input
          ref={iref}
          className="_ipt-combo-item-check"
          name={ctx.name ?? undefined}
          type={ctx.multiple ? "checkbox" : "radio"}
          disabled={ctx.state !== "enabled"}
          aria-disabled={ctx.state === "disabled"}
          aria-readonly={ctx.state === "readonly"}
          value={valueStr}
          aria-label={text}
          tabIndex={isHidden ? -1 : undefined}
          {...ctx.isControlled
            ? { checked: ctx.value.some(v => v === valueStr) }
            : { defaultChecked: ctx.value.some(v => v === valueStr) }
          }
        />}
      <div className="_ipt-combo-item-label">
        {children}
      </div>
    </label>
  );
}
