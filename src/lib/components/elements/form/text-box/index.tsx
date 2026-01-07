import { useImperativeHandle, useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface TextBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type TextBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    children?: ReactNode;
  } & InputValueProps<string>>
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    inputProps?.onChange?.(e);
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
