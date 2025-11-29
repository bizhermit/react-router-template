import { getValidationArray } from "./utilities";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ARRAY_PARSER({ value }: Schema.ParserParams): Schema.ParserResult<Array<any>> {
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
  const validators: Array<Schema.Validator<Array<any>, Schema.ArrayValidationResult>> = [];

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
    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null) {
          return {
            ...baseResult,
            code: "required",
          };
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null) {
          return {
            ...baseResult,
            code: "required",
          };
        }
        return null;
      });
    }
  };

  if (length != null) {
    if (typeof length === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const len = length(p);
        const cur = p.value.length;
        if (cur === len) return null;
        return {
          ...baseResult,
          code: "length",
          length: len,
          currentLength: cur,
        };
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        const cur = p.value.length;
        if (cur === length) return null;
        return {
          ...baseResult,
          code: "length",
          length,
          currentLength: cur,
        };
      });
    }
  } else {
    if (minLength != null) {
      if (typeof minLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const minLen = minLength(p);
          const cur = p.value.length;
          if (minLen <= cur) return null;
          return {
            ...baseResult,
            code: "minLength",
            minLength: minLen,
            currentLength: cur,
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (minLength <= cur) return null;
          return {
            ...baseResult,
            code: "minLength",
            minLength,
            currentLength: cur,
          };
        });
      }
    }

    if (maxLength != null) {
      if (typeof maxLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const maxLen = maxLength(p);
          const cur = p.value.length;
          if (cur >= maxLen) return null;
          return {
            ...baseResult,
            code: "maxLength",
            maxLength: maxLen,
            currentLength: cur,
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (cur >= maxLength) return null;
          return {
            ...baseResult,
            code: "maxLength",
            maxLength,
            currentLength: cur,
          };
        });
      }
    }
  }

  if (sourceValidation !== false && props.source) {
    const source = props.source;

    if (typeof source === "function") {
      validators.push((p) => {
        if (p.value == null || p.value.length === 0) return null;
        const src = source(p);
        if (!p.value.some(v => !src.some(item => item.value === v))) return null;
        return {
          ...baseResult,
          code: "source",
        };
      });
    } else {
      validators.push((p) => {
        if (p.value == null || p.value.length === 0) return null;
        if (!p.value.some(v => !source.some(item => item.value === v))) return null;
        return {
          ...baseResult,
          code: "source",
        };
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
