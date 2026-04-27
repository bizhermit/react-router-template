import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { FormItem } from "$/shared/schema/$/form";
import type { $StrSchema } from "$/shared/schema/$/string";
import { useImperativeHandle, useMemo, useRef, type RefObject, type TextareaHTMLAttributes } from "react";
import { TextArea$, type TextArea$Ref, type TextAreaResize } from ".";
import { WithMessage$ } from "../message";

export interface TextAreaRef extends TextArea$Ref { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TextAreaProps<S extends $StrSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
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
export function TextArea<S extends $StrSchema<any>>({
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
}: TextAreaProps<S>) {
  const ref$ = useRef<TextArea$Ref>(null!);

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
      <TextArea$
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
    </WithMessage$>
  );
}
