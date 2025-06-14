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

function common<Props extends Schema.DateBaseProps>(
  props: Props | undefined,
  validators: Array<Schema.Validator<Schema.DateValueString>>,
  options: {
    pattern: string;
    beforePairValidation?: () => void;
  },
) {
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
      (p) => p.env.t(`${formatDate(p.minDate, options.pattern)}以降で入力してください。`);

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
      (p) => p.env.t(`${formatDate(p.maxDate, options.pattern)}以前で入力してください。`);

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

  options.beforePairValidation?.();

  if (pair) {
    const getMessage: Schema.MessageGetter<typeof getPairMessage> = getPairMessage ?
      getPairMessage :
      (p) => p.env.t("前後関係が不正です。");

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

  return {
    validators,
    required,
    minDate,
    maxDate,
    pair,
  } as const;
};

export function $month<Props extends Schema.MonthProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.MonthString>> = [];

  const commonProps = common(
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString>>,
    {
      pattern: "yyyy/M",
    }
  );

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "month",
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    pair: commonProps.pair,
    splitYear: function (props) {
      return splitDate(props, "sdate-Y");
    },
    splitMonth: function (props) {
      return splitDate(props, "sdate-M");
    },
  } as const satisfies Schema.$Month;
};


export function $date<Props extends Schema.DateProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.DateString>> = [];

  const commonProps = common(
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString>>,
    {
      pattern: "yyyy/M/d",
    }
  );

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "date",
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    pair: commonProps.pair,
    splitYear: function (props) {
      return splitDate(props, "sdate-Y");
    },
    splitMonth: function (props) {
      return splitDate(props, "sdate-M");
    },
    splitDay: function (props) {
      return splitDate(props, "sdate-D");
    },
  } as const satisfies Schema.$Date;
};

function timeToNumber(time: Schema.TimeString | undefined) {
  if (time == null) return undefined;
  const [h, m, s] = time.split(":");
  let num = 0;
  if (h != null) num += Number(h) * 3600;
  if (m != null) num += Number(m) * 60;
  if (s != null) num += Number(s);
  return num;
};

export function $datetime<Props extends Schema.DateTimeProps>(props?: Props) {
  const time = props?.time ?? "hm";

  const validators: Array<Schema.Validator<Schema.DateTimeString>> = [];

  const [minTime, getMinTimeMessage] = getValidationArray(props?.minTime);
  const [maxTime, getMaxTimeMessage] = getValidationArray(props?.maxTime);

  const commonProps = common(
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString>>,
    {
      pattern: "yyyy/M/d h:m:s",
      beforePairValidation: function () {
        if (minTime) {
          const getMessage: Schema.MessageGetter<typeof getMinTimeMessage> = getMinTimeMessage ?
            getMinTimeMessage :
            (p) => p.env.t(`${p.minTime}以降で入力してください。`);

          if (typeof minTime === "function") {
            validators.push((p) => {
              if (p.value == null) return null;
              const min = minTime(p);
              const m = timeToNumber(min);
              if (m == null) throw new Error(`failed to parse time number [${min}]`);

              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (m <= timeNum) return null;
              return {
                type: "e",
                code: "minTime",
                message: getMessage({ ...p, minTime: min, date: parseDate(p.value)! }),
              };
            });
          } else {
            const min = timeToNumber(minTime);
            if (min == null) throw new Error(`failed to parse time number [${minTime}]`);

            validators.push((p) => {
              if (p.value == null) return null;
              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (min <= timeNum) return null;
              return {
                type: "e",
                code: "minTime",
                message: getMessage({ ...p, minTime, date: parseDate(p.value)! }),
              };
            });
          }
        }

        if (maxTime) {
          const getMessage: Schema.MessageGetter<typeof getMaxTimeMessage> = getMaxTimeMessage ?
            getMaxTimeMessage :
            (p) => p.env.t(`${p.maxTime}以前で入力してください。`);

          if (typeof maxTime === "function") {
            validators.push((p) => {
              if (p.value == null) return null;
              const max = maxTime(p);
              const m = timeToNumber(max);
              if (m == null) throw new Error(`failed to parse time number [${max}]`);

              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (timeNum <= m) return null;
              return {
                type: "e",
                code: "minTime",
                message: getMessage({ ...p, maxTime: max, date: parseDate(p.value)! }),
              };
            });
          } else {
            const max = timeToNumber(maxTime);
            if (max == null) throw new Error(`failed to parse time number [${maxTime}]`);

            validators.push((p) => {
              if (p.value == null) return null;
              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (timeNum <= max) return null;
              return {
                type: "e",
                code: "minTime",
                message: getMessage({ ...p, maxTime, date: parseDate(p.value)! }),
              };
            });
          }
        }
      },
    }
  );

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "datetime",
    time: time as Exclude<Props, undefined>["time"] extends "hms" ? "hms" : "hm",
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    minTime,
    maxTime,
    pair: commonProps.pair,
    splitYear: function (props) {
      return splitDate(props, "sdate-Y");
    },
    splitMonth: function (props) {
      return splitDate(props, "sdate-M");
    },
    splitDay: function (props) {
      return splitDate(props, "sdate-D");
    },
    splitHour: function (props) {
      return splitDate(props, "sdate-h");
    },
    splitMinute: function (props) {
      return splitDate(props, "sdate-m");
    },
    splitSecond: function (props) {
      if (time === "hm") throw new Error("split date seconds is not supported.")
      return splitDate(props, "sdate-s");
    },
  } as const satisfies Schema.$DateTime;
};