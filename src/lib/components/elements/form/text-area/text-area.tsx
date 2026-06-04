import { useImperativeHandle, useMemo, useRef, type RefObject, type TextareaHTMLAttributes } from "react";
import { TextArea, type TextAreaRef, type TextAreaResize } from ".";
import { useFormItem, type FormItemHookProps } from "../../../../shared/hooks/form/item";
import type { FormItem } from "../../../../shared/schema/form";
import type { $StrSchema } from "../../../../shared/schema/string";
import { WithMessage } from "../message";

export interface TextArea$Ref extends TextAreaRef { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TextArea$Props<S extends $StrSchema<any>> =
  & ElementStyleProps
  & FormItemHookProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
    resize?: TextAreaResize;
  }
  & (
    | {
      rows?: number;
      minRows?: undefined;
      maxRows?: undefined;
    }
    | {
      rows: "fit";
      minRows?: number;
      maxRows?: number;
    }
  )
  & Pick<TextareaHTMLAttributes<HTMLTextAreaElement>,
    | "placeholder"
    | "autoFocus"
    | "cols"
  >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TextArea$<S extends $StrSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  resize,
  minRows,
  maxRows,
  ...props
}: TextArea$Props<S>) {
  const ref$ = useRef<TextAreaRef>(null!);

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
      <TextArea
        ref={ref$}
        className={className}
        style={style}
        state={state}
        invalid={isInvalid}
        value={value}
        onChangeValue={setValue}
        resize={resize}
        minRows={minRows}
        maxRows={maxRows}
        textAreaProps={{
          ...props,
          id,
          name: omitOnSubmit ? undefined : name,
          required,
          minLength,
          maxLength,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}

      />
    </WithMessage>
  );
}
