import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { $BoolSchema } from "$/shared/schema/$/boolean";
import type { FormItem } from "$/shared/schema/$/form";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { CheckBox$, type CheckBox$Ref, type CheckBoxAppearance } from ".";
import { WithMessage$ } from "../message";

export interface CheckBoxRef extends CheckBox$Ref { }

export type CheckBoxProps<S extends $BoolSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<CheckBoxRef | null>;
    formItem: FormItem<S>;
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoFocus"
    | "children"
  >;

export function CheckBox<S extends $BoolSchema<any>>({
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
  const ref$ = useRef<CheckBox$Ref>(null!);

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
    <WithMessage$
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <CheckBox$
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
      </CheckBox$>
    </WithMessage$>
  );
};
