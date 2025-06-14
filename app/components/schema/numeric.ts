import { getValidationArray } from "./utilities";

export function $num<Props extends Schema.NumericProps>(props?: Props) {
  const validators: Array<Schema.Validator<number>> = [];

  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [min, getMinMessage] = getValidationArray(props?.min);
  const [max, getMaxMessage] = getValidationArray(props?.max);
  const [float, getFloatMessage] = getValidationArray(props?.float);

  if (required) {
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t("入力してください。");

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

  if (props?.source) {
    const source = props.source;
    const sourceValidationMessage = props.sourceValidationMessage;
    const getMessage: Schema.MessageGetter<typeof sourceValidationMessage> = sourceValidationMessage ?
      sourceValidationMessage :
      (p) => p.env.t("有効な値を設定してください。");

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
      const getMessage: Schema.MessageGetter<typeof getMinMessage> = getMinMessage ?
        getMinMessage :
        (p) => p.env.t(`${p.min}以上で入力してください。`);

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
      const getMessage: Schema.MessageGetter<typeof getMaxMessage> = getMaxMessage ?
        getMaxMessage :
        (p) => p.env.t(`${p.max}以下で入力してください。`);

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
        (p) => p.env.t(`少数第${p.float}以下で入力してください。`);

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
    source: props?.source as Schema.GetSource<Props["source"]>,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    min,
    max,
    float,
  } as const satisfies Schema.$Numeric;
};
