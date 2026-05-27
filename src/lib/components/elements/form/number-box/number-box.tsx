import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { NumberBox, type NumberBoxRef } from ".";
import { useFormInput, type FormInputProps, type FormInputStyleProps } from "../../../../shared/hooks/schema";
import type { FormItem } from "../../../../shared/schema/form";
import type { $NumSchema } from "../../../../shared/schema/number";
import { WithMessage } from "../message";

export interface NumberBox$Ref extends NumberBoxRef { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NumberBox$Props<S extends $NumSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    step?: number;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
    | "autoComplete"
    | "enterKeyHint"
    | "list"
    | "children"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NumberBox$<S extends $NumSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  children,
  ...props
}: NumberBox$Props<S>) {
  const ref$ = useRef<NumberBoxRef>(null!);

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
    min,
    max,
    float,
  } = useMemo(() => {
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      min: schemaItem.getMin(injectParams) ?? undefined,
      max: schemaItem.getMax(injectParams) ?? undefined,
      float: schemaItem.getFloat(injectParams) ?? undefined,
    };
  }, [
    schemaItem,
    injectParams,
  ]);

  useImperativeHandle(ref, () => ref$.current);

  return (
    <WithMessage
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <NumberBox
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value}
        onChangeValue={setValue}
        inputProps={{
          ...props,
          id,
          name: omitOnSubmit ? undefined : name,
          required,
          min,
          max,
          float,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      >
        {children}
      </NumberBox>
    </WithMessage>
  );
}
