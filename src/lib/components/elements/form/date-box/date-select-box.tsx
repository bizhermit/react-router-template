import { use, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject, type SelectHTMLAttributes } from "react";
import { FormContext } from "../../../../shared/hooks/form/context";
import { type FormItemHookProps } from "../../../../shared/hooks/form/item";
import { I18nContext } from "../../../../shared/hooks/i18n";
import { parseNumber } from "../../../../shared/objects/numeric";
import { $Date, $DateTime, $Month } from "../../../../shared/objects/timestamp";
import { FieldSetContext } from "../../../../shared/providers/field-set";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
import type { SchemaItem } from "../../../../shared/schema/core";
import { $DateSchema } from "../../../../shared/schema/date";
import { $DateTimeSchema } from "../../../../shared/schema/datetime";
import { FormItem } from "../../../../shared/schema/form";
import { getResultMessage } from "../../../../shared/schema/message";
import { $MonthSchema } from "../../../../shared/schema/month";
import type { $SplitDateSchema } from "../../../../shared/schema/split-date";
import { WithMessage } from "../message";
import { SelectBox, SelectBoxEmptyOption, type SelectBoxRef } from "../select-box";
import { InputGroupWrapper } from "../wrapper/input-group";

export interface DateSelectBox$Ref extends InputRef { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DateSelectBoxSchemaItem = $DateSchema<any> | $DateTimeSchema<any> | $MonthSchema<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatePartFormItem = FormItem<$SplitDateSchema<DateSelectBoxSchemaItem, any>>;

export type DateSelectBox$Props<S extends DateSelectBoxSchemaItem> =
  & ElementStyleProps
  & FormItemHookProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem:
    | FormItem<S>
    | ({
      year: DatePartFormItem;
      month: DatePartFormItem;
      day?: DatePartFormItem;
      hour?: DatePartFormItem;
      minute?: DatePartFormItem;
      second?: DatePartFormItem;
    } & (
        | {
          core: FormItem<S>;
          id?: never;
        }
        | {
          core?: never;
          id: string;
        }
      ));
    placeholder?:
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string];
  }
  & Pick<SelectHTMLAttributes<HTMLSelectElement>,
    | "autoFocus"
  >;

/**
 * 区切り要素
 * @param props
 * @returns
 */
function SepSpan(props: { children: ReactNode; }) {
  return <span className="_ipt-sep">{props.children}</span>;
};

type DisplayMessagePartParams = {
  name: string | undefined;
  schemaItem: SchemaItem | undefined;
  message: Schema.Message | null | undefined;
};

/**
 * 表示リザルトオブジェクト判定
 */
function selectBoxDisplayMessage(params: Record<DateSeparateKeys | "core", DisplayMessagePartParams>): Schema.Message | null | undefined {
  const targets: Array<[DateSeparateKeys, DisplayMessagePartParams]> = [];
  if (params.year.message?.code === "required") targets.push(["year", params.year]);
  if (params.month.message?.code === "required") targets.push(["month", params.month]);
  if (params.day.message?.code === "required") targets.push(["day", params.day]);
  if (params.hour.message?.code === "required") targets.push(["hour", params.hour]);
  if (params.minute.message?.code === "required") targets.push(["minute", params.minute]);
  if (params.second.message?.code === "required") targets.push(["second", params.second]);
  if (targets.length > 0) {
    const targetKey = targets[0][0];
    const targetSchemaItem = targets[0][1];
    return {
      type: "e",
      name: targetSchemaItem.name,
      label: targetSchemaItem.schemaItem?.getLabel(),
      actionType: targetSchemaItem.schemaItem?.getActionType(),
      otype: `split-${targetKey}`,
      code: "split-required",
      targets: targets.map(t => t[0]),
    } satisfies Schema.ValidationMessage;
  }
  return params.year.message ??
    params.month.message ??
    params.day.message ??
    params.hour.message ??
    params.minute.message ??
    params.second.message ??
    params.core.message;
};

type DateSeparateKeys =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second";

export function DateSelectBox$<S extends DateSelectBoxSchemaItem>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  placeholder,
  autoFocus,
}: DateSelectBox$Props<S>) {
  const t = use(I18nContext).t;
  const fs = use(FieldSetContext);
  const validScripts = use(ValidScriptsContext).valid;

  const wref = useRef<HTMLDivElement>(null!);
  const ref$ = useRef<SelectBoxRef>(null!);

  const {
    id: schemaId,
    manager,
    state: formState,
  } = use(FormContext);
  const {
    core,
    id: coreId,
    year,
    month,
    day,
    hour,
    minute,
    second,
  } = formItem instanceof FormItem ? {
    core: formItem,
  } : formItem;
  const injectParams = useSyncExternalStore((callback) => {
    const cleanup = manager.addInjectParamsSubscribe(() => callback);
    return () => cleanup();
  }, () => {
    return manager.getInjectParams();
  }, () => {
    return manager.getInjectParams();
  });

  const yearSchemaItem = year?.getSchemaItem();
  const monthSchemaItem = month?.getSchemaItem();
  const daySchemaItem = day?.getSchemaItem();
  const hourSchemaItem = hour?.getSchemaItem();
  const minuteSchemaItem = minute?.getSchemaItem();
  const secondSchemaItem = second?.getSchemaItem();
  const schemaItem = (core?.getSchemaItem() ?? yearSchemaItem?.getBase())!; // NOTE: どちらか片方は必須

  const label = t(core?.getLabel() as I18nTextKey);
  const coreName = core?.getName();
  const yearName = year?.getName();
  const monthName = month?.getName();
  const dayName = day?.getName();
  const hourName = hour?.getName();
  const minuteName = minute?.getName();
  const secondName = second?.getName();
  const id = `${schemaId}_${coreName || `${coreId}_${yearName}`}`;

  const dummySubscribes = useRef<Record<DateSeparateKeys | "core" | "coreMessage", (() => void) | undefined>>({
    core: undefined,
    coreMessage: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    hour: undefined,
    minute: undefined,
    second: undefined,
  });

  const dummyDateRef = useRef<$DateTime | $Date | $Month | null | undefined>(undefined);

  function getCoreRefValuesString() {
    if (!coreName) return "";
    return core?.getRefsValuesString();
  };

  const coreRefsValuesString = useSyncExternalStore((callback) => {
    if (!coreName) return () => { };
    const cleanups = core?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getCoreRefValuesString, getCoreRefValuesString);

  function getCoreValue() {
    if (!coreName) return dummyDateRef.current;
    return manager.getValue<Schema.Nullable<$DateTime | $Date | $Month>>(coreName);
  };

  const coreValue = useSyncExternalStore((callback) => {
    if (!coreName) {
      dummySubscribes.current.core = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(coreName, () => {
      callback();
    });
    return () => cleanup();
  }, getCoreValue, getCoreValue);

  function getCoreMessage() {
    if (!coreName) return undefined;
    return manager.getMessage(coreName);
  };

  const coreMessage = useSyncExternalStore<Schema.Message | null | undefined>((callback) => {
    if (!coreName) {
      dummySubscribes.current.coreMessage = callback;
      return () => { };
    }
    const cleanup = manager.addMessageSubscribe(coreName, () => {
      callback();
    });
    return () => cleanup();
  }, getCoreMessage, getCoreMessage);

  const [initValue] = useState<Record<DateSeparateKeys, number | undefined>>(() => {
    if (coreName) {
      if (coreValue != null) {
        const d = new $DateTime(coreValue);
        return {
          year: d.getYear(),
          month: d.getMonth(),
          day: d.getDay(),
          hour: d.getHour(),
          minute: d.getMinute(),
          second: d.getSecond(),
        };
      }
    }
    return {
      year: undefined,
      month: undefined,
      day: undefined,
      hour: undefined,
      minute: undefined,
      second: undefined,
    };
  });

  const nums = useRef<Record<DateSeparateKeys, Schema.Nullable<number>>>(initValue);

  function getYearRefValuesString() {
    if (!yearName) return "";
    return year?.getRefsValuesString();
  };

  const yearRefsValuesString = useSyncExternalStore((callback) => {
    if (!yearName) return () => { };
    const cleanups = year?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getYearRefValuesString, getYearRefValuesString);

  function getYearNum() {
    if (!yearName) return nums.current.year;
    return manager.getValue<Schema.Nullable<number>>(yearName);
  };

  const yearNum = useSyncExternalStore((callback) => {
    if (!yearName) {
      dummySubscribes.current.year = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(yearName, () => {
      callback();
    });
    return () => cleanup();
  }, getYearNum, getYearNum);

  function getYearMessage() {
    if (!yearName) return undefined;
    return manager.getMessage(yearName);
  };

  const yearMessage = useSyncExternalStore((callback) => {
    if (!yearName) return () => { };
    const cleanup = manager.addMessageSubscribe(yearName, () => {
      callback();
    });
    return () => cleanup();
  }, getYearMessage, getYearMessage);

  function getMonthNum() {
    if (!monthName) return nums.current.month;
    return manager.getValue<Schema.Nullable<number>>(monthName);
  };

  function getMonthRefValuesString() {
    if (!monthName) return "";
    return month?.getRefsValuesString();
  };

  const monthRefsValuesString = useSyncExternalStore((callback) => {
    if (!monthName) return () => { };
    const cleanups = month?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getMonthRefValuesString, getMonthRefValuesString);

  const monthNum = useSyncExternalStore((callback) => {
    if (!monthName) {
      dummySubscribes.current.month = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(monthName, () => {
      callback();
    });
    return () => cleanup();
  }, getMonthNum, getMonthNum);

  function getMonthMessage() {
    if (!monthName) return undefined;
    return manager.getMessage(monthName);
  };

  const monthMessage = useSyncExternalStore((callback) => {
    if (!monthName) return () => { };
    const cleanup = manager.addMessageSubscribe(monthName, () => {
      callback();
    });
    return () => cleanup();
  }, getMonthMessage, getMonthMessage);

  function getDayRefValuesString() {
    if (!dayName) return "";
    return day?.getRefsValuesString();
  };

  const dayRefsValuesString = useSyncExternalStore((callback) => {
    if (!dayName) return () => { };
    const cleanups = day?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getDayRefValuesString, getDayRefValuesString);

  function getDayNum() {
    if (!dayName) return nums.current.day;
    return manager.getValue<Schema.Nullable<number>>(dayName);
  };

  const dayNum = useSyncExternalStore((callback) => {
    if (!dayName) {
      dummySubscribes.current.day = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(dayName, () => {
      callback();
    });
    return () => cleanup();
  }, getDayNum, getDayNum);

  function getDayMessage() {
    if (!dayName) return undefined;
    return manager.getMessage(dayName);
  };

  const dayMessage = useSyncExternalStore((callback) => {
    if (!dayName) return () => { };
    const cleanup = manager.addMessageSubscribe(dayName, () => {
      callback();
    });
    return () => cleanup();
  }, getDayMessage, getDayMessage);

  function getHourRefValuesString() {
    if (!hourName) return "";
    return hour?.getRefsValuesString();
  };

  const hourRefsValuesString = useSyncExternalStore((callback) => {
    if (!hourName) return () => { };
    const cleanups = hour?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getHourRefValuesString, getHourRefValuesString);

  function getHourNum() {
    if (!hourName) return nums.current.hour;
    return manager.getValue<Schema.Nullable<number>>(hourName);
  };

  const hourNum = useSyncExternalStore((callback) => {
    if (!hourName) {
      dummySubscribes.current.hour = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(hourName, () => {
      callback();
    });
    return () => cleanup();
  }, getHourNum, getHourNum);

  function getHourMessage() {
    if (!hourName) return undefined;
    return manager.getMessage(hourName);
  };

  const hourMessage = useSyncExternalStore((callback) => {
    if (!hourName) return () => { };
    const cleanup = manager.addMessageSubscribe(hourName, () => {
      callback();
    });
    return () => cleanup();
  }, getHourMessage, getHourMessage);

  function getMinuteRefValuesString() {
    if (!minuteName) return "";
    return minute?.getRefsValuesString();
  };

  const minuteRefsValuesString = useSyncExternalStore((callback) => {
    if (!minuteName) return () => { };
    const cleanups = minute?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getMinuteRefValuesString, getMinuteRefValuesString);

  function getMinuteNum() {
    if (!minuteName) return nums.current.minute;
    return manager.getValue<Schema.Nullable<number>>(minuteName);
  };

  const minuteNum = useSyncExternalStore((callback) => {
    if (!minuteName) {
      dummySubscribes.current.minute = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(minuteName, () => {
      callback();
    });
    return () => cleanup();
  }, getMinuteNum, getMinuteNum);

  function getMinuteMessage() {
    if (!minuteName) return undefined;
    return manager.getMessage(minuteName);
  };

  const minuteMessage = useSyncExternalStore((callback) => {
    if (!minuteName) return () => { };
    const cleanup = manager.addMessageSubscribe(minuteName, () => {
      callback();
    });
    return () => cleanup();
  }, getMinuteMessage, getMinuteMessage);

  function getSecondRefValuesString() {
    if (!secondName) return "";
    return second?.getRefsValuesString();
  };

  const secondRefsValuesString = useSyncExternalStore((callback) => {
    if (!secondName) return () => { };
    const cleanups = second?.getRefs().map(ref => {
      return manager.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups?.forEach(cleanup => cleanup());
    };
  }, getSecondRefValuesString, getSecondRefValuesString);

  function getSecondNum() {
    if (!secondName) return nums.current.second;
    return manager.getValue<Schema.Nullable<number>>(secondName);
  };

  const secondNum = useSyncExternalStore((callback) => {
    if (!secondName) {
      dummySubscribes.current.second = callback;
      return () => { };
    }
    const cleanup = manager.addValuesSubscribe(secondName, () => {
      callback();
    });
    return () => cleanup();
  }, getSecondNum, getSecondNum);

  function getSecondMessage() {
    if (!secondName) return undefined;
    return manager.getMessage(secondName);
  };

  const secondMessage = useSyncExternalStore((callback) => {
    if (!secondName) return () => { };
    const cleanup = manager.addMessageSubscribe(secondName, () => {
      callback();
    });
    return () => cleanup();
  }, getSecondMessage, getSecondMessage);

  const {
    min,
    max,
    minTime,
    maxTime,
  } = useMemo(() => {
    let min = new $DateTime("1900-01-01T00:00:00");
    const minMonth = schemaItem.getMinMonth(injectParams);
    if (minMonth && min.isBefore(minMonth)) {
      min = new $DateTime(minMonth);
    }
    const minDate = schemaItem.getMinDate(injectParams);
    if (minDate && min.isBefore(minDate)) {
      min = new $DateTime(minDate);
    }
    const minDateTime = schemaItem.getMinDateTime(injectParams);
    if (minDateTime && min.isBefore(minDateTime)) {
      min = new $DateTime(minDateTime);
    }

    let max = new $DateTime("2100-12-31T23:59:59");
    const maxMonth = schemaItem.getMaxMonth(injectParams);
    if (maxMonth && max.isAfter(maxMonth)) {
      max = new $DateTime(maxMonth);
    }
    const maxDate = schemaItem.getMaxDate(injectParams);
    if (maxDate && max.isAfter(maxDate)) {
      max = new $DateTime(maxDate);
    }
    const maxDateTime = schemaItem.getMaxDateTime(injectParams);
    if (maxDateTime && max.isAfter(maxDateTime)) {
      max = new $DateTime(maxDateTime);
    }

    return {
      max,
      min,
      minTime: schemaItem instanceof $DateTimeSchema ? schemaItem.getMinTime(injectParams) : undefined,
      maxTime: schemaItem instanceof $DateTimeSchema ? schemaItem.getMaxTime(injectParams) : undefined,
    };
  }, [
    schemaItem,
    injectParams,
    coreRefsValuesString,
  ]);

  const {
    yearRequired,
    minYear,
    maxYear,
  } = useMemo(() => {
    return {
      yearRequired: yearSchemaItem?.getRequired(injectParams) ?? false,
      minYear: yearSchemaItem?.getMin(injectParams) ?? min.getYear(),
      maxYear: yearSchemaItem?.getMax(injectParams) ?? max.getYear(),
    };
  }, [
    yearSchemaItem,
    injectParams,
    yearRefsValuesString,
    min,
    max,
  ]);

  const {
    monthRequired,
    minMonth,
    maxMonth,
  } = useMemo(() => {
    return {
      monthRequired: monthSchemaItem?.getRequired(injectParams) ?? false,
      minMonth: monthSchemaItem?.getMin(injectParams),
      maxMonth: monthSchemaItem?.getMax(injectParams),
    };
  }, [
    monthSchemaItem,
    injectParams,
    monthRefsValuesString,
  ]);

  const {
    dayRequired,
    minDay,
    maxDay,
  } = useMemo(() => {
    return {
      dayRequired: daySchemaItem?.getRequired(injectParams) ?? false,
      minDay: daySchemaItem?.getMin(injectParams),
      maxDay: daySchemaItem?.getMax(injectParams),
    };
  }, [
    daySchemaItem,
    injectParams,
    dayRefsValuesString,
  ]);

  const {
    hourRequired,
    minHour,
    maxHour,
    hourStep,
  } = useMemo(() => {
    return {
      hourRequired: hourSchemaItem?.getRequired(injectParams) ?? false,
      minHour: hourSchemaItem?.getMin(injectParams) ?? 0,
      maxHour: hourSchemaItem?.getMax(injectParams) ?? 23,
      hourStep: hourSchemaItem?.getStep() ?? 1,
    };
  }, [
    hourSchemaItem,
    injectParams,
    hourRefsValuesString,
  ]);

  const {
    minuteRequired,
    minMinute,
    maxMinute,
    minuteStep,
  } = useMemo(() => {
    return {
      minuteRequired: minuteSchemaItem?.getRequired(injectParams) ?? false,
      minMinute: minuteSchemaItem?.getMin(injectParams) ?? 0,
      maxMinute: minuteSchemaItem?.getMax(injectParams) ?? 59,
      minuteStep: minuteSchemaItem?.getStep() ?? 1,
    };
  }, [
    minuteSchemaItem,
    injectParams,
    minuteRefsValuesString,
  ]);

  const {
    secondRequired,
    minSecond,
    maxSecond,
    secondStep,
  } = useMemo(() => {
    return {
      secondRequired: secondSchemaItem?.getRequired(injectParams) ?? false,
      minSecond: secondSchemaItem?.getMin(injectParams) ?? 0,
      maxSecond: secondSchemaItem?.getMax(injectParams) ?? 59,
      secondStep: secondSchemaItem?.getStep() ?? 1,
    };
  }, [
    secondSchemaItem,
    injectParams,
    secondRefsValuesString,
  ]);

  const {
    type,
    timeBasis,
    // formatPattern,
  } = useMemo(() => {
    let type: "date" | "month" | "datetime-local" = "month";
    let timeBasis: "hour" | "minute" | "second" | undefined;
    let formatPattern = "yyyy-MM";
    if (schemaItem) {
      if (schemaItem instanceof $DateSchema) {
        type = "date";
        formatPattern = "yyyy-MM-dd";
      } else if (schemaItem instanceof $DateTimeSchema) {
        type = "datetime-local";
        formatPattern = "yyyy-MM-ddThh:mm:ss";
        timeBasis = schemaItem.getTimeBasis();
      }
    } else {
      if (dayName) {
        type = "date";
        formatPattern = "yyyy-MM-dd";
      }
      if (hourName) {
        type = "datetime-local";
        formatPattern = "yyyy-MM-ddThh";
        timeBasis = "hour";
      }
      if (minuteName) {
        type = "datetime-local";
        formatPattern = "yyyy-MM-ddThh:mm";
        timeBasis = "minute";
      }
      if (secondName) {
        type = "datetime-local";
        formatPattern = "yyyy-MM-ddThh:mm:ss";
        timeBasis = "second";
      }
    }

    return {
      type,
      timeBasis,
      formatPattern,
    };
  }, [
    schemaItem,
    dayName,
    hourName,
    minuteName,
    secondName,
  ]);

  function getOptionMinMax({
    year = yearNum,
    month = monthNum,
    day = dayNum,
    hour = hourNum,
    minute = minuteNum,
  }: Partial<Record<Exclude<DateSeparateKeys, "second">, Schema.Nullable<number>>>) {
    let optionMinMonth = 0, optionMaxMonth = 11;
    let optionMinDay = 1, optionMaxDay = 31;
    let optionMinHour = 0, optionMaxHour = 23;
    let optionMinMinute = 0, optionMaxMinute = 59;
    let optionMinSecond = 0, optionMaxSecond = 59;

    if (validScripts) {
      // month
      if (minYear === maxYear) {
        optionMinMonth = min.getMonth();
        optionMaxMonth = max.getMonth();
      }
      if (year != null) {
        if (minYear === year) {
          optionMinMonth = min.getMonth();
        }
        if (maxYear === year) {
          optionMaxMonth = max.getMonth();
        }
      }
      if (minMonth != null) {
        optionMinMonth = Math.max(optionMinMonth, minMonth);
      }
      if (maxMonth != null) {
        optionMaxMonth = Math.min(optionMaxMonth, maxMonth);
      }
      if (type !== "month") {
        // day
        if ((min.getMonth() + 1) === month && min.getYear() === year) {
          optionMinDay = min.getDay();
        }
        if ((max.getMonth() + 1) === month && max.getYear() === year) {
          optionMaxDay = max.getDay();
        }
        if (year != null && month != null) {
          optionMaxDay = Math.min(optionMaxDay, new Date(year, month, 0).getDate());
        }
        if (minDay != null) {
          optionMinDay = Math.max(optionMinDay, minDay);
        }
        if (maxDay != null) {
          optionMaxDay = Math.min(optionMaxDay, maxDay);
        }
      }
      if (type === "datetime-local") {
        // hour
        if (year != null
          && month != null
          && day != null
        ) {
          if (min.getDay() === day
            && (min.getMonth() + 1) === month
            && min.getYear() === year
          ) {
            optionMinHour = min.getHour();
          }
          if (max.getDay() === day
            && (max.getMonth() + 1) === month
            && max.getYear() === year
          ) {
            optionMaxHour = max.getHour();
          }
        }
        optionMinHour = Math.max(optionMinHour, minTime?.getHour() ?? 0, minHour);
        optionMaxHour = Math.min(optionMaxHour, maxTime?.getHour() ?? 23, maxHour);
        // minute
        if (year != null
          && month != null
          && day != null
          && hour != null
        ) {
          if (min.getHour() === hour
            && min.getDay() === day
            && (min.getMonth() + 1) === month
            && min.getYear() === year
          ) {
            optionMinMinute = min.getMinute();
          }
          if (max.getHour() === hour
            && max.getDay() === day
            && (max.getMonth() + 1) === month
            && max.getYear() === year
          ) {
            optionMaxMinute = max.getMinute();
          }
        }
        optionMinMinute = Math.max(optionMinMinute, minTime?.getMinute() ?? 0, minMinute);
        optionMaxMinute = Math.min(optionMaxMinute, maxTime?.getMinute() ?? 59, maxMinute);
        // second
        if (timeBasis === "second") {
          if (minute !== null
            && year != null
            && month != null
            && day != null
            && hour != null
          ) {
            if (min.getMinute() === minute
              && min.getHour() === hour
              && min.getDay() === day
              && (min.getMonth() + 1) === month
              && min.getYear() === year
            ) {
              optionMinSecond = min.getSecond();
            }
            if (max.getMinute() === minute
              && max.getHour() === hour
              && max.getDay() === day
              && (max.getMonth() + 1) === month
              && max.getYear() === year
            ) {
              optionMaxSecond = max.getSecond();
            }
          }
          optionMinSecond = Math.max(optionMinSecond, minTime?.getSecond() ?? 0, minSecond);
          optionMaxSecond = Math.min(optionMaxSecond, maxTime?.getSecond() ?? 59, maxSecond);
        }
      }
    }

    return {
      optionMinMonth,
      optionMaxMonth,
      optionMinDay,
      optionMaxDay,
      optionMinHour,
      optionMaxHour,
      optionMinMinute,
      optionMaxMinute,
      optionMinSecond,
      optionMaxSecond,
    } as const;
  };

  const {
    optionMinMonth,
    optionMaxMonth,
    optionMinDay,
    optionMaxDay,
    optionMinHour,
    optionMaxHour,
    optionMinMinute,
    optionMaxMinute,
    optionMinSecond,
    optionMaxSecond,
  } = getOptionMinMax({});

  const yearOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    for (let i = minYear; i <= maxYear; i++) {
      options.push(
        <option
          key={i}
          value={i}
        >
          {i}
        </option>
      );
    }
    return options;
  }, [
    minYear,
    maxYear,
  ]);

  const monthOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    for (let i = optionMinMonth; i <= optionMaxMonth; i++) {
      options.push(
        <option
          key={i}
          value={i + 1}
        >
          {i + 1}
        </option>
      );
    }
    return options;
  }, [
    optionMinMonth,
    optionMaxMonth,
  ]);

  const dayOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type === "month") return options;
    for (let i = optionMinDay; i <= optionMaxDay; i++) {
      options.push(
        <option
          key={i}
          value={i}
        >
          {i}
        </option>
      );
    }
    return options;
  }, [
    type,
    optionMinDay,
    optionMaxDay,
  ]);

  const hourOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime-local") return options;
    const initAddStep = optionMinHour % hourStep;
    for (let i = optionMinHour + initAddStep; i <= optionMaxHour; i += hourStep) {
      options.push(
        <option
          key={i}
          value={i}
        >
          {`0${i}`.slice(-2)}
        </option>
      );
    }
    return options;
  }, [
    type,
    hourStep,
    optionMinHour,
    optionMaxHour,
  ]);

  const minuteOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime-local" || timeBasis === "hour") return options;
    const initAddStep = optionMinMinute % minuteStep;
    for (let i = optionMinMinute + initAddStep; i <= optionMaxMinute; i += minuteStep) {
      options.push(
        <option
          key={i}
          value={i}
        >
          {`0${i}`.slice(-2)}
        </option>
      );
    }
    return options;
  }, [
    type,
    timeBasis,
    minuteStep,
    optionMinMinute,
    optionMaxMinute,
  ]);

  const secondOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime-local" || timeBasis !== "second") return options;
    const initAddStep = optionMinSecond % secondStep;
    for (let i = optionMinSecond + initAddStep; i <= optionMaxSecond; i += secondStep) {
      options.push(
        <option
          key={i}
          value={i}
        >
          {i}
        </option>
      );
    }
    return options;
  }, [
    type,
    timeBasis,
    secondStep,
    optionMinSecond,
    optionMaxSecond,
  ]);

  const mode = core?.getMode(injectParams) ?? "enabled";
  let state: Schema.Mode = "enabled";
  if (mode === "hidden") state = "hidden";
  else if (fs.disabled || mode === "disabled") state = "disabled";
  else if (fs.readOnly || mode === "readonly" || formState === "loading" || formState === "submitting") state = "readonly";

  const displayMessage = selectBoxDisplayMessage({
    core: {
      name: coreName,
      schemaItem: schemaItem,
      message: coreMessage,
    },
    year: {
      name: yearName,
      schemaItem: yearSchemaItem,
      message: yearMessage,
    },
    month: {
      name: monthName,
      schemaItem: monthSchemaItem,
      message: monthMessage,
    },
    day: {
      name: dayName,
      schemaItem: daySchemaItem,
      message: dayMessage,
    },
    hour: {
      name: hourName,
      schemaItem: hourSchemaItem,
      message: hourMessage,
    },
    minute: {
      name: minuteName,
      schemaItem: minuteSchemaItem,
      message: minuteMessage,
    },
    second: {
      name: secondName,
      schemaItem: secondSchemaItem,
      message: secondMessage,
    },
  });

  const isInvalid = displayMessage?.type === "e";
  let errormMessageId: string | undefined;
  let errormessage: string | undefined;
  if (isInvalid) {
    if (hideMessage) {
      errormessage = getResultMessage(use(I18nContext).t, displayMessage);
    } else {
      errormMessageId = errormessage = `${schemaId}_${displayMessage.name}__msg`;
    }
  }

  function commitCoreValue({
    year = yearNum,
    month = monthNum,
    day = dayNum,
    hour = hourNum,
    minute = minuteNum,
    second = secondNum,
  }: Partial<Record<DateSeparateKeys, Schema.Nullable<number>>>) {
    function set(v: $DateTime | $Date | $Month | null | undefined) {
      if (core) {
        core.setValue(v);
      } else {
        const msg = schemaItem.validate(
          dummyDateRef.current = v as ($DateTime & $Date & $Month) | null | undefined,
          injectParams
        )[""]?.[0];
        manager.setMessage(id, msg);
      }
    }

    if (type === "month") {
      if (year == null || month == null) {
        set(null);
        return;
      }
      set(new $Month(`${year}-${month}`));
      return;
    }
    if (type === "date") {
      if (year == null || month == null || day == null) {
        set(null);
        return;
      }
      set(new $Date(`${year}-${month}-${day}`));
      return;
    }
    if (type === "datetime-local") {
      if (year == null || month == null || day == null || hour == null) {
        set(null);
        return;
      }
      if (timeBasis === "hour") {
        set(new $DateTime(`${year}-${month}-${day}T${hour}`));
        return;
      }
      if (minute == null) {
        set(null);
        return;
      }
      if (timeBasis === "minute") {
        set(new $DateTime(`${year}-${month}-${day}T${hour}:${minute}`));
        return;
      }
      if (second == null) {
        set(null);
        return;
      }
      set(new $DateTime(`${year}-${month}-${day}T${hour}:${minute}:${second}`));
      return;
    }
  };

  function effectOtherValue(changed: Partial<Record<Exclude<DateSeparateKeys, "second">, Schema.Nullable<number>>>) {
    const minMax = getOptionMinMax(changed);
    const effected: Partial<Record<DateSeparateKeys, Schema.Nullable<number>>> = {};
    if (
      !("month" in changed) &&
      monthNum != null &&
      (monthNum < minMax.optionMinMonth || minMax.optionMaxMonth < monthNum)
    ) {
      if (month == null) {
        effected.month = nums.current.month = null;
        dummySubscribes.current.month?.();
      } else {
        effected.month = manager.setValue(month.getName(), null).value;
      }
    }
    if (
      !("day" in changed) &&
      dayNum != null &&
      (dayNum < minMax.optionMinDay || minMax.optionMaxDay < dayNum)
    ) {
      if (day == null) {
        effected.day = nums.current.day = null;
        dummySubscribes.current.day?.();
      } else {
        effected.day = manager.setValue(day.getName(), null).value;
      }
    }
    if (
      !("hour" in changed) &&
      hourNum != null &&
      (hourNum < minMax.optionMinHour || minMax.optionMaxHour < hourNum)
    ) {
      if (hour == null) {
        effected.hour = nums.current.hour = null;
        dummySubscribes.current.hour?.();
      } else {
        effected.hour = manager.setValue(hour.getName(), null).value;
      }
    }
    if (
      !("minute" in changed) &&
      minuteNum != null &&
      (minuteNum < minMax.optionMinMinute || minMax.optionMaxMinute < minuteNum)
    ) {
      if (minute == null) {
        effected.minute = nums.current.minute = null;
        dummySubscribes.current.minute?.();
      } else {
        effected.minute = manager.setValue(minute.getName(), null).value;
      }
    }
    if (
      secondNum != null &&
      (secondNum < minMax.optionMinSecond || minMax.optionMaxSecond < secondNum)
    ) {
      if (second == null) {
        effected.second = nums.current.second = null;
        dummySubscribes.current.second?.();
      } else {
        effected.second = manager.setValue(second.getName(), null).value;
      }
    }
    return effected;
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    focus: () => ref$.current.focus(),
  } as const satisfies DateSelectBox$Ref));

  useEffect(() => {
    if (core?.isDirty()) {
      core.validate();
    }
  }, [coreRefsValuesString]);

  useEffect(() => {
    if (hour?.isDirty()) {
      hour.validate();
    }
  }, [hourRefsValuesString]);

  useEffect(() => {
    if (minute?.isDirty()) {
      minute.validate();
    }
  }, [minuteRefsValuesString]);

  useEffect(() => {
    if (day?.isDirty()) {
      day.validate();
    }
  }, [dayRefsValuesString]);

  useEffect(() => {
    if (hour?.isDirty()) {
      hour.validate();
    }
  }, [hourRefsValuesString]);

  useEffect(() => {
    if (minute?.isDirty()) {
      minute.validate();
    }
  }, [minuteRefsValuesString]);

  useEffect(() => {
    if (second?.isDirty()) {
      second.validate();
    }
  }, [secondRefsValuesString]);

  return (
    <WithMessage
      id={errormMessageId}
      hide={hideMessage}
      state={state}
      message={displayMessage}
    >
      <InputGroupWrapper
        id={id}
        className={className}
        style={style}
        ref={wref}
        state={state}
      >
        {
          coreName &&
          <input
            id={`${schemaId}_${coreName}`}
            type="hidden"
            name={coreName}
            value={coreValue?.toString() || ""}
          />
        }
        <PartSelectBox
          ref={ref$}
          id={`${schemaId}_${yearName || `${coreName}_year`}`}
          name={yearName}
          label={t(yearSchemaItem?.getLabel() as I18nTextKey) || label}
          errormessage={displayMessage?.name === yearName ? errormessage : undefined}
          omitOnSubmit={omitOnSubmit}
          required={yearRequired}
          invalid={yearMessage?.type === "e" || coreMessage?.type === "e"}
          coreState={state}
          placeholder={placeholder?.[0]}
          splitSchemaItem={yearSchemaItem}
          injectParams={injectParams}
          value={yearNum}
          onChangeValue={(v) => {
            let newVal: Schema.Nullable<number>;
            if (year == null) {
              newVal = nums.current.year = parseNumber(v)[0];
              dummySubscribes.current.year?.();
            } else {
              newVal = manager.setValue(year.getName(), v).value;
            }
            const effected = effectOtherValue({ year: newVal ?? null });
            commitCoreValue({ year: newVal ?? null, ...effected });
          }}
          autoFocus={autoFocus}
        >
          {yearOptions}
        </PartSelectBox>
        <SepSpan>/</SepSpan>
        <PartSelectBox
          id={`${schemaId}_${monthName || `${coreName}_month`}`}
          name={monthName}
          label={t(monthSchemaItem?.getLabel() as I18nTextKey) || label}
          errormessage={displayMessage?.name === monthName ? errormessage : undefined}
          omitOnSubmit={omitOnSubmit}
          required={monthRequired}
          invalid={monthMessage?.type === "e" || coreMessage?.type === "e"}
          coreState={state}
          placeholder={placeholder?.[1]}
          splitSchemaItem={monthSchemaItem}
          injectParams={injectParams}
          value={monthNum}
          onChangeValue={(v) => {
            let newVal;
            if (month == null) {
              newVal = nums.current.month = parseNumber(v)[0];
              dummySubscribes.current.month?.();
            } else {
              newVal = manager.setValue(month.getName(), v).value;
            }
            const effected = effectOtherValue({ month: newVal ?? null });
            commitCoreValue({ month: newVal ?? null, ...effected });
          }}
        >
          {monthOptions}
        </PartSelectBox>
        {
          (type === "datetime-local" || type === "date") &&
          <>
            <SepSpan>/</SepSpan>
            <PartSelectBox
              id={`${schemaId}_${dayName || `${coreName}_day`}`}
              name={dayName}
              label={t(daySchemaItem?.getLabel() as I18nTextKey) || label}
              errormessage={displayMessage?.name === dayName ? errormessage : undefined}
              omitOnSubmit={omitOnSubmit}
              required={dayRequired}
              invalid={dayMessage?.type === "e" || coreMessage?.type === "e"}
              coreState={state}
              placeholder={placeholder?.[2]}
              splitSchemaItem={daySchemaItem}
              injectParams={injectParams}
              value={dayNum}
              onChangeValue={(v) => {
                let newVal;
                if (day == null) {
                  newVal = nums.current.day = parseNumber(v)[0];
                  dummySubscribes.current.day?.();
                } else {
                  newVal = manager.setValue(day.getName(), v).value;
                }
                const effected = effectOtherValue({ day: newVal ?? null });
                commitCoreValue({ day: newVal ?? null, ...effected });
              }}
            >
              {dayOptions}
            </PartSelectBox>
          </>
        }
        {
          type === "datetime-local" &&
          <>
            <SepSpan> </SepSpan>
            <PartSelectBox
              id={`${schemaId}_${hourName || `${coreName}_hour`}`}
              name={hourName}
              label={t(hourSchemaItem?.getLabel() as I18nTextKey) || label}
              errormessage={displayMessage?.name === hourName ? errormessage : undefined}
              omitOnSubmit={omitOnSubmit}
              required={hourRequired}
              invalid={hourMessage?.type === "e" || coreMessage?.type === "e"}
              coreState={state}
              placeholder={placeholder?.[3]}
              splitSchemaItem={hourSchemaItem}
              injectParams={injectParams}
              value={hourNum}
              onChangeValue={(v) => {
                let newVal;
                if (hour == null) {
                  newVal = nums.current.hour = parseNumber(v)[0];
                  dummySubscribes.current.hour?.();
                } else {
                  newVal = manager.setValue(hour.getName(), v).value;
                }
                const effected = effectOtherValue({ hour: newVal ?? null });
                commitCoreValue({ hour: newVal ?? null, ...effected });
              }}
            >
              {hourOptions}
            </PartSelectBox>
            {
              timeBasis !== "hour" &&
              <>
                <SepSpan>:</SepSpan>
                <PartSelectBox
                  id={`${schemaId}_${minuteName || `${coreName}_minute`}`}
                  name={minuteName}
                  label={t(minuteSchemaItem?.getLabel() as I18nTextKey) || label}
                  errormessage={displayMessage?.name === minuteName ? errormessage : undefined}
                  omitOnSubmit={omitOnSubmit}
                  required={minuteRequired}
                  invalid={minuteMessage?.type === "e" || coreMessage?.type === "e"}
                  coreState={state}
                  placeholder={placeholder?.[4]}
                  splitSchemaItem={minuteSchemaItem}
                  injectParams={injectParams}
                  value={minuteNum}
                  onChangeValue={(v) => {
                    let newVal;
                    if (minute == null) {
                      newVal = nums.current.minute = parseNumber(v)[0];
                      dummySubscribes.current.minute?.();
                    } else {
                      newVal = manager.setValue(minute.getName(), v).value;
                    }
                    const effected = effectOtherValue({ minute: newVal ?? null });
                    commitCoreValue({ minute: newVal ?? null, ...effected });
                  }}
                >
                  {minuteOptions}
                </PartSelectBox>
              </>
            }
            {
              timeBasis === "second" &&
              <>
                <SepSpan>:</SepSpan>
                <PartSelectBox
                  id={`${schemaId}_${secondName || `${coreName}_second`}`}
                  name={secondName}
                  label={t(secondSchemaItem?.getLabel() as I18nTextKey) || label}
                  errormessage={displayMessage?.name === secondName ? errormessage : undefined}
                  omitOnSubmit={omitOnSubmit}
                  required={secondRequired}
                  invalid={secondMessage?.type === "e" || coreMessage?.type === "e"}
                  coreState={state}
                  placeholder={placeholder?.[5]}
                  splitSchemaItem={secondSchemaItem}
                  injectParams={injectParams}
                  value={secondNum}
                  onChangeValue={(v) => {
                    let newVal;
                    if (second == null) {
                      newVal = nums.current.second = parseNumber(v)[0];
                      dummySubscribes.current.second?.();
                    } else {
                      newVal = manager.setValue(second.getName(), v).value;
                    }
                    commitCoreValue({ second: newVal ?? null });
                  }}
                >
                  {secondOptions}
                </PartSelectBox>
              </>
            }
          </>
        }
      </InputGroupWrapper>
    </WithMessage>
  );
};

type PartSelectBoxProps = {
  ref?: RefObject<SelectBoxRef>;
  id: string;
  name: string | undefined;
  label: string | undefined;
  errormessage: string | undefined;
  omitOnSubmit?: boolean;
  required: boolean;
  invalid: boolean;
  coreState?: Schema.Mode;
  splitSchemaItem?: SchemaItem;
  placeholder?: string;
  value: Schema.Nullable<number>;
  onChangeValue: (value: string) => void;
  injectParams: Schema.InjectParams;
  children: ReactNode;
  autoFocus?: boolean;
};

function PartSelectBox({
  ref,
  ...props
}: PartSelectBoxProps) {
  let state: Schema.Mode = "enabled";
  const splitMode = props.splitSchemaItem?.getMode(props.injectParams) ?? "enabled";
  if (props.coreState === "hidden" || splitMode === "hidden") state = "hidden";
  else if (props.coreState === "disabled" || splitMode === "disabled") state = "disabled";
  else if (props.coreState === "readonly" || splitMode === "readonly") state = "readonly";

  return (
    <SelectBox
      ref={ref}
      invalid={props.invalid}
      state={state}
      placeholder={props.placeholder}
      value={props.value}
      onChangeValue={props.onChangeValue}
      selectProps={{
        id: props.id,
        name: props.omitOnSubmit ? undefined : props.name,
        "aria-label": props.label,
        "aria-errormessage": props.errormessage,
      }}
      autoFocus={props.autoFocus}
    >
      <SelectBoxEmptyOption
        required={props.required}
      />
      {props.children}
    </SelectBox>
  );
};
