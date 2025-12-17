import { getValidationArray } from "./utilities";

function ARRAY_PARSER({ value }: Schema.ParserParams): Schema.ParserResult<Array<unknown>> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  if (Array.isArray(value)) {
    return { value };
  }
  return { value: [value] };
};

export function $array<Props extends Schema.ArrayProps>(props: Props) {
  const key = props.prop.type === "struct" ? props.prop.key : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validators: Array<Schema.Validator<Array<any>, Schema.Result>> = [];

  const actionType = props?.actionType ?? "set";
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [length, getLengthMessage] = getValidationArray(props?.len);
  const [minLength, getMinLengthMessage] = getValidationArray(props?.min);
  const [maxLength, getMaxLengthMessage] = getValidationArray(props?.max);
  const [sourceValidation, getSourceValidationMessage] = getValidationArray(props?.sourceValidation);

  const baseResult = {
    label: props?.label,
    otype: "arr",
    type: "e",
    actionType,
  } as const satisfies Pick<Schema.ArrayValidationResult, "type" | "label" | "actionType" | "otype">;

  if (required) {
    const getMessage: Schema.CustomValidationMessageOrDefault<typeof getRequiredMessage> =
      getRequiredMessage ??
      (() => ({
        ...baseResult,
        code: "required",
      }));

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null) {
          return getMessage(p);
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null) {
          return getMessage(p);
        }
        return null;
      });
    }
  };

  if (length != null) {
    const getMessage: Schema.CustomValidationMessageOrDefault<typeof getLengthMessage> =
      getLengthMessage ??
      (({ length, currentLength }) => ({
        ...baseResult,
        code: "length",
        length,
        currentLength,
      }));

    if (typeof length === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const len = length(p);
        const cur = p.value.length;
        if (cur === len) return null;
        return getMessage({
          ...p,
          length: len,
          currentLength: cur,
        });
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        const cur = p.value.length;
        if (cur === length) return null;
        return getMessage({
          ...p,
          length,
          currentLength: cur,
        });
      });
    }
  } else {
    if (minLength != null) {
      const getMessage: Schema.CustomValidationMessageOrDefault<typeof getMinLengthMessage> =
        getMinLengthMessage ??
        (({ minLength, currentLength }) => ({
          ...baseResult,
          code: "minLength",
          minLength,
          currentLength,
        }));

      if (typeof minLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const minLen = minLength(p);
          const cur = p.value.length;
          if (minLen <= cur) return null;
          return getMessage({
            ...p,
            minLength: minLen,
            currentLength: cur,
          });
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (minLength <= cur) return null;
          return getMessage({
            ...p,
            minLength,
            currentLength: cur,
          });
        });
      }
    }

    if (maxLength != null) {
      const getMessage: Schema.CustomValidationMessageOrDefault<typeof getMaxLengthMessage> =
        getMaxLengthMessage ??
        (({ maxLength, currentLength }) => ({
          ...baseResult,
          code: "maxLength",
          maxLength,
          currentLength,
        }));

      if (typeof maxLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const maxLen = maxLength(p);
          const cur = p.value.length;
          if (cur >= maxLen) return null;
          return getMessage({
            ...p,
            maxLength: maxLen,
            currentLength: cur,
          });
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (cur >= maxLength) return null;
          return getMessage({
            ...p,
            maxLength,
            currentLength: cur,
          });
        });
      }
    }
  }

  if (sourceValidation !== false && props.source) {
    const source = props.source;
    const getMessage: Schema.CustomValidationMessageOrDefault<typeof getSourceValidationMessage> =
      getSourceValidationMessage ??
      (() => ({
        ...baseResult,
        code: "source",
      }));

    if (typeof source === "function") {
      validators.push((p) => {
        if (p.value == null || p.value.length === 0) return null;
        const src = source(p);
        if (!p.value.some(v => !src.some(item => item.value === v))) return null;
        return getMessage({ ...p, source: src });
      });
    } else {
      validators.push((p) => {
        if (p.value == null || p.value.length === 0) return null;
        if (!p.value.some(v => !source.some(item => item.value === v))) return null;
        return getMessage({ ...p, source });
      });
    }
  }

  if (props.validators) {
    (validators as typeof props.validators).push(...props.validators);
  }

  return {
    type: "arr",
    actionType,
    prop: props.prop as Props["prop"],
    key,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    source: props.source as Schema.GetSource<Props["source"]>,
    sourceValidation,
    parser: props.parser ?? ARRAY_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    length,
    minLength,
    maxLength,
  } as const satisfies Schema.$Array<Props["prop"]>;
};
