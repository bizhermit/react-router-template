import { useId, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react";
import { getValidationValue, InputField, InputGroup, Placeholder, type InputWrapProps } from "./common";
import { formatDate, parseDate } from "~/components/objects/date";
import { clsx, ZERO_WIDTH_SPACE } from "../utilities";
import { getDefaultState, getSchemaItemMode, getSchemaItemRequired, getSchemaItemResult, MODE, MODE_PRIORITY, parseSchemaItemValue, schemaItemEffect, schemaItemValidation, useFieldSet, useSchemaEffect, useSchemaItem, type SchemaEffectParams_Result, type SchemaEffectParams_ValueResult } from "~/components/schema/hooks";
import { parseTimeNums, parseTypedDate } from "~/components/schema/date";

export type DateSelectBoxProps<D extends Schema.DataItem<Schema.$SplitDate>> = InputWrapProps & {
  $: D;
  placeholder?: [string, string] | [string, string, string] | [string, string, string, string] | [string, string, string, string, string] | [string, string, string, string, string, string];
};

const DEFAULT_MIN_DATE = new Date("1970-01-01T00:00:00");
const DEFAULT_MAX_DATE = new Date("2099-12-31T23:59:59");

function SepSpan(props: { children: ReactNode }) {
  return <span className="px-2">{props.children}</span>
};

function selectBoxDisplayResult(
  t: Schema.Env["t"],
  r: Schema.Result | null | undefined,
  Y: Schema.Result | null | undefined,
  M: Schema.Result | null | undefined,
  D: Schema.Result | null | undefined,
  h: Schema.Result | null | undefined,
  m: Schema.Result | null | undefined,
  s: Schema.Result | null | undefined
): Schema.Result | null | undefined {
  const req: Array<Schema.SplitDateTarget> = [];
  if (Y?.code === "required") req.push("Y");
  if (M?.code === "required") req.push("M")
  if (D?.code === "required") req.push("D");
  if (h?.code === "required") req.push("h");
  if (m?.code === "required") req.push("m");
  if (s?.code === "required") req.push("s");
  if (req.length > 0) {
    return {
      type: "e",
      message: t(`入力してください（${req.join(",")}）。`),
      code: "split-required",
    };
  }
  return Y ?? M ?? D ?? h ?? m ?? s ?? r;
};

export function DateSelectBox<P extends Schema.DataItem<Schema.$SplitDate>>({
  $: _$,
  placeholder,
  ...props
}: DateSelectBoxProps<P>) {
  const id = useId();
  const isEffected = useRef(false);

  const fs = useFieldSet();
  const ref = useRef<HTMLDivElement>(null!);

  const $date = _$.core as Schema.DataItem<Schema.$DateTime>;
  const $year = $date.splits.Y;
  const $month = $date.splits.M;
  const $day = $date.splits.D;
  const $hour = $date.splits.h;
  const $minute = $date.splits.m;
  const $second = $date.splits.s;

  const type = $date._.type as (Schema.$Date["type"] | Schema.$Month["type"] | Schema.$DateTime["type"]);
  const time = $date._.time;

  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "data":
        isEffected.current = false;
        setValue(getValue);
        setYearValue(getYearValue);
        setMonthValue(getMonthValue);
        setDayValue(getDayValue);
        setHourValue(getHourValue);
        setMinuteValue(getMinuteValue);
        setSecondValue(getSecondValue);
        setResult(getResult);
        setYearResult(getYearResult);
        setMonthResult(getMonthResult);
        setDayResult(getDayResult);
        setHourResult(getHourResult);
        setMinuteResult(getMinuteResult);
        setSecondResult(getSecondResult);
        // NOTE: no break
      case "dep":
        setMode(getMode);
        setYearMode(getYearMode);
        setMonthMode(getMonthMode);
        setDayMode(getDayMode);
        setHourMode(getHourMode);
        setMinuteMode(getMinuteMode);
        setSecondMode(getSecondMode);
        setRequired(getRequired);
        setYearRequired(getYearRequired);
        setMonthRequired(getMonthRequired);
        setDayRequired(getDayRequired);
        setHourRequired(getHourRequired);
        setMinuteRequired(getMinuteRequired);
        setSecondRequired(getSecondRequired);
        setMin(getMin);
        setMax(getMax);
        setMinTime(getMinTime);
        setMaxTime(getMaxTime);
        setMinYear(getMinYear);
        setMaxYear(getMaxYear);
        setMinMonth(getMinMonth);
        setMaxMonth(getMaxMonth);
        setMinDay(getMinDay);
        setMaxDay(getMaxDay);
        setMinHour(getMinHour);
        setMaxHour(getMaxHour);
        setMinMinute(getMinMinute);
        setMaxMinute(getMaxMinute);
        setMinSecond(getMinSecond);
        setMaxSecond(getMaxSecond);
        break;
      case "value-result":
      case "value": {
        function update(
          $: Schema.DataItem<Schema.$Any> | undefined,
          valueSetter: Dispatch<SetStateAction<any>>,
          resultSetter: Dispatch<SetStateAction<any>>,
        ) {
          if (!$?.name) return false;
          const item = (params as SchemaEffectParams_ValueResult).items.find(item => item.name === $.name);
          if (!item) return false;
          if (params.type === "value-result") {
            valueSetter(item.value);
            resultSetter(item.result);
          } else {
            const submission = schemaItemEffect($, schema, item.value);
            valueSetter(submission.value);
            resultSetter(submission.result);
          }
          isEffected.current = true;
          return true;
        }
        update($date, setValue, setResult);
        update($year, setYearValue, setYearResult);
        update($month, setMonthValue, setMonthResult);
        update($day, setDayValue, setDayResult);
        update($hour, setHourValue, setHourResult);
        update($minute, setMinuteValue, setMinuteResult);
        update($second, setSecondValue, setSecondResult);

        const results: Array<{ name: string, result: Schema.Result | null | undefined }> = [];
        function updateWithRefs(
          $: Schema.DataItem<Schema.$Any> | undefined,
          valueGetter: () => any,
          callback: () => void,
        ) {
          if (!$) return false;
          if ($._.refs?.some(ref => (params as SchemaEffectParams_ValueResult).items.some(item => item.name === ref))) {
            callback();
            const result = schemaItemValidation($, schema, valueGetter);
            if ($.name) results.push({ name: $.name, result });
            else setResult(result);
            return true;
          }
          return false;
        }
        updateWithRefs($date, getValue, () => {
          setMode(getMode);
          setRequired(getRequired);
          setMin(getMin);
          setMax(getMax);
          setMinTime(getMinTime);
          setMaxTime(getMaxTime);
        });
        updateWithRefs($year, getYearValue, () => {
          setYearMode(getYearMode);
          setYearRequired(getYearRequired);
          setMinYear(getMinYear);
          setMaxYear(getMaxYear);
        });
        updateWithRefs($month, getMonthValue, () => {
          setMonthMode(getMonthMode);
          setMonthRequired(getMonthRequired);
          setMinMonth(getMinMonth);
          setMaxMonth(getMaxMonth);
        });
        updateWithRefs($day, getDayValue, () => {
          setDayMode(getDayMode);
          setDayRequired(getDayRequired);
          setMinDay(getMinDay);
          setMaxDay(getMaxDay);
        });
        updateWithRefs($hour, getHourValue, () => {
          setHourMode(getHourMode);
          setHourRequired(getHourRequired);
          setMinHour(getMinHour);
          setMaxHour(getMaxHour);
        });
        updateWithRefs($minute, getMinuteValue, () => {
          setMinuteMode(getMinuteMode);
          setMinuteRequired(getMinuteRequired);
          setMinMinute(getMinMinute);
          setMaxMinute(getMaxMinute);
        });
        updateWithRefs($second, getSecondValue, () => {
          setSecondMode(getSecondMode);
          setSecondRequired(getSecondRequired);
          setMinSecond(getMinSecond);
          setMaxSecond(getMaxSecond);
        });
        if (schema.setResults(results)) {
          isEffected.current = true;
        }
      }
      case "result": {
        function update(
          $: Schema.DataItem<Schema.$Any> | undefined,
          resultSetter: Dispatch<SetStateAction<any>>,
        ) {
          if (!$?.name) return false;
          const item = (params as SchemaEffectParams_Result).items.find(item => item.name === $.name);
          if (!item) return false;
          resultSetter(item.result);
          isEffected.current = true;
          return true;
        }
        update($date, setResult);
        update($year, setYearResult);
        update($month, setMonthResult);
        update($day, setDayResult);
        update($hour, setHourResult);
        update($minute, setMinuteResult);
        update($second, setSecondResult);
        break;
      }
      default:
        break;
    }
  }, () => {
    return {
      id,
      name: id,
    };
  });

  const isValidScripts = schema.isValidScripts.current;

  function getModeImpl($: Schema.DataItem<Schema.$Any> | undefined): Schema.Mode {
    if (!$) return "hidden";
    return getSchemaItemMode($, schema);
  };

  function getMode() {
    return getModeImpl($date);
  };

  const [mode, setMode] = useState(getMode);

  function getYearMode() {
    return getModeImpl($year);
  };

  const [yearMode, setYearMode] = useState(getYearMode);

  function getMonthMode() {
    return getModeImpl($month);
  };

  const [monthMode, setMonthMode] = useState(getMonthMode);

  function getDayMode() {
    return getModeImpl($day);
  };

  const [dayMode, setDayMode] = useState(getDayMode);

  function getHourMode() {
    return getModeImpl($hour);
  };

  const [hourMode, setHourMode] = useState(getHourMode);

  function getMinuteMode() {
    return getModeImpl($minute);
  };

  const [minuteMode, setMinuteMode] = useState(getMinuteMode);

  function getSecondMode() {
    return getModeImpl($second);
  };

  const [secondMode, setSecondMode] = useState(getSecondMode);

  function joinSplitTypedDate(values: Record<Schema.SplitDateTarget, number | undefined>) {
    if (values.Y == null || values.M == null) return undefined;
    switch (type) {
      case "date":
        if (values.D == null) return undefined;
        return parseDate(`${values.Y}-${values.M}-${values.D}`);
      case "month":
        return parseDate(`${values.Y}-${values.M}`);
      default:
        if (values.D == null || values.h == null || values.m == null) return undefined;
        switch (time) {
          case "hm":
            return parseDate(`${values.Y}-${values.M}-${values.D}T${values.h}:${values.m}`);
          default:
            if (values.s == null) return undefined;
            return parseDate(`${values.Y}-${values.M}-${values.D}T${values.h}:${values.m}:${values.s}`);
        }
    }
  };

  function parseTypedValue(values: Record<Schema.SplitDateTarget, number | undefined>) {
    return formatDate(joinSplitTypedDate(values), $date._.formatPattern) as Schema.DateValueString | null | undefined;
  };

  function getValue() {
    return parseTypedValue({
      Y: getYearValue(),
      M: getMonthValue(),
      D: getDayValue(),
      h: getHourValue(),
      m: getMinuteValue(),
      s: getSecondValue(),
    });
  };

  const [value, setValue] = useState(getValue);

  function getYearValue() {
    if (!$year) return undefined;
    return schema.data.current.get($year.name);
  };

  const [yearValue, setYearValue] = useState<number | undefined>(getYearValue);

  function getMonthValue() {
    if (!$month) return undefined;
    return schema.data.current.get($month.name);
  };

  const [monthValue, setMonthValue] = useState<number | undefined>(getMonthValue);

  function getDayValue() {
    if (!$day) return undefined;
    return schema.data.current.get($day.name);
  };

  const [dayValue, setDayValue] = useState<number | undefined>(getDayValue);

  function getHourValue() {
    if (!$hour) return undefined;
    return schema.data.current.get($hour.name);
  };

  const [hourValue, setHourValue] = useState<number | undefined>(getHourValue);

  function getMinuteValue() {
    if (!$minute) return undefined;
    return schema.data.current.get($minute.name);
  };

  const [minuteValue, setMinuteValue] = useState<number | undefined>(getMinuteValue);

  function getSecondValue() {
    if (!$second) return undefined;
    return schema.data.current.get($second.name);
  };

  const [secondValue, setSecondValue] = useState<number | undefined>(getSecondValue);

  function getResultImpl($: Schema.DataItem<Schema.$Any> | undefined, getter: () => any) {
    if (!$) return undefined;
    return getSchemaItemResult($, schema, getter);
  };

  function getResult() {
    return getResultImpl($date, getValue);
  };

  const [result, setResult] = useState(getResult);

  function getYearResult() {
    return getResultImpl($year, getYearValue);
  };

  const [yearResult, setYearResult] = useState(getYearResult);

  function getMonthResult() {
    return getResultImpl($month, getMonthValue);
  };

  const [monthResult, setMonthResult] = useState(getMonthResult);

  function getDayResult() {
    return getResultImpl($day, getDayValue);
  };

  const [dayResult, setDayResult] = useState(getDayResult);

  function getHourResult() {
    return getResultImpl($hour, getHourValue);
  };

  const [hourResult, setHourResult] = useState(getHourResult);

  function getMinuteResult() {
    return getResultImpl($minute, getMinuteValue);
  };

  const [minuteResult, setMinuteResult] = useState(getMinuteResult);

  function getSecondResult() {
    return getResultImpl($second, getSecondValue);
  };

  const [secondResult, setSecondResult] = useState(getSecondResult);

  function getRequiredImpl($: Schema.DataItem<Schema.$Any> | undefined) {
    if (!$) return false;
    return getSchemaItemRequired($, schema);
  };

  function getRequired() {
    return getRequiredImpl($date);
  };

  const [required, setRequired] = useState(getRequired);

  function getYearRequired() {
    return getRequiredImpl($year);
  };

  const [yearRequired, setYearRequired] = useState(getYearRequired);

  function getMonthRequired() {
    return getRequiredImpl($month);
  };

  const [monthRequired, setMonthRequired] = useState(getMonthRequired);

  function getDayRequired() {
    return getRequiredImpl($day);
  };

  const [dayRequired, setDayRequired] = useState(getDayRequired);

  function getHourRequired() {
    return getRequiredImpl($hour);
  };

  const [hourRequired, setHourRequired] = useState(getHourRequired);

  function getMinuteRequired() {
    return getRequiredImpl($minute);
  };

  const [minuteRequired, setMinuteRequired] = useState(getMinuteRequired);

  function getSecondRequired() {
    return getRequiredImpl($second);
  };

  const [secondRequired, setSecondRequired] = useState(getSecondRequired);

  function getMin() {
    return parseTypedDate(
      getValidationValue({
        data: schema.data.current,
        dep: schema.dep.current,
        env: schema.env,
        label: $date.label,
      }, $date._.minDate),
      type,
      time,
    ) ?? DEFAULT_MIN_DATE;
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return parseTypedDate(
      getValidationValue({
        data: schema.data.current,
        dep: schema.dep.current,
        env: schema.env,
        label: $date.label,
      }, $date._.maxDate),
      type,
      time,
    ) ?? DEFAULT_MAX_DATE;
  };

  const [max, setMax] = useState(getMax);

  function getMinTime() {
    return parseTimeNums(
      getValidationValue({
        data: schema.data.current,
        dep: schema.dep.current,
        env: schema.env,
        label: $date.label,
      }, $date._.minTime)
    );
  };

  const [minTime, setMinTime] = useState(getMinTime);

  function getMaxTime() {
    return parseTimeNums(
      getValidationValue({
        data: schema.data.current,
        dep: schema.dep.current,
        env: schema.env,
        label: $date.label,
      }, $date._.maxTime)
    );
  };

  const [maxTime, setMaxTime] = useState(getMaxTime);

  function getMinYear() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $year?._.min);
  };

  const [minYear, setMinYear] = useState(getMinYear);

  function getMaxYear() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $year?._.max);
  };

  const [maxYear, setMaxYear] = useState(getMaxYear);

  function getMinMonth() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $month?._.min);
  };

  const [minMonth, setMinMonth] = useState(getMinMonth);

  function getMaxMonth() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $month?._.max);
  };

  const [maxMonth, setMaxMonth] = useState(getMaxMonth);

  function getMinDay() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $day?._.min);
  };

  const [minDay, setMinDay] = useState(getMinDay);

  function getMaxDay() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $day?._.max);
  };

  const [maxDay, setMaxDay] = useState(getMaxDay);

  function getMinHour() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $hour?._.min) ?? 0;
  };

  const [minHour, setMinHour] = useState(getMinHour);

  function getMaxHour() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $hour?._.max) ?? 23;
  };

  const [maxHour, setMaxHour] = useState(getMaxHour);

  function getMinMinute() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $minute?._.min) ?? 0;
  };

  const [minMinute, setMinMinute] = useState(getMinMinute);

  function getMaxMinute() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $minute?._.max) ?? 59;
  };

  const [maxMinute, setMaxMinute] = useState(getMaxMinute);

  function getMinSecond() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $second?._.min) ?? 0;
  };

  const [minSecond, setMinSecond] = useState(getMinSecond);

  function getMaxSecond() {
    return getValidationValue({
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $date.label,
    }, $second?._.max) ?? 59;
  };

  const [maxSecond, setMaxSecond] = useState(getMaxSecond);

  let optionMinYear = min.getFullYear(), optionMaxYear = max.getFullYear();
  let optionMinMonth = 0, optionMaxMonth = 11;
  let optionMinDay = 1, optionMaxDay = 31;
  let optionMinHour = 0, optionMaxHour = 23;
  let optionMinMinute = 0, optionMaxMinute = 59;
  let optionMinSecond = 0, optionMaxSecond = 59;

  if (isValidScripts) {
    // year
    if (minYear != null) {
      optionMinYear = Math.max(optionMinYear, minYear);
    }
    if (maxYear != null) {
      optionMaxYear = Math.min(optionMaxYear, maxYear);
    }
    // month
    if (min.getFullYear() === max.getFullYear()) {
      optionMinMonth = min.getMonth();
      optionMaxMonth = max.getMonth();
    }
    if (yearValue != null) {
      if (min.getFullYear() === yearValue) {
        optionMinMonth = min.getMonth();
      }
      if (max.getFullYear() === yearValue) {
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
      if ((min.getMonth() + 1) === monthValue && min.getFullYear() === yearValue) {
        optionMinDay = min.getDate();
      }
      if ((max.getMonth() + 1) === monthValue && max.getFullYear() === yearValue) {
        optionMaxDay = max.getDate();
      }
      if (yearValue != null && monthValue != null) {
        optionMaxDay = Math.min(optionMaxDay, new Date(yearValue, monthValue, 0).getDate());
      }
      if (minDay != null) {
        optionMinDay = Math.max(optionMinDay, minDay);
      }
      if (maxDay != null) {
        optionMaxDay = Math.min(optionMaxDay, maxDay);
      }
    }
    if (type === "datetime") {
      // hour
      if (yearValue != null
        && monthValue != null
        && dayValue != null
      ) {
        if (min.getDate() === dayValue
          && (min.getMonth() + 1) === monthValue
          && min.getFullYear() === yearValue
        ) {
          optionMinHour = min.getHours();
        }
        if (max.getDate() === dayValue
          && (max.getMonth() + 1) === monthValue
          && max.getFullYear() === yearValue
        ) {
          optionMaxHour = max.getHours();
        }
      }
      optionMinHour = Math.max(optionMinHour, minTime.h, minHour);
      optionMaxHour = Math.min(optionMaxHour, maxTime.h, maxHour);
      // minute
      if (yearValue != null
        && monthValue != null
        && dayValue != null
        && hourValue != null
      ) {
        if (min.getHours() === hourValue
          && min.getDate() === dayValue
          && (min.getMonth() + 1) === monthValue
          && min.getFullYear() === yearValue
        ) {
          optionMinMinute = min.getMinutes();
        }
        if (max.getHours() === hourValue
          && max.getDate() === dayValue
          && (max.getMonth() + 1) === monthValue
          && max.getFullYear() === yearValue
        ) {
          optionMaxMinute = max.getMinutes();
        }
      }
      optionMinMinute = Math.max(optionMinMinute, minTime.m, minMinute);
      optionMaxMinute = Math.min(optionMaxMinute, maxTime.m, maxMinute);
      // second
      if (time === "hms") {
        if (minuteValue !== null
          && yearValue != null
          && monthValue != null
          && dayValue != null
          && hourValue != null
        ) {
          if (min.getMinutes() === minuteValue
            && min.getHours() === hourValue
            && min.getDate() === dayValue
            && (min.getMonth() + 1) === monthValue
            && min.getFullYear() === yearValue
          ) {
            optionMinSecond = min.getSeconds();
          }
          if (max.getMinutes() === minuteValue
            && max.getHours() === hourValue
            && max.getDate() === dayValue
            && (max.getMonth() + 1) === monthValue
            && max.getFullYear() === yearValue
          ) {
            optionMaxSecond = max.getSeconds();
          }
        }
        optionMinSecond = Math.max(optionMinSecond, minTime.s, minSecond);
        optionMaxSecond = Math.min(optionMaxSecond, maxTime.s, maxSecond);
      }
    }
  }

  const yearOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    for (let i = optionMinYear; i <= optionMaxYear; i++) {
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
    optionMinYear,
    optionMaxYear,
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
    optionMinDay,
    optionMaxDay,
  ]);

  const hourOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime") return options;
    const step = $hour?._.step ?? 1;
    for (let i = optionMinHour; i <= optionMaxHour; i += step) {
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
    optionMinHour,
    optionMaxHour,
  ]);

  const minuteOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime") return options;
    const step = $minute?._.step ?? 1;
    for (let i = optionMinMinute; i <= optionMaxMinute; i += step) {
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
    optionMinMinute,
    optionMaxMinute,
  ]);

  const secondOptions = useMemo(() => {
    const options: Array<ReactNode> = [];
    if (type !== "datetime" || time !== "hms") return options;
    const step = $second?._.step ?? 1;
    for (let i = optionMinSecond; i <= optionMaxSecond; i += step) {
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
    optionMinSecond,
    optionMaxSecond,
  ]);

  useLayoutEffect(() => {
    setRequired(getRequired);
    setYearRequired(getYearRequired);
    setMonthRequired(getMonthRequired);
    setDayRequired(getDayRequired);
    setHourRequired(getHourRequired);
    setMinuteRequired(getMinuteRequired);
    setSecondRequired(getSecondRequired);
    if (!schema.isInitialize.current) {
      const updateResults: Parameters<typeof schema.setResults>[0] = [];
      function resetResult($: Schema.DataItem<Schema.$Any> | undefined, r: Schema.Result | null | undefined) {
        if (!$?.name) return;
        if (r !== schema.getResult($.name)) {
          updateResults.push({ name: $.name, result: r });
        }
      };
      resetResult($date, result);
      resetResult($year, yearResult);
      resetResult($month, monthResult);
      resetResult($day, dayResult);
      resetResult($hour, hourResult);
      resetResult($minute, minuteResult);
      resetResult($second, secondResult);
      schema.setResults(updateResults);
    }
    return () => {
      const updateResults: Parameters<typeof schema.setResults>[0] = [];
      function clearResult($: Schema.DataItem<Schema.$Any> | undefined) {
        if (!$?.name) return;
        updateResults.push({ name: $.name, result: undefined });
      }
      clearResult($date);
      clearResult($year);
      clearResult($month);
      clearResult($day);
      clearResult($hour);
      clearResult($minute);
      clearResult($second);
      schema.setResults(updateResults);
    };
  }, []);

  const state = useRef(getDefaultState());
  state.current.hidden = mode === "hidden";
  state.current.disabled = fs.disabled || mode === "disabled";
  state.current.readonly = fs.readOnly || mode === "readonly";
  state.current.enabled = !state.current.hidden
    && !state.current.disabled
    && !state.current.readonly;

  function mergeState(targetState: RefObject<Record<Schema.Mode, boolean>>, targetMode: Schema.Mode) {
    targetState.current.hidden = state.current.hidden || targetMode === "hidden";
    targetState.current.disabled = state.current.disabled || targetMode === "disabled";
    targetState.current.readonly = state.current.readonly || targetMode === "readonly";
    targetState.current.enabled = !targetState.current.hidden
      && !targetState.current.disabled
      && !targetState.current.readonly;
  };

  function handleChangeImpl($: Schema.DataItem<Schema.$Any> | undefined, v: string) {
    if (!$) return;
    const submission = schemaItemEffect($, schema, v);
    const dateValue = parseTypedValue({
      Y: yearValue,
      M: monthValue,
      D: dayValue,
      h: hourValue,
      m: minuteValue,
      s: secondValue,
    });
    const dateSubmission = schemaItemEffect($date, schema, dateValue);
    if ($date.name) {
      schema.setValuesAndResults([
        { name: $.name, value: submission.value, result: submission.result },
        { name: $date.name, value: dateSubmission.value, result: dateSubmission.result },
      ]);
    } else {
      schema.setValuesAndResults([
        { name: $.name, value: submission.value, result: submission.result },
      ]);
      setValue(dateSubmission.value);
      setResult(dateSubmission.result);
    }
  };

  function handleYearChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($year, e.target.value);
  };

  function handleMonthChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($month, e.target.value);
  };

  function handleDayChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($day, e.target.value);
  };

  function handleHourChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($hour, e.target.value);
  };

  function handleMinuteChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($minute, e.target.value);
  };

  function handleSecondChange(e: ChangeEvent<HTMLSelectElement>) {
    handleChangeImpl($second, e.target.value);
  };

  const dispayResult = selectBoxDisplayResult(
    schema.env.t,
    result,
    yearResult,
    monthResult,
    dayResult,
    hourResult,
    minuteResult,
    secondResult,
  );

  return (
    <InputGroup
      {...props}
      ref={ref}
      core={{
        state,
        result: dispayResult,
      }}
    >
      {$date.name &&
        <input
          type="hidden"
          name={$date.name}
          value={value ?? ""}
        />
      }
      <SplittedSelect
        mergeState={mergeState}
        coreResult={result}
        $={$year}
        mode={yearMode}
        required={yearRequired}
        value={yearValue}
        onChange={handleYearChange}
        result={yearResult}
        placeholder={placeholder?.[0]}
      >
        {yearOptions}
      </SplittedSelect>
      <SepSpan>/</SepSpan>
      <SplittedSelect
        mergeState={mergeState}
        coreResult={result}
        $={$month}
        mode={monthMode}
        required={monthRequired}
        value={monthValue}
        onChange={handleMonthChange}
        result={monthResult}
        placeholder={placeholder?.[1]}
      >
        {monthOptions}
      </SplittedSelect>
      {type !== "month" &&
        <>
          <SepSpan>/</SepSpan>
          <SplittedSelect
            mergeState={mergeState}
            coreResult={result}
            $={$day}
            mode={dayMode}
            required={dayRequired}
            value={dayValue}
            onChange={handleDayChange}
            result={dayResult}
            placeholder={placeholder?.[2]}
          >
            {dayOptions}
          </SplittedSelect>
        </>
      }
      {type === "datetime" &&
        <>
          <SepSpan>&nbsp;</SepSpan>
          <SplittedSelect
            mergeState={mergeState}
            coreResult={result}
            $={$hour}
            mode={hourMode}
            required={hourRequired}
            value={hourValue}
            onChange={handleHourChange}
            result={hourResult}
            placeholder={placeholder?.[3]}
          >
            {hourOptions}
          </SplittedSelect>
          <SepSpan>:</SepSpan>
          <SplittedSelect
            mergeState={mergeState}
            coreResult={result}
            $={$minute}
            mode={minuteMode}
            required={minuteRequired}
            value={minuteValue}
            onChange={handleMinuteChange}
            result={minuteResult}
            placeholder={placeholder?.[4]}
          >
            {minuteOptions}
          </SplittedSelect>
          {time === "hms" &&
            <>
              <SepSpan>:</SepSpan>
              <SplittedSelect
                mergeState={mergeState}
                coreResult={result}
                $={$second}
                mode={secondMode}
                required={secondRequired}
                value={secondValue}
                onChange={handleSecondChange}
                result={secondResult}
                placeholder={placeholder?.[5]}
              >
                {dayOptions}
              </SplittedSelect>
            </>
          }
        </>
      }
    </InputGroup>
  );
};

interface SplittedSelectProps {
  mergeState: (targetState: RefObject<Record<Schema.Mode, boolean>>, targetMode: Schema.Mode) => void;
  coreResult: Schema.Result | null | undefined;
  $: Schema.DataItem<Schema.$SplitDate> | undefined;
  mode: Schema.Mode;
  required: boolean;
  value: number | null | undefined;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  result: Schema.Result | null | undefined;
  placeholder: string | undefined;
  children: ReactNode;
};

function SplittedSelect({
  mergeState,
  coreResult,
  $,
  mode,
  required,
  value,
  onChange,
  result,
  placeholder,
  children,
}: SplittedSelectProps) {
  const state = useRef(getDefaultState());
  mergeState(state, mode);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!state.current.enabled || !$) return;
    onChange(e);
  };

  const isInvalid = result?.type === "e" || coreResult?.type === "e";

  return (
    <InputField
      core={{
        state,
        result,
      }}
      hideMessage
    >
      <select
        className="ipt-main ipt-select"
        name={$?.name}
        required={required}
        disabled={!state.current.enabled}
        aria-disabled={state.current.disabled}
        aria-readonly={state.current.readonly}
        defaultValue={value ?? ""}
        aria-label={$?.label}
        aria-invalid={isInvalid}
        aria-errormessage={result?.type === "e" ? result.message : undefined}
        onChange={handleChange}
      >
        <option
          value=""
          data-notext="true"
        >
          {ZERO_WIDTH_SPACE}
        </option>
        {children}
      </select>
      <Placeholder>{placeholder}</Placeholder>
      <div
        className={clsx(
          "ipt-btn",
          !state.current.enabled && "opacity-0"
        )}
      />
      {state.current.readonly && $?.name &&
        <input
          type="hidden"
          name={$?.name}
          value={value ?? ""}
        />
      }
    </InputField>
  )
};