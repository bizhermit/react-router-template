import { useImperativeHandle, useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

/** テキストボックス ref オブジェクト  */
export interface TextBox$Ref extends InputRef {
  /** DOM input */
  inputElement: HTMLInputElement;
};

/** テキストボックス Props */
export type TextBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    /** input Props */
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
    /** 子要素（ボタン他） */
    children?: ReactNode;
  } & InputValueProps<string>>
>;

/**
 * テキストボックス
 * @param param {@link TextBox$Props}
 * @returns
 */
export function TextBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  defaultValue,
  onChangeValue,
  ...props
}: TextBox$Props) {
  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    inputProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies TextBox$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
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
        aria-invalid={invalid}
        autoComplete="off"
        {...inputProps}
        className={clsx(
          "_ipt-box",
          inputProps?.className,
        )}
        ref={iref}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
      />
      {children}
    </InputFieldWrapper>
  );
};
