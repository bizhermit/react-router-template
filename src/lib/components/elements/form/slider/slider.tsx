import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { FormItem } from "$/shared/schema/$/form";
import type { $NumSchema } from "$/shared/schema/$/number";
import { useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { Slider$, type Slider$Ref } from ".";
import { WithMessage$ } from "../message";

export interface SliderRef extends Slider$Ref { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SliderProps<S extends $NumSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    step?: number;
    color?: StyleColor;
    showValueText?: boolean;
    scales?: $Schema.SourceItem<number>[];
    hideScales?: boolean;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoFocus"
  >;

export function Slider<S extends $NumSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  color,
  showValueText = false,
  scales,
  hideScales,
  ...props
}: SliderProps<S>) {
  const ref$ = useRef<Slider$Ref>(null!);

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
  } = useMemo(() => {
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      min: schemaItem.getMin(injectParams) ?? undefined,
      max: schemaItem.getMax(injectParams) ?? undefined,
    };
  }, [
    schemaItem,
    injectParams,
  ]);

  return (
    <WithMessage$
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <Slider$
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value}
        onChangeValue={setValue}
        color={color}
        showValueText={showValueText}
        dataList={scales ? {
          id: `${id}_list`,
          source: scales,
          hideScales,
        } : undefined}
        inputProps={{
          title: value == null ? undefined : String(value),
          ...props,
          name: omitOnSubmit ? undefined : name,
          required,
          min,
          max,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      />
    </WithMessage$>
  );
}
