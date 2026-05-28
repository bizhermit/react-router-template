import { getValue } from "$/shared/objects/data";
import { $Clock, $Date, $DateTime } from "$/shared/objects/timestamp";
import { getPickMessageGetter, getValidationArray, getValidationArrayAsArray, SchemaItem } from "./core";
import { $SplitDateSchema, type SplitDateProps } from "./split-date";

export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type DateTimePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "datetime" | "date" | "month";
};

type DateTimeValidations = {
  required: Schema.ValidationEntry<boolean, null | undefined>;
  minDateTime: Schema.ValidationEntry<$DateTime, $DateTime, { minDateTime: $DateTime; }>;
  maxDateTime: Schema.ValidationEntry<$DateTime, $DateTime, { maxDateTime: $DateTime; }>;
  minDate: Schema.ValidationEntry<$Date, $DateTime, { minDate: $Date; }>;
  maxDate: Schema.ValidationEntry<$Date, $DateTime, { maxDate: $Date; }>;
  minTime: Schema.ValidationEntry<$Clock, $DateTime, { minTime: $Clock; }>;
  maxTime: Schema.ValidationEntry<$Clock, $DateTime, { maxTime: $Clock; }>;
  pairs: Schema.ValidationEntry<
    DateTimePair | DateTimePair[],
    $DateTime,
    Omit<Required<DateTimePair>, "name"> & { pairName: string; pairDateTime: $DateTime; }
  >;
};

export type DateTimeSchemaMessage = Schema.ValidationMessages<
  DateTimeValidations,
  typeof SCHEMA_ITEM_TYPE_DATETIME
>;

export type DateTimeProps = Schema.SchemaItemAbstractProps
  & Schema.Validations<DateTimeValidations>
  & {
    parser?: Schema.Parser<$DateTime>;
    timeBasis?: "minute" | "hour" | "second";
    rules?: Schema.Rule<$DateTime>[];
    splits?: [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_DATETIME);

export function $datetime<const P extends DateTimeProps>(props: P = {} as P) {
  return new $DateTimeSchema(props);
};

export class $DateTimeSchema<const P extends DateTimeProps> extends SchemaItem<$DateTime> {

  constructor(protected props: P = {} as P) {
    super(props);
  }

  public getActionType(): Schema.ActionType {
    return this.props.actionType || "input";
  }

  public getRefs() {
    const refs = [...this.props.refs ?? []];
    const [pairs] = getValidationArrayAsArray(this.props.pairs);
    if (pairs == null || typeof pairs === "function") return refs;
    const ps = Array.isArray(pairs) ? pairs : [pairs];
    ps.forEach(p => {
      if (refs.some(r => r === p.name)) return;
      refs.push(p.name);
    });
    return refs;
  }

  public getTimeBasis() {
    return this.props.timeBasis || "minute";
  }

  public parse(
    value: unknown,
    params: Schema.ParseArgParams = this.getEmptyInjectParams()
  ): Schema.ParseResult<$DateTime> {
    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      return {
        value: parsed.value == null ? parsed.value : parsed.value.lock(),
        messages: { [params.name || ""]: parsed.messages },
      };
    }

    try {
      if (this.props.splits) {
        const y = getValue(params.values, params.name, this.props.splits[0]);
        const m = getValue(params.values, params.name, this.props.splits[1]);
        const d = getValue(params.values, params.name, this.props.splits[2]);
        const hour = getValue(params.values, params.name, this.props.splits[3]) ?? 0;
        const minute = getValue(params.values, params.name, this.props.splits[4]) ?? 0;
        const second = getValue(params.values, params.name, this.props.splits[5]) ?? 0;
        if (y != null && m != null && d != null) {
          const date = new $DateTime(`${y}-${m}-${d}T${hour}:${minute}:${second}`);
          return { value: date.lock() };
        }
        return { value: null };
      }

      if (value == null) return { value };
      if (value === "") return { value: null };
      const datetime = new $DateTime(value as string);
      switch (this.getTimeBasis()) {
        case "hour":
          datetime.setMinute(0, 0, 0);
          break;
        case "minute":
          datetime.setSecond(0, 0);
          break;
        default:
          datetime.setMillisecond(0);
          break;
      }
      return { value: datetime.lock() };
    } catch {
      return {
        value: null,
        messages: {
          [params.name || ""]: [
            pickMessage("parse", {
              label: this.getLabel(),
              actionType: this.getActionType(),
              name: params.name,
            }),
          ],
        },
      };
    }
  }

  public validate(
    value: Schema.Nullable<$DateTime>,
    params: Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): Schema.RecordMessages {
    if (this.validators == null) {
      this.validators = [];

      // required
      if (this.props.required != null) {
        const [required, getRequiredMessage] = getValidationArray(this.props.required);
        if (required) {
          const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

          if (typeof required === "function") {
            this.validators.push((p) => {
              if (!required(p)) return null;
              if (p.value == null) {
                return getMessage(p as Schema.ValidationResultArgParams);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) {
                return getMessage(p as Schema.ValidationResultArgParams);
              }
              return null;
            });
          }
        }
      }

      // minDateTime
      if (this.props.minDateTime) {
        const [minDateTime, getMinDateTimeMessage] = getValidationArray(this.props.minDateTime);
        if (minDateTime != null) {
          const getMessage = getMinDateTimeMessage ?? ((p) => pickMessage("minDateTime", p));

          if (typeof minDateTime === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = minDateTime(p);
              if (m == null) return null;
              if (p.value.isBefore(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDateTime: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isBefore(minDateTime)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDateTime: minDateTime.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // maxDateTime
      if (this.props.maxDateTime) {
        const [maxDateTime, getMaxDateTimeMessage] = getValidationArray(this.props.maxDateTime);
        if (maxDateTime != null) {
          const getMessage = getMaxDateTimeMessage ?? ((p) => pickMessage("maxDateTime", p));

          if (typeof maxDateTime === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = maxDateTime(p);
              if (m == null) return null;
              if (p.value.isAfter(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDateTime: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isAfter(maxDateTime)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDateTime: maxDateTime.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // minDate
      if (this.props.minDate) {
        const [minDate, getMinDateMessage] = getValidationArray(this.props.minDate);
        if (minDate != null) {
          const getMessage = getMinDateMessage ?? ((p) => pickMessage("minDate", p));

          if (typeof minDate === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = minDate(p);
              if (m == null) return null;
              if (p.value.isBeforeDate(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDate: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isBeforeDate(minDate)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDate: minDate.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // maxDate
      if (this.props.maxDate) {
        const [maxDate, getMaxDateMessage] = getValidationArray(this.props.maxDate);
        if (maxDate != null) {
          const getMessage = getMaxDateMessage ?? ((p) => pickMessage("maxDate", p));

          if (typeof maxDate === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = maxDate(p);
              if (m == null) return null;
              if (p.value.isAfterDate(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDate: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isAfterDate(maxDate)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDate: maxDate.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // minTime
      if (this.props.minTime) {
        const [minTime, getMinTimeMessage] = getValidationArray(this.props.minTime);
        if (minTime != null) {
          const getMessage = getMinTimeMessage ?? ((p) => pickMessage("minTime", p));

          if (typeof minTime === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = minTime(p);
              if (m == null) return null;
              if (p.value.isBeforeTime(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minTime: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isBeforeTime(minTime)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minTime: minTime.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // maxTime
      if (this.props.maxTime) {
        const [maxTime, getMaxTimeMessage] = getValidationArray(this.props.maxTime);
        if (maxTime != null) {
          const getMessage = getMaxTimeMessage ?? ((p) => pickMessage("maxTime", p));

          if (typeof maxTime === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = maxTime(p);
              if (m == null) return null;
              if (p.value.isAfterTime(m)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxTime: m.toJSON(),
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isAfterTime(maxTime)) {
                return getMessage({
                  ...p as Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxTime: maxTime.toJSON(),
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // pair
      if (this.props.pairs) {
        const [pairs, getPairsMessage] = getValidationArrayAsArray(this.props.pairs);
        if (pairs) {
          const getMessage = getPairsMessage ?? ((p) => pickMessage("pairs", p));

          if (typeof pairs === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              let ps = pairs(p);
              if (ps == null) return null;
              if (!Array.isArray(ps)) ps = [ps];
              if (ps == null || ps.length === 0) return null;
              for (const pair of ps) {
                const pairValue = getValue(p.values, p.name, pair.name)[0];
                if (!pairValue) continue;
                try {
                  const pairDateTime = new $DateTime(pairValue as string);
                  if (!pair.disallowSame && p.value.isEqual(pairDateTime)) continue;
                  if (pair.position === "after") {
                    if (p.value.isBefore(pairDateTime)) continue;
                  } else {
                    if (p.value.isAfter(pairDateTime)) continue;
                  }
                  return getMessage({
                    ...p as Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime: pairDateTime.toJSON(),
                      basis: pair.basis || "datetime",
                    },
                  });
                } catch {
                  // ignore
                  continue;
                }
              }
              return null;
            });
          } else {
            const ps = Array.isArray(pairs) ? pairs : [pairs];
            this.validators.push((p) => {
              if (p.value == null) return null;
              for (const pair of ps) {
                const pairValue = getValue(p.values, p.name, pair.name)[0];
                if (!pairValue) continue;
                try {
                  const pairDateTime = new $DateTime(pairValue as string);
                  if (!pair.disallowSame && p.value.isEqual(pairDateTime)) continue;
                  if (pair.position === "after") {
                    if (p.value.isBefore(pairDateTime)) continue;
                  } else {
                    if (p.value.isAfter(pairDateTime)) continue;
                  }
                  return getMessage({
                    ...p as Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime: pairDateTime.toJSON(),
                      basis: pair.basis || "datetime",
                    },
                  });
                } catch {
                  // ignore
                  continue;
                }
              }
              return null;
            });
          }
        }
      }

      // rules
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    return super.validate(value, params);
  }

  public getSplitYear<const SP extends Omit<SplitDateProps, "step">>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minDateTime] = getValidationArray(this.props.minDateTime);
    const [maxDateTime] = getValidationArray(this.props.maxDateTime);
    const [minDate] = getValidationArray(this.props.minDate);
    const [maxDate] = getValidationArray(this.props.maxDate);

    const getMinDateTime = (p: Schema.InjectParams) => {
      if (minDateTime == null) return null;
      if (typeof minDateTime === "function") {
        return minDateTime(p);
      }
      return minDateTime;
    };
    const getMaxDateTime = (p: Schema.InjectParams) => {
      if (maxDateTime == null) return null;
      if (typeof maxDateTime === "function") {
        return maxDateTime(p);
      }
      return maxDateTime;
    };
    const getMinDate = (p: Schema.InjectParams) => {
      if (minDate == null) return null;
      if (typeof minDate === "function") {
        return minDate(p);
      }
      return minDate;
    };
    const getMaxDate = (p: Schema.InjectParams) => {
      if (maxDate == null) return null;
      if (typeof maxDate === "function") {
        return maxDate(p);
      }
      return null;
    };

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "year",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: (p) => {
          let min = getMinDateTime(p)?.getYear();
          const d = getMinDate(p);
          if (min == null) min = d?.getYear();
          else if (d) min = Math.max(min, d.getYear());
          return min;
        },
        max: (p) => {
          let max = getMaxDateTime(p)?.getYear();
          const d = getMaxDate(p);
          if (max == null) max = d?.getYear();
          else if (d) max = Math.min(max, d.getYear());
          return max;
        },
      },
    );
  }

  public getSplitMonth<const SP extends Omit<SplitDateProps, "step">>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "month",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: () => 1, // NOTE: 最小値および年の値によって変動するため、最小日付と比較を行わない
        max: () => 12, // NOTE: 最大値および年の値によって変動するため、最大日付と比較を行わない
      },
    );
  }

  public getSplitDay<const SP extends Omit<SplitDateProps, "step">>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "day",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: () => 1, // NOTE: 最小値および年月の値によって変動するため、最小日付と比較を行わない
        max: () => 31, // NOTE: 最大値および年月の値によって変動するため、最大日付と比較を行わない
      },
    );
  }

  public getSplitHour<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minTime] = getValidationArray(this.props.minTime);
    const [maxTime] = getValidationArray(this.props.maxTime);

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "hour",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: (p) => {
          if (typeof minTime === "function") {
            return minTime(p)?.getHour();
          }
          return minTime?.getHour();
        },
        max: (p) => {
          if (typeof maxTime === "function") {
            return maxTime(p)?.getHour();
          }
          return maxTime?.getHour();
        },
      },
    );
  }

  public getSplitMinute<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "minute",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: () => 0,
        max: () => 59,
      },
    );
  }

  public getSplitSecond<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<$DateTimeSchema<P>, SP>(
      this,
      splitProps,
      "second",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: () => 0,
        max: () => 59,
      },
    );
  }

  public overwrite<const OP extends DateTimeProps>(props: OP) {
    return new $DateTimeSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

  public getRequired(params: Schema.InjectParams) {
    const required = getValidationArray(this.props.required)[0];
    if (typeof required === "function") {
      return required(params) ?? false;
    }
    return required ?? false;
  }

  public getMinMonth() {
    return undefined;
  }

  public getMaxMonth() {
    return undefined;
  }

  public getMinDate(params: Schema.InjectParams) {
    const minDate = getValidationArray(this.props.minDate)[0];
    if (typeof minDate === "function") {
      return minDate(params);
    }
    return minDate;
  }

  public getMaxDate(params: Schema.InjectParams) {
    const maxDate = getValidationArray(this.props.maxDate)[0];
    if (typeof maxDate === "function") {
      return maxDate(params);
    }
    return maxDate;
  }

  public getMinTime(params: Schema.InjectParams) {
    const minTime = getValidationArray(this.props.minTime)[0];
    if (typeof minTime === "function") {
      return minTime(params);
    }
    return minTime;
  }

  public getMaxTime(params: Schema.InjectParams) {
    const maxTime = getValidationArray(this.props.maxTime)[0];
    if (typeof maxTime === "function") {
      return maxTime(params);
    }
    return maxTime;
  }

  public getMinDateTime(params: Schema.InjectParams) {
    const minDateTime = getValidationArray(this.props.minDateTime)[0];
    if (typeof minDateTime === "function") {
      return minDateTime(params);
    }
    return minDateTime;
  }

  public getMaxDateTime(params: Schema.InjectParams) {
    const maxDateTime = getValidationArray(this.props.maxDateTime)[0];
    if (typeof maxDateTime === "function") {
      return maxDateTime(params);
    }
    return maxDateTime;
  }

}
