import { useImperativeHandle, useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputLabelText } from "../input-label-text";
import { InputLabelWrapper, type InputLabelProps, type InputLabelWrapperProps } from "../wrapper/input-label";

/** ラジオボタン ref オブジェクト */
export interface RadioButton$Ref extends InputRef {
  /** DOM input */
  inputElement: HTMLInputElement;
};

/** ラジオボタン見た目 */
export type RadioButtonAppearance =
  | "radio"
  | "button"
  ;

/** ラジオボタン Props */
export type RadioButton$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    /** input Props */
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    /** 見た目 */
    appearance?: RadioButtonAppearance;
    /** 配色 */
    color?: StyleColor;
    /** 値 */
    value?: string | number | boolean;
  } & InputCheckedProps>
>;

/**
 * ラジオボタン（単項目）
 * @param param {@link Radiobuttonpro}
 * @returns
 */
export function RadioButton$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  appearance,
  color,
  defaultChecked,
  onChangeChecked,
  value,
  ...props
}: RadioButton$Props) {
  const isControlled = "checked" in props;
  const { checked, ...wrapperProps } = props;

  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLInputElement | null>(null);

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
  } as const satisfies RadioButton$Ref));

  return (
    <InputLabelWrapper
      {...wrapperProps}
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
        disabled={state !== "enabled"}
        aria-disabled={state === "disabled"}
        aria-readonly={state === "readonly"}
        aria-invalid={invalid}
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
        onChange={handleChange}
        {...isControlled
          ? { checked: checked ?? false }
          : { defaultChecked: defaultChecked ?? false }
        }
        value={String(value)}
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
        <InputDummyFocus
          ref={dref}
        />
      }
    </InputLabelWrapper>
  );
};
