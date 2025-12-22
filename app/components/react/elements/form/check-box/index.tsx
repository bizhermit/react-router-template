import { useImperativeHandle, useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
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
  | "togglebox"
  ;

export type CheckBox$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
    trueValue?: string | number | boolean | null | undefined;
    falseValue?: string | number | boolean | null | undefined;
  } & InputCheckedProps>
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
  defaultChecked,
  onChangeChecked,
  trueValue,
  falseValue,
  ...props
}: CheckBox$Props) {
  const isControlled = "checked" in props;
  const { checked, ...wrapperProps } = props;

  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  const colorClassName = getColorClassName(color);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeChecked?.(e.currentTarget.checked);
    }
    inputProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies CheckBox$Ref));

  return (
    <InputLabelWrapper
      {...wrapperProps}
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
            appearance === "togglebox" ?
              clsx(
                "_ipt-switch",
                colorClassName,
                inputProps?.className
              ) :
              clsx(
                "appearance-none",
                inputProps?.className,
              )
        }
        ref={iref}
        type="checkbox"
        onChange={handleChange}
        {...isControlled
          ? { checked: checked ?? false }
          : { defaultChecked: defaultChecked ?? false }
        }
        value={String(trueValue)}
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
            isControlled &&
            <input
              type="hidden"
              name={inputProps.name}
              value={
                checked
                  ? String(trueValue ?? "on")
                  : String(falseValue ?? "")
              }
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
