import { useImperativeHandle, useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputLabelText } from "../input-label-text";
import { InputLabelWrapper, type InputLabelProps, type InputLabelWrapperProps } from "../wrapper/input-label";

/** チェックボックス ref オブジェクト */
export interface CheckBox$Ref extends InputRef {
  /** DOM input[type="checkbox"] */
  inputElement: HTMLInputElement;
};

/** チェックボックス見た目 */
export type CheckBoxAppearance =
  | "checkbox"
  | "button"
  | "togglebox"
  ;

/** チェックボックス Props */
export type CheckBox$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    /** input Props */
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    /** チェックボックス見た目 */
    appearance?: CheckBoxAppearance;
    /** チェックボックス配色 */
    color?: StyleColor;
    /** チェック時の値 */
    trueValue?: string | number | boolean | null | undefined;
    /** 未チェック時の値 */
    falseValue?: string | number | boolean | null | undefined;
  } & InputCheckedProps>
>;

/**
 * チェックボックス
 * @param param {@link CheckBox$Props}
 * @returns
 */
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
