import { useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode, type RefObject } from "react";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps } from "../common";

export type TextBox$Ref = {
  element: HTMLDivElement;
  inputElement: HTMLInputElement;
};

export type TextBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<TextBox$Ref>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  state?: Schema.Mode;
  children?: ReactNode;
}>;

export function TextBox$({
  ref,
  inputProps,
  state = "enabled",
  className,
  children,
  ...props
}: TextBox$Props) {
  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  useImperativeHandle(ref, () => {
    return {
      element: wref.current,
      inputElement: iref.current,
    };
  });

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
        type="text"
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        {...inputProps}
        className={clsx(
          "_ipt-box",
          inputProps?.className,
        )}
        ref={iref}
      />
      {children}
    </InputField>
  );
};
