import { type ChangeEvent, type InputHTMLAttributes, type ReactNode, type RefObject } from "react";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps } from "../common";

type TextBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<HTMLDivElement>;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">;
  inputRef?: RefObject<HTMLInputElement>;
  state?: Schema.Mode;
  children?: ReactNode;
  value?: string | null | undefined;
  onChangeValue?: (value: string) => void;
}>;

export function TextBox$({
  ref,
  inputProps,
  inputRef,
  state = "enabled",
  className,
  children,
  value,
  onChangeValue,
  ...props
}: TextBox$Props) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChangeValue?.(e.target.value);
    inputProps?.onChange?.(e);
  };

  return (
    <InputField
      {...props}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
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
        onChange={handleChange}
        defaultValue={value || undefined}
      />
      {children}
    </InputField>
  );
};
