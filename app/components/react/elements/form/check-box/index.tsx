import { useImperativeHandle, useRef, type InputHTMLAttributes } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputLabelText } from "../input-label-text";
import { InputLabelWrapper, type InputLabelProps, type InputLabelWrapperProps } from "../wrapper/input-label";

export interface CheckBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type CheckBoxAppearance =
  | "checkbox"
  | "button"
  ;

export type CheckBox$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
  }>
>;

export function CheckBox$({
  className,
  children,
  inputProps,
  ref,
  invalid,
  state = "enabled",
  appearance = "checkbox",
  color,
  ...props
}: CheckBox$Props) {
  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  const colorClassName = getColorClassName(color);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies CheckBox$Ref));

  return (
    <InputLabelWrapper
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
        disabled={state !== "enabled"}
        aria-disabled={state === "disabled"}
        aria-readonly={state === "readonly"}
        aria-invalid={invalid}
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
        className={
          appearance === "button" ?
            "px-0" :
            undefined
        }
      >
        {children}
      </InputLabelText>
      {
        state === "readonly" &&
        <>
          {
            inputProps?.name &&
            <input
              type="hidden"
              name={inputProps.name}
              value={inputProps.value as string || undefined}
            />
          }
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
    </InputLabelWrapper>
  );
};
