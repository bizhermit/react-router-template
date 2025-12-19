import { useImperativeHandle, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus, InputLabel, InputLabelText, type InputLabelProps, type InputRef } from "../common";

export interface CheckBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type CheckBoxAppearance =
  | "checkbox"
  | "button"
  ;

export type CheckBox$Props = Overwrite<InputLabelProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  appearance?: CheckBoxAppearance;
  color?: StyleColor;
}>;

export function CheckBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
  className,
  children,
  appearance = "checkbox",
  color,
  ...props
}: CheckBox$Props) {
  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  const colorClassName = getColorClassName(color);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies CheckBox$Ref));

  return (
    <InputLabel
      {...props}
      ref={wref}
      state={state}
      className={
        appearance === "button" ?
          clsx(
            "_ipt-label-button",
            colorClassName,
            className
          ) :
          className
      }
    >
      <input
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        {...inputProps}
        className={
          appearance === "checkbox" ?
            clsx(
              "_ipt-point _ipt-check",
              colorClassName,
              inputProps?.className,
            ) :
            clsx(
              "appearance-none",
              inputProps?.className,
            )
        }
        ref={iref}
        type="checkbox"
      />
      <InputLabelText
        className={appearance === "button" ? "px-0" : undefined}
      >
        {children}
      </InputLabelText>
      {
        state.current === "readonly" &&
        inputProps?.name &&
        <>
          <input
            type="hidden"
            name={inputProps.name}
            value={inputProps.value as string || undefined}
          />
          <InputDummyFocus />
        </>
      }
    </InputLabel>
  );
};
