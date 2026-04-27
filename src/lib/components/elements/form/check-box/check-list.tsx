import { useFormInput, useSchemaInitizlied, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { $ArrSchema, ArrayProps } from "$/shared/schema/$/array";
import type { $EnumSchema } from "$/shared/schema/$/enum";
import type { FormItem } from "$/shared/schema/$/form";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { CheckBox$, type CheckBox$Ref, type CheckBoxAppearance } from ".";
import { LoadingBar } from "../../loading";
import { WithMessage$ } from "../message";
import { InputGroupWrapper } from "../wrapper/input-group";

export interface CheckListRef extends InputRef { }

export type CheckListProps<
  E extends $EnumSchema<any, any>,
  S extends $ArrSchema<E, ArrayProps<E>>
> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<CheckListRef | null>;
    formItem: FormItem<S>;
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoFocus"
  >;

export function CheckList<
  E extends $EnumSchema<any, any>,
  S extends $ArrSchema<E, ArrayProps<E>>
>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  appearance,
  color,
  autoFocus,
}: CheckListProps<E, S>) {
  const wref = useRef<HTMLDivElement>(null!);
  const firstRef = useRef<CheckBox$Ref | null>(null);

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

  const enumSchema = formItem.getSchemaItem().getChild();

  const initializedEnum = useSchemaInitizlied(enumSchema);

  const {
    items,
    required,
  } = useMemo(() => {
    return {
      items: enumSchema.getItems(),
      required: schemaItem.getRequired(injectParams),
    };
  }, [
    schemaItem,
    enumSchema,
    initializedEnum,
    injectParams,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleChange(v: any) {
    if (state !== "enabled") return;
    const newValue = [...value ?? []];
    const index = newValue.findIndex(item => item === v);
    if (index < 0) {
      newValue.push(v);
    } else {
      newValue.splice(index, 1);
    }
    setValue(newValue);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    focus: () => firstRef.current?.focus(),
  } as const satisfies CheckListRef));

  return (
    <WithMessage$
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      {!initializedEnum && <LoadingBar />}
      <InputGroupWrapper
        id={id}
        className={className}
        style={style}
        ref={wref}
        state={state}
      >
        {items?.map((item, index) => {
          const key = String(item.value);
          const isChecked = value?.some(v => v === item.value);

          return (
            <CheckBox$
              key={key}
              ref={index === 0 ? firstRef : undefined}
              state={state}
              invalid={isInvalid}
              appearance={appearance}
              color={color}
              checked={isChecked}
              onChangeChecked={() => handleChange(item.value)}
              trueValue={key}
              inputProps={{
                name: omitOnSubmit ? undefined : name,
                required,
                "aria-label": `${label ? `${label} - ` : ""}${item.text}`,
                "aria-errormessage": errormessage,
                autoFocus: autoFocus ? index === 0 : undefined,
              }}
            >
              {item.node ?? item.text}
            </CheckBox$>
          );
        })}
      </InputGroupWrapper>
    </WithMessage$>
  );
};
