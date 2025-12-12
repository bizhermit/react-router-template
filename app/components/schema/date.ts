import { formatDate, parseDate } from "../objects/date";
import { parseNumber } from "../objects/numeric";
import { getValidationArray } from "./utilities";

function SPLIT_DATE_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<number, Schema.SplitDateValidationResult> {
  const [num, succeeded] = parseNumber(value);
  if (succeeded) return { value: num };
  return {
    value: num,
    result: {
      type: "e",
      otype: "sdate",
      label,
      code: "parse",
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
  const validators: Array<Schema.Validator<number, Schema.Result>> = [];

  const actionType = splitProps?.actionType ?? "select";
  const [required, getRequiredMessage] = getValidationArray(splitProps?.required);
  const [min, getMinMessage] = getValidationArray(splitProps?.min);
  const [max, getMaxMessage] = getValidationArray(splitProps?.max);

  const baseResult = {
    label: splitProps?.label,
    otype: `sdate-${target}`,
    type: "e",
    actionType,
  } as const satisfies Pick<Schema.SplitDateValidationResult, "type" | "label" | "actionType" | "otype">;

  if (required) {
    const getMessage: Schema.ResultGetter<typeof getRequiredMessage> =
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
  }

  if (min != null) {
    const getMessage: Schema.ResultGetter<typeof getMinMessage> =
      getMinMessage ??
      (({ min }) => ({
        ...baseResult,
        code: "min",
        min,
      }));

    if (typeof min === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const m = min(p);
        if (m <= p.value) return null;
        return getMessage({
          ...p,
          min: m,
        });
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        if (min <= p.value) return null;
        return getMessage({
          ...p,
          min,
        });
      });
    }
  }

  if (max != null) {
    const getMessage: Schema.ResultGetter<typeof getMaxMessage> =
      getMaxMessage ??
      (({ max }) => ({
        ...baseResult,
        code: "max",
        max,
      }));

    if (typeof max === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const m = max(p);
        if (p.value >= m) return null;
        return getMessage({
          ...p,
          max: m,
        });
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        if (p.value >= max) return null;
        return getMessage({
          ...p,
          max,
        });
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
  otype: "month" | "date" | "datetime",
  props: Props | undefined,
  validators: Array<Schema.Validator<Schema.DateValueString, Schema.Result>>,
  options: {
    pattern: string;
    beforePairValidation?: (params: {
      baseResult: Pick<Schema.DateValidationResult, "type" | "label" | "actionType" | "otype" | "formatPattern">;
    }) => void;
  },
) {
  const actionType = props?.actionType ?? "input";
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [minDate, getMinDateMessage] = getValidationArray(props?.minDate);
  const [maxDate, getMaxDateMessage] = getValidationArray(props?.maxDate);
  const [pair, getPairMessage] = getValidationArray(props?.pair);

  const baseResult = {
    label: props?.label,
    otype,
    type: "e",
    actionType,
    formatPattern: options.pattern,
  } as const satisfies Pick<Schema.DateValidationResult, "type" | "label" | "actionType" | "otype" | "formatPattern">;

  if (required) {
    const getMessage: Schema.ResultGetter<typeof getRequiredMessage> =
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
  }

  if (minDate) {
    const getMessage: Schema.ResultGetter<typeof getMinDateMessage> =
      getMinDateMessage ??
      (({ minDate }) => ({
        ...baseResult,
        code: "minDate",
        minDate,
      }));

    if (typeof minDate === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        const min = minDate(p);
        const m = parseDate(min);
        if (m == null) return null;
        if (m.getTime() <= date.getTime()) return null;
        return getMessage({
          ...p,
          minDate: m,
          date,
        });
      });
    } else {
      const min = parseDate(minDate);
      if (!min) throw new Error(`failed parse date: [${minDate}]`);
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        if (min.getTime() <= date.getTime()) return null;
        return getMessage({
          ...p,
          minDate: min,
          date,
        });
      });
    };
  }

  if (maxDate) {
    const getMessage: Schema.ResultGetter<typeof getMaxDateMessage> =
      getMaxDateMessage ??
      (({ maxDate }) => ({
        ...baseResult,
        code: "maxDate",
        maxDate,
      }));

    if (typeof maxDate === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        const max = maxDate(p);
        const m = parseDate(max);
        if (m == null) return null;
        if (date.getTime() <= m.getTime()) return null;
        return getMessage({
          ...p,
          maxDate: m,
          date,
        });
      });
    } else {
      const max = parseDate(maxDate);
      if (!max) throw new Error(`failed parse date: [${maxDate}]`);
      validators.push((p) => {
        if (p.value == null) return null;
        const date = parseDate(p.value);
        if (date == null) return null;
        if (date.getTime() <= max.getTime()) return null;
        return getMessage({
          ...p,
          maxDate: max,
          date,
        });
      });
    };
  }

  options.beforePairValidation?.({ baseResult });

  if (pair) {
    const getMessage: Schema.ResultGetter<typeof getPairMessage> =
      getPairMessage ??
      (({ pairDate, position }) => ({
        ...baseResult,
        code: "pair",
        pairDate,
        position,
      }));

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
          return getMessage({
            ...p,
            position: "before",
            pairDate,
            date,
          });
        } else {
          if (time < pairTime) return null;
          return getMessage({
            ...p,
            position: "after",
            pairDate,
            date,
          });
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
        const pairTime = pairDate.getTime();
        if (pair.same !== false && time === pairTime) return null;
        if (pair.position === "before") {
          if (pairTime < time) return null;
          return getMessage({
            ...p,
            position: "before",
            pairDate,
            date,
          });
        } else {
          if (time < pairTime) return null;
          return getMessage({
            ...p,
            position: "after",
            pairDate,
            date,
          });
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

function MONTH_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<Schema.MonthString, Schema.DateValidationResult> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        otype: "month",
        label,
        code: "parse",
        formatPattern: "yyyy/MM",
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM") as Schema.MonthString };
};

export function $month<Props extends Schema.MonthProps>(props?: Props) {
  const splits: Schema.$Month["splits"] = {};

  const validators: Array<Schema.Validator<Schema.MonthString>> = [];

  const commonProps = common(
    "month",
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString, Schema.DateValidationResult>>,
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
    source: props?.source,
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

function DATE_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<Schema.DateString, Schema.DateValidationResult> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        otype: "date",
        label,
        code: "parse",
        formatPattern: "yyyy/MM/dd",
      },
    };
  }
  return { value: formatDateString(date) };
};

export function formatDateString(date: string | number | Date | null | undefined) {
  return formatDate(date, "yyyy-MM-dd") as Schema.DateString | undefined;
};

export function formatMonthString(date: string | number | Date | null | undefined) {
  return formatDate(date, "yyyy-MM") as Schema.MonthString | undefined;
};

export function formatDatetimeString(date: string | number | Date | null | undefined) {
  return formatDate(date, "yyyy-MM-ddThh:mm:ss") as Schema.TimeString | undefined;
}

export function $date<Props extends Schema.DateProps>(props?: Props) {
  const splits: Schema.$Date["splits"] = {};

  const validators: Array<Schema.Validator<Schema.DateString>> = [];

  const commonProps = common(
    "date",
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString, Schema.DateValidationResult>>,
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
    source: props?.source,
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

function DATETIME_HM_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<Schema.DateTime_HM_String, Schema.DateValidationResult> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        otype: "datetime",
        label,
        code: "parse",
        formatPattern: "yyyy/M/d h:m:s",
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM-ddThh:mm") as Schema.DateTime_HM_String };
};

function DATETIME_HMS_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<Schema.DateTime_HMS_String, Schema.DateValidationResult> {
  if (value == null || value === "") {
    return { value: undefined };
  }
  const date = parseDate(value);
  if (date == null) {
    return {
      value: undefined,
      result: {
        type: "e",
        otype: "datetime",
        label,
        code: "parse",
        formatPattern: "yyyy/M/d h:m:s",
      },
    };
  }
  return { value: formatDate(date, "yyyy-MM-ddThh:mm:ss") as Schema.DateTime_HMS_String };
};

export function $datetime<Props extends Schema.DateTimeProps>(props?: Props) {
  const time = props?.time ?? "hm";

  const splits: Schema.$DateTime["splits"] = {};

  const validators: Array<Schema.Validator<Schema.DateTimeString, Schema.Result>> = [];

  const [minTime, getMinTimeMessage] = getValidationArray(props?.minTime);
  const [maxTime, getMaxTimeMessage] = getValidationArray(props?.maxTime);

  const commonProps = common(
    "datetime",
    props as Schema.BaseProps,
    validators as Array<Schema.Validator<Schema.DateValueString, Schema.DateValidationResult>>,
    {
      pattern: "yyyy/M/d h:m:s",
      beforePairValidation: function ({ baseResult }) {
        if (minTime) {
          const getMessage: Schema.ResultGetter<typeof getMinTimeMessage> =
            getMinTimeMessage ??
            (({ minTime }) => ({
              ...baseResult,
              code: "minTime",
              minTime,
            }));

          if (typeof minTime === "function") {
            validators.push((p) => {
              if (p.value == null) return null;
              const min = minTime(p);
              const m = timeToNumber(min);
              if (m == null) throw new Error(`failed to parse time number [${min}]`);

              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (m <= timeNum) return null;
              return getMessage({
                ...p,
                minTime: min,
              });
            });
          } else {
            const min = timeToNumber(minTime);
            if (min == null) throw new Error(`failed to parse time number [${minTime}]`);

            validators.push((p) => {
              if (p.value == null) return null;
              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (min <= timeNum) return null;
              return getMessage({
                ...p,
                minTime,
              });
            });
          }
        }

        if (maxTime) {
          const getMessage: Schema.ResultGetter<typeof getMaxTimeMessage> =
            getMaxTimeMessage ??
            (({ maxTime }) => ({
              ...baseResult,
              code: "maxTime",
              maxTime,
            }));

          if (typeof maxTime === "function") {
            validators.push((p) => {
              if (p.value == null) return null;
              const max = maxTime(p);
              const m = timeToNumber(max);
              if (m == null) throw new Error(`failed to parse time number [${max}]`);

              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (timeNum <= m) return null;
              return getMessage({
                ...p,
                maxTime: max,
              });
            });
          } else {
            const max = timeToNumber(maxTime);
            if (max == null) throw new Error(`failed to parse time number [${maxTime}]`);

            validators.push((p) => {
              if (p.value == null) return null;
              const timeNum = timeToNumber(p.value.split("T")[1] as Schema.TimeString);
              if (timeNum == null) throw new Error(`failed to parse time number [${p.value}]`);
              if (timeNum <= max) return null;
              return getMessage({
                ...p,
                maxTime,
              });
            });
          }
        }
      },
    }
  );

  if (props?.validators) {
    (validators as typeof props.validators).push(...props.validators);
  }

  let core: Schema.$DateTime;
  return core = {
    type: "datetime",
    actionType: commonProps.actionType,
    time: time as Exclude<Props, undefined>["time"] extends "hms" ? "hms" : "hm",
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    source: props?.source,
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
      if (time === "hm") throw new Error("split date seconds is not supported.");
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

export function parseTimeNums(
  value: Schema.TimeString | null | undefined,
  defaultNums = { h: 0, m: 0, s: 0 }
) {
  if (value == null) return defaultNums;
  const [h, m, s] = value.split(":");
  return {
    h: h == null ? defaultNums.h : Number(h),
    m: m == null ? defaultNums.m : Number(m),
    s: s == null ? defaultNums.s : Number(s),
  };
};
