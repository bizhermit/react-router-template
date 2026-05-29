import { useImperativeHandle, useMemo, useRef, type InputHTMLAttributes, type RefObject } from "react";
import { PasswordBox, type PasswordBoxRef } from ".";
import { useFormItem, type FormItemHookProps } from "../../../../shared/hooks/form/item";
import type { FormItem } from "../../../../shared/schema/form";
import type { $StrSchema } from "../../../../shared/schema/string";
import { WithMessage } from "../message";

export interface PasswordBox$Ref extends PasswordBoxRef { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PasswordBox$Props<S extends $StrSchema<any>> =
  & ElementStyleProps
  & FormItemHookProps
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
export function PasswordBox$<S extends $StrSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  children,
  ...props
}: PasswordBox$Props<S>) {
  const ref$ = useRef<PasswordBoxRef>(null!);

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
    refValuesString,
  } = useFormItem(formItem, {
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
    refValuesString,
  ]);

  useImperativeHandle(ref, () => ref$.current);

  return (
    <WithMessage
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={message}
    >
      <PasswordBox
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
      </PasswordBox>
    </WithMessage>
  );
};
