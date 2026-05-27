import { useImperativeHandle, useMemo, useRef, type RefObject, type SelectHTMLAttributes } from "react";
import { SelectBox, SelectBoxEmptyOption, type SelectBoxRef } from ".";
import { useFormInput, type FormInputProps, type FormInputStyleProps } from "../../../../shared/hooks/$schema";
import type { $EnumSchema } from "../../../../shared/schema/$/enum";
import type { FormItem } from "../../../../shared/schema/$/form";
import { WithMessage$ } from "../message";

export interface SelectBox$Ref extends SelectBoxRef { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectBox$Props<S extends $EnumSchema<any, any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    placeholder?: string;
    emptyText?: string;
  }
  & Pick<SelectHTMLAttributes<HTMLSelectElement>,
    | "autoFocus"
    | "autoComplete"
    | "autoCapitalize"
    | "enterKeyHint"
    | "children"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelectBox$<S extends $EnumSchema<any, any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  placeholder,
  emptyText,
  children,
  ...props
}: SelectBox$Props<S>) {
  const ref$ = useRef<SelectBoxRef>(null!);

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
    items,
  } = useMemo(() => {
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      items: schemaItem.getItems(),
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
      <SelectBox
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value}
        onChangeValue={setValue}
        placeholder={placeholder}
        selectProps={{
          ...props,
          id,
          name: omitOnSubmit ? undefined : name,
          required,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      >
        {
          children ?? <>
            <SelectBoxEmptyOption
              required={required}
            >
              {emptyText}
            </SelectBoxEmptyOption>
            {
              items?.map(item => {
                const key = String(item.value);
                return (
                  <option
                    key={key}
                    value={key}
                  >
                    {item.node ?? item.text}
                  </option>
                );
              })
            }
          </>
        }
      </SelectBox>
    </WithMessage$>
  );
};
