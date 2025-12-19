import { useImperativeHandle, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus, InputLabel, InputLabelText, type InputLabelProps, type InputRef } from "../common";

export interface RadioButton$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type RadioButtonAppearance =
  | "radio"
  | "button"
  ;

export type RadioButton$Props = Overwrite<InputLabelProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  appearance?: RadioButtonAppearance;
  color?: StyleColor;
  omitDummy?: boolean;
}>;

export function RadioButton$({
  ref,
  inputProps,
  state = { current: "enabled" },
  className,
  children,
  appearance,
  color,
  omitDummy,
  ...props
}: RadioButton$Props) {
  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement | null>(null);

  const colorClassName = getColorClassName(color);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies RadioButton$Ref));

  return (
    <InputLabel
      {...props}
      className={
        appearance === "button" ?
          clsx(
            "_ipt-label-button",
            colorClassName,
            className,
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
          appearance === "radio" ?
            clsx(
              "_ipt-point _ipt-radio",
              colorClassName,
              inputProps?.className,
            ) :
            clsx(
              "appearance-none",
              inputProps?.className,
            )
        }
        type="radio"
      />
      <InputLabelText
        className={
          appearance === "button" ?
            "px-0" :
            undefined
        }
      >
        {children}
      </InputLabelText>
      {
        state.current === "readonly" &&
        !omitDummy &&
        <InputDummyFocus
          ref={dref}
        />
      }
    </InputLabel>
  );
};
