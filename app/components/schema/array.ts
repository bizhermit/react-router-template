import { getRequiredTextKey, getValidationArray } from "./utilities";

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

  const validators: Array<Schema.Validator<any[]>> = [];

  const actionType = props?.actionType ?? "set";
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [length, getLengthMessage] = getValidationArray(props?.len);
  const [minLength, getMinLengthMessage] = getValidationArray(props?.min);
  const [maxLength, getMaxLengthMessage] = getValidationArray(props?.max);

  if (required) {
    const textKey = getRequiredTextKey(actionType);
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
      });

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null) {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null) {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    }
  };

  if (length != null) {
    const textKey: I18nTextKey = `matchArrLength_${actionType}`;
    const getMessage: Schema.MessageGetter<typeof getLengthMessage> = getLengthMessage ?
      getLengthMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
        length: p.length,
      });

    if (typeof length === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const len = length(p);
        const cur = p.value.length;
        if (cur === len) return null;
        return {
          type: "e",
          code: "length",
          message: getMessage({ ...p, length: len, currentLength: cur }),
        };
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        const cur = p.value.length;
        if (cur === length) return null;
        return {
          type: "e",
          code: "length",
          message: getMessage({ ...p, length: length, currentLength: cur }),
        };
      });
    }
  } else {
    if (minLength != null) {
      const textKey: I18nTextKey = `minArrLength_${actionType}`;
      const getMessage: Schema.MessageGetter<typeof getMinLengthMessage> = getMinLengthMessage ?
        getMinLengthMessage :
        (p) => p.env.t(textKey, {
          label: p.label || p.env.t("default_label"),
          minLength: p.minLength,
        });

      if (typeof minLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const minLen = minLength(p);
          const cur = p.value.length;
          if (minLen <= cur) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, minLength: minLen, currentLength: cur }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (minLength <= cur) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, minLength, currentLength: cur }),
          };
        });
      }
    }

    if (maxLength != null) {
      const textKey: I18nTextKey = `maxArrLength_${actionType}`;
      const getMessage: Schema.MessageGetter<typeof getMaxLengthMessage> = getMaxLengthMessage ?
        getMaxLengthMessage :
        (p) => p.env.t(textKey, {
          label: p.label || p.env.t("default_label"),
          maxLength: p.maxLength,
        });

      if (typeof maxLength === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const maxLen = maxLength(p);
          const cur = p.value.length;
          if (cur >= maxLen) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, maxLength: maxLen, currentLength: cur }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const cur = p.value.length;
          if (cur >= maxLength) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, maxLength, currentLength: cur }),
          };
        });
      }
    }
  }

  if (props.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "arr",
    actionType,
    prop: props.prop as Props["prop"],
    key,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props.parser ?? ARRAY_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    length,
    minLength,
    maxLength,
  } as const satisfies Schema.$Array<Props["prop"]>;
};
