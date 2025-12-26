import { ValidScriptsContext } from "$/shared/providers/valid-scripts";
import { use, useImperativeHandle, useRef, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { clsx } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface DateBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type DateBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Overwrite<
      Omit<InputHTMLAttributes<HTMLInputElement>, InputOmitProps>,
      {
        type: "date" | "month" | "datetime-local";
      }
    >;
    children?: ReactNode;
  } & InputValueProps<string>>
>;

export function DateBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  children,
  defaultValue,
  onChangeValue,
  ...props
}: DateBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;
  const type = inputProps?.type || "date";

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  function applyInputedValue() {
    iref.current.value = iref.current.value || ""; // NOTE: 日付が揃っていない場合はクリア
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (state === "enabled") {
      if (e.key === "Enter") applyInputedValue();
    }
    inputProps?.onKeyDown?.(e);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    applyInputedValue();
    inputProps?.onBlur?.(e);
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    inputProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies DateBox$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
      ref={wref}
      state={state}
    >
      <input
        disabled={state !== "enabled"}
        aria-disabled={state === "disabled"}
        aria-readonly={state === "readonly"}
        aria-invalid={invalid}
        {...inputProps}
        className={clsx(
          "_ipt-box",
          validScripts && "_ipt-date",
          inputProps?.className,
        )}
        ref={iref}
        type={type}
        name={state === "readonly" ? undefined : inputProps?.name}
        onKeyDown={handleKeydown}
        onBlur={handleBlur}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
        data-hasvalue={isControlled ? !!value : true}
        data-controlled={isControlled}
      />
      {
        state === "readonly" &&
        <>
          {
            inputProps?.name &&
            isControlled &&
            <input
              type="hidden"
              name={inputProps.name}
              value={value || undefined}
            />
          }
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
      {children}
    </InputFieldWrapper>
  );
}
