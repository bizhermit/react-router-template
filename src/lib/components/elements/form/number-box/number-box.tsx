import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { FormItem } from "$/shared/schema/$/form";
import type { $NumSchema } from "$/shared/schema/$/number";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { NumberBox$, type NumberBox$Ref } from ".";
import { WithMessage$ } from "../message";

export interface NumberBoxRef extends NumberBox$Ref { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NumberBoxProps<S extends $NumSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<NumberBoxRef | null>;
    formItem: FormItem<S>;
    step?: number;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
    | "autoComplete"
    | "enterKeyHint"
    | "list"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NumberBox<S extends $NumSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  ...props
}: NumberBoxProps<S>) {
  const ref$ = useRef<NumberBox$Ref>(null!);

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
    <WithMessage$
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <NumberBox$
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
      />
    </WithMessage$>
  );
}
