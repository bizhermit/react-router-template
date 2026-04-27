import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { FormItem } from "$/shared/schema/$/form";
import type { $StrSchema } from "$/shared/schema/$/string";
import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { PasswordBox$, type PasswordBox$Ref } from ".";
import { WithMessage$ } from "../message";

export interface PasswordBoxRef extends PasswordBox$Ref { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PasswordBoxProps<S extends $StrSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
  }
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
    | "autoComplete"
    | "autoCapitalize"
    | "enterKeyHint"
    | "children"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PasswordBox<S extends $StrSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  children,
  ...props
}: PasswordBoxProps<S>) {
  const ref$ = useRef<PasswordBox$Ref>(null!);

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
    minLength,
    maxLength,
  } = useMemo(() => {
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      minLength: schemaItem.getMinLength(injectParams) ?? undefined,
      maxLength: schemaItem.getMaxLength(injectParams) ?? undefined,
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
      <PasswordBox$
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
          minLength,
          maxLength,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      >
        {children}
      </PasswordBox$>
    </WithMessage$>
  );
};
