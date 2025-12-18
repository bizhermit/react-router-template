import { useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode, type RefObject } from "react";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps, type InputRef } from "../common";

export interface TextBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type TextBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  children?: ReactNode;
}>;

export function TextBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
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
      focus: () => iref.current.focus(),
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
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
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
