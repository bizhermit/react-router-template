import { useImperativeHandle, useMemo, useRef, type MouseEvent, type RefObject, type SelectHTMLAttributes } from "react";
import { RadioButton, type RadioButtonAppearance, type RadioButtonRef } from ".";
import { useFormInput, type FormInputProps, type FormInputStyleProps } from "../../../../shared/hooks/$schema";
import type { $EnumSchema } from "../../../../shared/schema/enum";
import type { FormItem } from "../../../../shared/schema/form";
import { WithMessage } from "../message";
import { InputGroupWrapper } from "../wrapper/input-group";

export interface RadioButtons$Ref extends InputRef { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RadioButtons$Props<S extends $EnumSchema<any, any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    appearance?: RadioButtonAppearance;
    color?: StyleColor;
  }
  & Pick<SelectHTMLAttributes<HTMLSelectElement>,
    | "autoFocus"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RadioButtons$<S extends $EnumSchema<any, any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  appearance = "radio",
  color,
  autoFocus,
}: RadioButtons$Props<S>) {
  const wref = useRef<HTMLDivElement>(null!);
  const firstRef = useRef<RadioButtonRef | null>(null);

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

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state !== "enabled") return;
    if (required) return;
    e.currentTarget.checked = false;
    setValue(undefined);
  };

  const hasValue = value != null;

  useImperativeHandle(ref, () => ({
    element: wref.current,
    focus: () => firstRef.current?.focus(),
  } as const satisfies RadioButtons$Ref));

  return (
    <WithMessage
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <InputGroupWrapper
        id={id}
        className={className}
        style={style}
        ref={wref}
        state={state}
      >
        {items?.map((item, index) => {
          const key = String(item.value);
          const isSelected = item.value === value;

          return (
            <RadioButton
              key={key}
              ref={index === 0 ? firstRef : undefined}
              invalid={isInvalid}
              state={state}
              color={color}
              appearance={appearance}
              checked={isSelected}
              value={key}
              onChangeChecked={() => setValue(key)}
              inputProps={{
                name,
                required,
                onClick: handleClick,
                "aria-label": `${label ? `${label} - ` : ""}${item.text}`,
                "aria-errormessage": errormessage,
                autoFocus: autoFocus
                  ? (hasValue ? isSelected : index === 0)
                  : undefined,
              }}
            >
              {item.node ?? item.text}
            </RadioButton>
          );
        })}
        {
          state === "readonly" &&
          <input
            type="hidden"
            name={omitOnSubmit ? undefined : name}
            value={value as string ?? undefined}
          />
        }
      </InputGroupWrapper>
    </WithMessage>
  );
};
