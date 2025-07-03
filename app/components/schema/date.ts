import { formatDate, parseDate } from "../objects/date";
import { parseNumber } from "../objects/numeric";
import { getRequiredTextKey, getValidationArray } from "./utilities";

function SPLIT_DATE_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<number> {
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

function splitDate<Props extends Schema.SplitDateProps, T extends Schema.SplitDateTarget>({
  splitProps,
  target,
  core,
}: {
  splitProps: Props | undefined;
  target: T;
  core: Schema.$Date | Schema.$Month | Schema.$DateTime;
}) {
  const validators: Array<Schema.Validator<number>> = [];

  const actionType = splitProps?.actionType ?? "select";
  const [required, getRequiredMessage] = getValidationArray(splitProps?.required);
  const [min, getMinMessage] = getValidationArray(splitProps?.min);
  const [max, getMaxMessage] = getValidationArray(splitProps?.max);

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
  }

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

  if (splitProps?.validators) {
    validators.push(...splitProps.validators);
  }

  return core.splits[target as keyof typeof core.splits] = {
    type: `sdate-${target}`,
    actionType,
    core,
    label: splitProps?.label,
    mode: splitProps?.mode,
    refs: splitProps?.refs,
    parser: splitProps?.parser ?? SPLIT_DATE_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    min,
    max,
    step: splitProps?.step ?? 1,
    _core: null!,
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
  const actionType = props?.actionType ?? "input";
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [minDate, getMinDateMessage] = getValidationArray(props?.minDate);
  const [maxDate, getMaxDateMessage] = getValidationArray(props?.maxDate);
  const [pair, getPairMessage] = getValidationArray(props?.pair);

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
  }

  if (minDate) {
    const textKey: I18nTextKey = `minDate_${actionType}`;
    const getMessage: Schema.MessageGetter<typeof getMinDateMessage> = getMinDateMessage ?
      getMinDateMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
        minDate: formatDate(p.minDate, options.pattern),
      });

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
    const textKey = `maxDate_${actionType}` satisfies I18nTextKey;
    const getMessage: Schema.MessageGetter<typeof getMaxDateMessage> = getMaxDateMessage ?
      getMaxDateMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
        maxDate: formatDate(p.maxDate, options.pattern),
      });

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
      (p) => p.env.t("contextDate", {
        label: p.label || p.env.t("default_label"),
      });

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
    actionType,
  } as const;
};

function MONTH_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<Schema.MonthString> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        code: "parse",
        message: env.t("invalidMonth", {
          label: label || env.t("default_label"),
        }),
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM") as Schema.MonthString };
};

export function $month<Props extends Schema.MonthProps>(props?: Props) {
  const splits: Schema.$Month["splits"] = {};

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

  let core: Schema.$Month;
  return core = {
    type: "month",
    actionType: commonProps.actionType,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? MONTH_PARSER,
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    pair: commonProps.pair,
    splits,
    _splits: {},
    formatPattern: "yyyy-MM",
    splitYear: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "Y",
        core,
      });
    },
    splitMonth: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "M",
        core,
      });
    },
  } as const satisfies Schema.$Month;
};

function DATE_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<Schema.DateString> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        code: "parse",
        message: env.t("invalidDate", {
          label: label || env.t("default_label"),
        }),
      },
    };
  }
  return { value: formatDate(date) as Schema.DateString };
};

export function $date<Props extends Schema.DateProps>(props?: Props) {
  const splits: Schema.$Date["splits"] = {};

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

  let core: Schema.$Date;
  return core = {
    type: "date",
    actionType: commonProps.actionType,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? DATE_PARSER,
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    pair: commonProps.pair,
    splits,
    _splits: {},
    formatPattern: "yyyy-MM-dd",
    splitYear: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "Y",
        core,
      });
    },
    splitMonth: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "M",
        core,
      });
    },
    splitDay: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "D",
        core,
      });
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

function DATETIME_HM_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<Schema.DateTime_HM_String> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        code: "parse",
        message: env.t("invalidDatetime", {
          label: label || env.t("default_label"),
        }),
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM-ddThh:mm") as Schema.DateTime_HM_String };
};

function DATETIME_HMS_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<Schema.DateTime_HMS_String> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        code: "parse",
        message: env.t("invalidDatetime", {
          label: label || env.t("default_label"),
        }),
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM-ddThh:mm:ss") as Schema.DateTime_HMS_String };
};

export function $datetime<Props extends Schema.DateTimeProps>(props?: Props) {
  const time = props?.time ?? "hm";

  const splits: Schema.$DateTime["splits"] = {};

  const validators: Array<Schema.Validator<Schema.DateTimeString>> = [];

  const actionType = props?.actionType  ?? "input";
  const [minTime, getMinTimeMessage] = getValidationArray(props?.minTime);
  const [maxTime, getMaxTimeMessage] = getValidationArray(props?.maxTime);

  const commonProps = common(
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString>>,
    {
      pattern: "yyyy/M/d h:m:s",
      beforePairValidation: function () {
        if (minTime) {
          const textKey: I18nTextKey = `minTime_${actionType}`;
          const getMessage: Schema.MessageGetter<typeof getMinTimeMessage> = getMinTimeMessage ?
            getMinTimeMessage :
            (p) => p.env.t(textKey, {
              label: p.label || p.env.t("default_label"),
              minTime: p.minTime,
            });

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
          const textKey: I18nTextKey = `maxTime_${actionType}`;
          const getMessage: Schema.MessageGetter<typeof getMaxTimeMessage> = getMaxTimeMessage ?
            getMaxTimeMessage :
            (p) => p.env.t(textKey, {
              label: p.label || p.env.t("default_label"),
              maxTime: p.maxTime,
            });

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

  let core: Schema.$DateTime;
  return core = {
    type: "datetime",
    actionType: commonProps.actionType,
    time: time as Exclude<Props, undefined>["time"] extends "hms" ? "hms" : "hm",
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? (time === "hms" ? DATETIME_HMS_PARSER : DATETIME_HM_PARSER),
    validators,
    required: commonProps.required as Schema.GetValidationValue<Props, "required">,
    minDate: commonProps.minDate as Schema.GetValidationValue<Props, "minDate">,
    maxDate: commonProps.maxDate as Schema.GetValidationValue<Props, "maxDate">,
    minTime,
    maxTime,
    pair: commonProps.pair,
    splits,
    _splits: {},
    formatPattern: `yyyy-MM-ddThh:mm${time === "hms" ? `:ss` : ""}`,
    splitYear: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "Y",
        core,
      });
    },
    splitMonth: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "M",
        core,
      });
    },
    splitDay: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "D",
        core,
      });
    },
    splitHour: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "h",
        core,
      });
    },
    splitMinute: function (splitProps?) {
      return splitDate({
        splitProps,
        target: "m",
        core,
      });
    },
    splitSecond: function (splitProps?) {
      if (time === "hm") throw new Error("split date seconds is not supported.")
      return splitDate({
        splitProps,
        target: "s",
        core,
      });
    },
  } as const satisfies Schema.$DateTime;
};

export function parseTypedDate(
  date: string | Date | null | undefined,
  type: "date" | "month" | "datetime",
  time?: "hms" | "hm",
) {
  return parseDate(parseTypedDateString(date, type, time));
};

export function parseTypedDateString(
  date: string | Date | null | undefined,
  type: "date" | "month" | "datetime",
  time?: "hms" | "hm",
) {
  return formatDate(date, type === "month" ? "yyyy-MM" : type === "date" ? "yyyy-MM-dd" : time === "hm" ? "yyyy-MM-ddThh:mm" : "yyyy-MM-ddThh:mm:ss");
};

export function parseTimeNums(value: Schema.TimeString | null | undefined, defaultNums = { h: 0, m: 0, s: 0 }) {
  if (value == null) return defaultNums;
  const [h, m, s] = value.split(":");
  return {
    h: h == null ? defaultNums.h : Number(h),
    m: m == null ? defaultNums.m : Number(m),
    s: s == null ? defaultNums.s : Number(s),
  };
};