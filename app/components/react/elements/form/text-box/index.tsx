import { type InputHTMLAttributes, type ReactNode, type RefObject } from "react";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps } from "../common";

type TextBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<HTMLDivElement>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  inputRef?: RefObject<HTMLInputElement>;
  state?: Schema.Mode;
  children?: ReactNode;
}>;

export function TextBox$({
  ref,
  inputProps,
  inputRef,
  state = "enabled",
  children,
  ...props
}: TextBox$Props) {
  return (
    <InputField
      {...props}
      ref={ref}
      state={state}
    >
      <input
        type="text"
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        {...inputProps}
        className={clsx(
          "_ipt-box",
          inputProps?.className,
        )}
        ref={inputRef}
      />
      {children}
    </InputField>
  );
};
