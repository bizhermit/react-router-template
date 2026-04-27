import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import { $DateTime } from "$/shared/objects/timestamp";
import { $DateSchema } from "$/shared/schema/$/date";
import { $DateTimeSchema } from "$/shared/schema/$/datetime";
import type { FormItem } from "$/shared/schema/$/form";
import { $MonthSchema } from "$/shared/schema/$/month";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { DateBox$, type DateBox$Ref } from ".";
import { WithMessage$ } from "../message";

type DateBoxSchemaItem =
  | $DateSchema<any>
  | $DateTimeSchema<any>
  | $MonthSchema<any>;

export interface DateBoxRef extends DateBox$Ref { }

export type DateBoxProps<S extends DateBoxSchemaItem> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
    | "list"
    | "step"
    | "children"
  >;

export function DateBox<S extends DateBoxSchemaItem>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  placeholder,
  children,
  ...props
}: DateBoxProps<S>) {
  const ref$ = useRef<DateBox$Ref>(null!);

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
    type,
    formatPattern,
  } = useMemo(() => {
    let min = new $DateTime("1900-01-01T00:00:00");
    const minMonth = schemaItem.getMinMonth(injectParams);
    if (minMonth && min.isBefore(minMonth)) {
      min = new $DateTime(minMonth);
    }
    const minDate = schemaItem.getMinDate(injectParams);
    if (minDate && min.isBefore(minDate)) {
      min = new $DateTime(minDate);
    }
    const minDateTime = schemaItem.getMinDateTime(injectParams);
    if (minDateTime && min.isBefore(minDateTime)) {
      min = new $DateTime(minDateTime);
    }

    let max = new $DateTime("2999-12-31T23:59:59");
    const maxMonth = schemaItem.getMaxMonth(injectParams);
    if (maxMonth && max.isAfter(maxMonth)) {
      max = new $DateTime(maxMonth);
    }
    const maxDate = schemaItem.getMaxDate(injectParams);
    if (maxDate && max.isAfter(maxDate)) {
      max = new $DateTime(maxDate);
    }
    const maxDateTime = schemaItem.getMaxDateTime(injectParams);
    if (maxDateTime && max.isAfter(maxDateTime)) {
      max = new $DateTime(maxDateTime);
    }

    let type: "date" | "month" | "datetime-local" = "date";
    let formatPattern = "yyyy-MM-dd";
    if (schemaItem instanceof $MonthSchema) {
      type = "month";
      formatPattern = "yyyy-MM";
    } else if (schemaItem instanceof $DateTimeSchema) {
      type = "datetime-local";
      formatPattern = "yyyy-MM-ddThh:mm:ss";
    }

    return {
      required: schemaItem.getRequired(injectParams),
      max: max.toString(formatPattern),
      min: min.toString(formatPattern),
      type,
      formatPattern,
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
      <DateBox$
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value?.toString(formatPattern)}
        onChangeValue={setValue}
        inputProps={{
          ...props,
          type,
          id,
          name: omitOnSubmit ? undefined : name,
          placeholder,
          required,
          min,
          max,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      >
        {children}
      </DateBox$>
    </WithMessage$>
  );
}
