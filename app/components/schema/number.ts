import { parseNumber } from "../objects/numeric";
import { getInvalidValueTextKey, getRequiredTextKey, getValidationArray } from "./utilities";

function NUMBER_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<number> {
  const [num, succeeded] = parseNumber(value);
  if (succeeded) return { value: num };
  return {
    value: num,
    result: {
      type: "e",
      code: "parse",
      message: env.t("invalidNumeric", {
        label: label || env.t("default_label"),
      }),
    },
  };
};

export function $num<Props extends Schema.NumberProps>(props?: Props) {
  const validators: Array<Schema.Validator<number>> = [];

  const actionType = props?.actionType ?? (props?.source ? "select" : "input");
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [min, getMinMessage] = getValidationArray(props?.min);
  const [max, getMaxMessage] = getValidationArray(props?.max);
  const [float, getFloatMessage] = getValidationArray(props?.float);
  const [sourceValidation, getSourceValidationMessage] = getValidationArray(props?.sourceValidation);

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

  if (sourceValidation !== false && props?.source) {
    const source = props.source;
    const textKey = getInvalidValueTextKey(actionType);
    const getMessage: Schema.MessageGetter<typeof getSourceValidationMessage> =
      getSourceValidationMessage ?
        getSourceValidationMessage :
        (p) => p.env.t(textKey, {
          label: p.label || p.env.t("default_label"),
        });

    if (typeof source === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const src = source(p);
        if (src.some(item => item.value === p.value)) return null;
        return {
          type: "e",
          code: "source",
          message: getMessage({ ...p, source: src }),
        };
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        if (source.some(item => item.value === p.value)) return null;
        return {
          type: "e",
          code: "source",
          message: getMessage({ ...p, source }),
        };
      });
    }
  } else {
    if (min != null) {
      const textKey: I18nTextKey = `minNum_${actionType}`;
      const getMessage: Schema.MessageGetter<typeof getMinMessage> = getMinMessage ?
        getMinMessage :
        (p) => p.env.t(textKey, {
          label: p.label || p.env.t("default_label"),
          min: p.min,
        });

      if (typeof min === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const m = min(p);
          if (m <= p.value) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, min: m }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          if (min <= p.value) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, min }),
          };
        });
      }
    }

    if (max != null) {
      const textKey: I18nTextKey = `maxNum_${actionType}`;
      const getMessage: Schema.MessageGetter<typeof getMaxMessage> = getMaxMessage ?
        getMaxMessage :
        (p) => p.env.t(textKey, {
          label: p.label || p.env.t("default_label"),
          max: p.max,
        });

      if (typeof max === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const m = max(p);
          if (p.value >= m) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, max: m }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          if (p.value >= max) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, max }),
          };
        });
      }
    }

    if (float != null) {
      const getMessage: Schema.MessageGetter<typeof getFloatMessage> = getFloatMessage ?
        getFloatMessage :
        (p) => p.env.t("maxFloat", {
          label: p.label || p.env.t("default_label"),
          float: p.float,
        });

      if (typeof float === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const f = float(p);
          const [_, n] = String(p.value).split(".");
          const cur = n?.length ?? 0;
          if (cur <= f) return null;
          return {
            type: "e",
            code: "float",
            message: getMessage({ ...p, float: f, currentFloat: cur }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const [_, n] = String(p.value).split(".");
          const cur = n?.length ?? 0;
          if (cur <= float) return null;
          return {
            type: "e",
            code: "float",
            message: getMessage({ ...p, float, currentFloat: cur }),
          };
        });
      }
    }
  }

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "num",
    actionType,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? NUMBER_PARSER,
    source: props?.source as Schema.GetSource<Props["source"]>,
    sourceValidation: sourceValidation as Schema.GetValidationValue<Props, "sourceValidation">,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    min,
    max,
    float,
  } as const satisfies Schema.$Number;
};
