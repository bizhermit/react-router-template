import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import type { FormItem } from "$/shared/schema/$/form";
import type { $StrSchema, StrPattern } from "$/shared/schema/$/string";
import { useImperativeHandle, useMemo, useRef, type HTMLAttributes, type HTMLInputTypeAttribute, type InputHTMLAttributes, type RefObject } from "react";
import { TextBox$, type TextBox$Ref } from ".";
import { WithMessage$ } from "../message";

export interface TextBoxRef extends TextBox$Ref { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TextBoxProps<S extends $StrSchema<any>> =
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
    | "list"
  >;

interface PatternProps {
  type?: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

function getPatternInputProps(pattern: StrPattern | undefined): PatternProps {
  if (pattern == null || typeof pattern !== "string") return {};
  switch (pattern) {
    case "int":
    case "h-num":
      return { inputMode: "decimal" };
    case "h-alpha":
    case "h-alpha-num":
    case "h-alpha-num-syn":
      return { inputMode: "url" };
    case "email":
      return { type: "email" };
    case "tel":
      return { type: "tel" };
    case "url":
      return { type: "url" };
    default:
      return {};
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TextBox<S extends $StrSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  ...props
}: TextBoxProps<S>) {
  const ref$ = useRef<TextBox$Ref>(null!);

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
    type,
    inputMode,
  } = useMemo(() => {
    const pattern = schemaItem.getPattern(injectParams) ?? undefined;
    const { type, inputMode } = getPatternInputProps(pattern);
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      minLength: schemaItem.getMinLength(injectParams) ?? undefined,
      maxLength: schemaItem.getMaxLength(injectParams) ?? undefined,
      type: type ?? "text",
      inputMode,
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
      <TextBox$
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
          type,
          inputMode,
          required,
          minLength,
          maxLength,
          "aria-label": label,
          "aria-errormessage": errormessage,
        }}
      />
    </WithMessage$>
  );
};
