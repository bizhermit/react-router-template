import { useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface TextBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type TextBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
    children?: ReactNode;
  }>
>;

export function TextBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  ...props
}: TextBox$Props) {
  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies TextBox$Ref));

  return (
    <InputFieldWrapper
      {...props}
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
      />
      {children}
    </InputFieldWrapper>
  );
};
