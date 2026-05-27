import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { CheckBox, type CheckBoxAppearance, type CheckBoxRef } from ".";
import { useFormInput, type FormInputProps, type FormInputStyleProps } from "../../../../shared/hooks/$schema";
import type { $BoolSchema } from "../../../../shared/schema/boolean";
import type { FormItem } from "../../../../shared/schema/form";
import { WithMessage } from "../message";

export interface CheckBox$Ref extends CheckBoxRef { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CheckBoxProps<S extends $BoolSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoFocus"
    | "children"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckBox$<S extends $BoolSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  appearance = "checkbox",
  color,
  children,
  ...props
}: CheckBoxProps<S>) {
  const ref$ = useRef<CheckBoxRef>(null!);

  const {
    schemaItem,
    id,
    name,
    label,
    state,
    value,
    setValue,
    message,
    isInvalid,
    errormMessageId,
    errormessage,
    injectParams,
  } = useFormInput(formItem, {
    hideMessage,
    omitOnSubmit,
  });

  const {
    required,
  } = useMemo(() => {
    const required = schemaItem.getRequired(injectParams);
    return {
      required: required ? true : required,
    };
  }, [
    schemaItem,
    injectParams,
  ]);

  function handleChangeValue(checked: boolean) {
    setValue(checked ? schemaItem.getTrueValue() : schemaItem.getFalseValue());
  };

  useImperativeHandle(ref, () => ref$.current);

  return (
    <WithMessage
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <CheckBox
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        checked={schemaItem.getTrueValue() === value}
        onChangeChecked={handleChangeValue}
        trueValue={schemaItem.getTrueValue()}
        falseValue={schemaItem.getFalseValue()}
        color={color}
        appearance={appearance}
        inputProps={{
          ...props,
          id,
          name: omitOnSubmit ? undefined : name,
          required,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      >
        {children}
      </CheckBox>
    </WithMessage>
  );
};
