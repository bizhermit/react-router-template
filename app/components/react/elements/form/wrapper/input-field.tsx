import type { HTMLAttributes, ReactNode, RefObject } from "react";
import { clsx, ZERO_WIDTH_SPACE } from "../../utilities";

export type InputFieldWrapperProps = Overwrite<
  Omit<HTMLAttributes<HTMLDivElement>,
    | "value"
    | "defaultValue"
    | "checked"
    | "defaultChecked"
  >,
  {
    ref?: RefObject<HTMLDivElement>;
    label?: ReactNode;
    state?: Schema.Mode;
  }
>;

export function InputFieldWrapper({
  className,
  children,
  ref,
  label,
  state,
  ...props
}: InputFieldWrapperProps) {
  if (state === "hidden") return null;

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "_ipt _ipt-field",
        className,
      )}
    >
      <fieldset
        aria-hidden
        className={`_ipt-field-appearance _ipt-field-${state || "enabled"}`}
      >
        <legend>
          {label ?? ZERO_WIDTH_SPACE}
        </legend>
      </fieldset>
      {children}
    </div>
  );
};

export type InputFieldProps<T = {}> = Overwrite<
  Omit<InputFieldWrapperProps,
    | "value"
    | "defaultValue"
    | "checked"
    | "defaultChecked"
  >,
  Overwrite<InputProps, T>
>;
