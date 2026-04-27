import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { $EnumSchema } from "$/shared/schema/$/enum";
import type { FormItem } from "$/shared/schema/$/form";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { ComboBox$, ComboBoxItem, type ComboBox$Ref } from ".";
import { LoadingBar } from "../../loading";
import { WithMessage$ } from "../message";

export interface ComboBoxRef extends ComboBox$Ref { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComboBoxProps<S extends $EnumSchema<any, any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<ComboBoxRef | null>;
    formItem: FormItem<S>;
    placeholder?: string;
    emptyText?: string;
    manualWidth?: boolean;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
    | "children"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComboBox<S extends $EnumSchema<any, any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  placeholder,
  emptyText,
  manualWidth,
  autoFocus,
  children,
}: ComboBoxProps<S>) {
  const ref$ = useRef<ComboBox$Ref>(null!);

  const {
    schemaItem,
    initialized,
    name,
    state,
    value,
    setValue,
    message,
    isInvalid,
    errormMessageId,
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
    initialized,
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
      {!initialized && <LoadingBar />}
      <ComboBox$
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value}
        onChangeValue={setValue}
        placeholder={placeholder}
        manualWidth={manualWidth}
        name={omitOnSubmit ? undefined : name}
        autoFocus={autoFocus}
      >
        {
          children ?? <>
            {
              !required &&
              <ComboBoxItem
                value=""
                displayValue=""
              >
                {emptyText}
              </ComboBoxItem>
            }
            {
              items?.map(item => {
                const key = String(item.value);
                return (
                  <ComboBoxItem
                    key={key}
                    value={key}
                    displayValue={item.text ?? ""}
                  >
                    {item.node ?? item.text}
                  </ComboBoxItem>
                );
              })
            }
          </>
        }
      </ComboBox$>
    </WithMessage$>
  );
};
