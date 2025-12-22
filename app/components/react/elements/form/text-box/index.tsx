import { useImperativeHandle, useRef, useState, type ChangeEvent, type CompositionEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface TextBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type TextBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>,
      | "value"
      | "defaultValue"
      | "checked"
      | "defaultChecked"
    >;
    children?: ReactNode;
    onChangeValue?: (v: string) => void;
  } & (
      | {
        value: string | null | undefined;
        defaultValue?: never;
      }
      | {
        value?: never;
        defaultValue?: string | null | undefined;
      }
    )>
>;

export function TextBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  defaultValue,
  onChangeValue,
  ...props
}: TextBox$Props) {
  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const [isComposing, setIsComposing] = useState(false);

  function handleCompositionStart(e: CompositionEvent<HTMLInputElement>) {
    setIsComposing(true);
    inputProps?.onCompositionStart?.(e);
  };

  function handleCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    setIsComposing(false);
    onChangeValue?.(e.currentTarget.value);
    inputProps?.onCompositionEnd?.(e);
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled" && !isComposing) {
      onChangeValue?.(e.currentTarget.value);
    }
    props.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies TextBox$Ref));

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
        type="text"
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        aria-invalid={invalid}
        {...inputProps}
        className={clsx(
          "_ipt-box",
          inputProps?.className,
        )}
        ref={iref}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
      />
      {children}
    </InputFieldWrapper>
  );
};
