import { formatDate, parseDate } from "../objects/date";
import { getValidationArray } from "./utilities";

function splitDate<Props extends Schema.SplitDateProps, T extends Schema.SplitDateTarget>(props: Props, type: Schema.$SplitDate<T>["type"]) {
  const validators: Array<Schema.Validator<number>> = [];

  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [min, getMinMessage] = getValidationArray(props?.min);
  const [max, getMaxMessage] = getValidationArray(props.max);

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
  }

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

  if (props.validators) {
    validators.push(...props.validators);
  }

  return {
    type,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    min,
    max,
  } as const satisfies Schema.$SplitDate<T>;
};

export function $month<Props extends Schema.MonthProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.MonthString>> = [];

  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [minDate, getMinDateMessage] = getValidationArray(props?.minDate);
  const [maxDate, getMaxDateMessage] = getValidationArray(props?.maxDate);
  const [pair, getPairMessage] = getValidationArray(props?.pair);

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
  }

  if (minDate) {
    const getMessage: Schema.MessageGetter<typeof getMinDateMessage> = getMinDateMessage ?
      getMinDateMessage :
      (p) => p.env.t(`${formatDate(p.minDate, "yyyy/M")}以降で入力してください。`);

    if (typeof minDate === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        const min = minDate(p);
        const m = parseDate(min);
        if (m == null) {
          return {
            type: "w",
            code: "minDate",
            message: `failed parse date: [${min}]`,
          };
        }
        if (m.getTime() <= date.getTime()) return null;
        return {
          type: "e",
          code: "minDate",
          message: getMessage({ ...p, minDate: m, date }),
        };
      });
    } else {
      const min = parseDate(minDate);
      if (!min) throw new Error(`failed parse date: [${minDate}]`);
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        if (min.getTime() <= date.getTime()) return null;
        return {
          type: "e",
          code: "minDate",
          message: getMessage({ ...p, minDate: min, date }),
        };
      });
    };
  }

  if (maxDate) {
    const getMessage: Schema.MessageGetter<typeof getMaxDateMessage> = getMaxDateMessage ?
      getMaxDateMessage :
      (p) => p.env.t(`${formatDate(p.maxDate, "yyyy/M")}以前で入力してください。`);

    if (typeof maxDate === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        const max = maxDate(p);
        const m = parseDate(max);
        if (m == null) {
          return {
            type: "w",
            code: "maxDate",
            message: `failed parse date: [${max}]`,
          };
        }
        if (date.getTime() <= m.getTime()) return null;
        return {
          type: "e",
          code: "maxDate",
          message: getMessage({ ...p, maxDate: m, date }),
        };
      });
    } else {
      const max = parseDate(maxDate);
      if (!max) throw new Error(`failed parse date: [${maxDate}]`);
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        if (date.getTime() <= max.getTime()) return null;
        return {
          type: "e",
          code: "maxDate",
          message: getMessage({ ...p, maxDate: max, date }),
        };
      });
    };
  }

  if (pair) {
    const getMessage: Schema.MessageGetter<typeof getPairMessage> = getPairMessage ?
      getPairMessage :
      (p) => p.env.t("年月の前後関係が不正です。");

    if (typeof pair === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;

        const pa = pair(p);
        const pairValue = p.data.get(pa.name);
        if (pairValue == null || pairValue === "") return null;
        const pairDate = parseDate(pairValue);
        if (pairDate == null) return null;

        const time = date.getTime();
        const pairTime = date.getTime();
        if (pa.same !== false && time === pairTime) return null;
        if (pa.position === "before") {
          if (pairTime < time) return null;
          return {
            type: "e",
            code: "pairBefore",
            message: getMessage({ ...p, pairDate, date }),
          };
        } else {
          if (time < pairTime) return null;
          return {
            type: "e",
            code: "pairAfter",
            message: getMessage({ ...p, pairDate, date }),
          };
        }
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;

        const pairValue = p.data.get(pair.name);
        if (pairValue == null || pairValue === "") return null;
        const pairDate = parseDate(pairValue);
        if (pairDate == null) return null;

        const time = date.getTime();
        const pairTime = date.getTime();
        if (pair.same !== false && time === pairTime) return null;
        if (pair.position === "before") {
          if (pairTime < time) return null;
          return {
            type: "e",
            code: "pairBefore",
            message: getMessage({ ...p, pairDate, date }),
          };
        } else {
          if (time < pairTime) return null;
          return {
            type: "e",
            code: "pairAfter",
            message: getMessage({ ...p, pairDate, date }),
          };
        }
      });
    }
  }

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "month",
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    minDate,
    maxDate,
    pair,
    splitYear: function (props) {
      return splitDate(props, "sdate-Y");
    },
    splitMonth: function (props) {
      return splitDate(props, "sdate-M");
    },
  } as const satisfies Schema.$Month;
};
