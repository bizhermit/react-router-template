import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Clock, $Date, $DateTime } from "$/shared/objects/timestamp";
import { getPickMessageGetter, getValidationArray, getValidationArrayAsArray } from ".";
import { SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type DateTimePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "datetime" | "date" | "month";
};

type DateTimeValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  minDateTime: $Schema.ValidationEntry<$DateTime, $DateTime, { minDateTime: $DateTime; }>;
  maxDateTime: $Schema.ValidationEntry<$DateTime, $DateTime, { maxDateTime: $DateTime; }>;
  minDate: $Schema.ValidationEntry<$Date, $DateTime, { minDate: $Date; }>;
  maxDate: $Schema.ValidationEntry<$Date, $DateTime, { maxDate: $Date; }>;
  minTime: $Schema.ValidationEntry<$Clock, $DateTime, { minTime: $Clock; }>;
  maxTime: $Schema.ValidationEntry<$Clock, $DateTime, { maxTime: $Clock; }>;
  pairs: $Schema.ValidationEntry<
    DateTimePair | DateTimePair[],
    $DateTime,
    Omit<Required<DateTimePair>, "name"> & { pairName: string; pairDateTime: $DateTime; }
  >;
};

export type DateTimeSchemaMessage = $Schema.ValidationMessages<
  DateTimeValidations,
  typeof SCHEMA_ITEM_TYPE_DATETIME
>;

type DateTimeProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<DateTimeValidations>
  & {
    parser?: $Schema.Parser<$DateTime>;
    timeBasis?: "minute" | "hour" | "second";
    rules?: $Schema.Rule<$DateTime>[];
  };

export type SplitDateTimePart = "Y" | "M" | "D" | "h" | "m" | "s";

type SplitDateTimeValidations = {
  required: $Schema.ValidationEntry<boolean | "inherit", null | undefined>;
  min: $Schema.ValidationEntry<number | "inherit", number, { min: number; }>;
  max: $Schema.ValidationEntry<number | "inherit", number, { max: number; }>;
};

export type SplitDateTimeSchemaMessage = $Schema.ValidationMessages<
  SplitDateTimeValidations,
  `${typeof SCHEMA_ITEM_TYPE_DATETIME}-${SplitDateTimePart}`
>;

type SplitDateTimeProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<SplitDateTimeValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_DATETIME);

export class $SplitDateTimeSchema<
  const Base extends DateTimeProps,
  const SP extends SplitDateTimeProps
> extends SchemaItem<number> {

  protected pickMessage: ReturnType<typeof getPickMessageGetter<`${typeof SCHEMA_ITEM_TYPE_DATETIME}-${SplitDateTimePart}`>>;

  constructor(
    protected base: $DateTimeSchema<Base>,
    protected props: SP,
    protected key: SplitDateTimePart,
    protected validations: {
      isValidRequired: (params: $Schema.RuleArgParams<number>) => boolean;
      isValidMin: (params: $Schema.RuleArgParams<number>) => [boolean, number];
      isValidMax: (params: $Schema.RuleArgParams<number>) => [boolean, number];
    },
  ) {
    super();
    this.pickMessage = getPickMessageGetter(`${SCHEMA_ITEM_TYPE_DATETIME}-${key}`);
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || this.base.getActionType();
  }

  public getLabel(): string | undefined {
    return this.props.label;
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<number> {
    if (this.props.parser) return this.props.parser(value, params);
    const [num, succeeded] = parseNumber(value);
    if (succeeded) return { value: num };
    return {
      value: num,
      messages: [
        pickMessage("parse", {
          label: this.getLabel(),
          actionType: this.getActionType(),
          name: params.name,
        }),
      ],
    };
  }

  public validate(
    value: $Schema.Nullable<number>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.Message[] {
    if (this.validators == null) {
      this.validators = [];

      // required
      const [required, getRequiredMessage] = getValidationArray(this.props.required, "inherit");
      if (required) {
        const getMessage = getRequiredMessage ?? ((p) => this.pickMessage("required", p));

        if (typeof required === "function") {
          this.validators.push((p) => {
            const r = required(p);
            if (!r) return null;
            if (r === "inherit") {
              const isValid = this.validations.isValidRequired(p);
              if (isValid) return null;
              return getMessage(p as $Schema.ValidationResultArgParams);
            }
            if (p.value == null) {
              return getMessage(p as $Schema.ValidationResultArgParams);
            }
            return null;
          });
        } else {
          if (required === "inherit") {
            this.validators.push((p) => {
              const isValid = this.validations.isValidRequired(p);
              if (isValid) return null;
              return getMessage(p as $Schema.ValidationResultArgParams);
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) {
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          }
        }
      }

      // min
      const [min, getMinMessage] = getValidationArray(this.props.min, "inherit");
      if (min != null) {
        const getMessage = getMinMessage ?? ((p) => this.pickMessage("min", p));

        if (typeof min === "function") {
          this.validators.push((p) => {
            if (p.value == null) return null;
            const m = min(p);
            if (m == null) return null;
            if (m === "inherit") {
              const [isValid, baseMin] = this.validations.isValidMin(p);
              if (isValid) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  min: baseMin,
                },
              });
            }
            if (m <= p.value) return null;
            return getMessage({
              ...p as $Schema.ValidationResultArgParams<number>,
              params: {
                min: m,
              },
            });
          });
        } else {
          if (min === "inherit") {
            this.validators.push((p) => {
              const [isValid, baseMin] = this.validations.isValidMin(p);
              if (isValid) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  min: baseMin,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (min <= p.value) return null;
              return getMessage({
                ...p as $Schema.ValidationResultArgParams<number>,
                params: {
                  min,
                },
              });
            });
          }
        }
      }

      // max
      const [max, getMaxMessage] = getValidationArray(this.props.max, "inherit");
      if (max != null) {
        const getMessage = getMaxMessage ?? ((p) => this.pickMessage("max", p));

        if (typeof max === "function") {
          this.validators.push((p) => {
            if (p.value == null) return null;
            const m = max(p);
            if (m == null) return null;
            if (m === "inherit") {
              const [isValid, baseMax] = this.validations.isValidMax(p);
              if (isValid) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  max: baseMax,
                },
              });
            }
            if (p.value <= m) return null;
            return getMessage({
              ...p as $Schema.ValidationResultArgParams<number>,
              params: {
                max: m,
              },
            });
          });
        } else {
          if (max === "inherit") {
            this.validators.push((p) => {
              const [isValid, baseMax] = this.validations.isValidMax(p);
              if (isValid) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  max: baseMax,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value <= max) return null;
              return getMessage({
                ...p as $Schema.ValidationResultArgParams<number>,
                params: {
                  max,
                },
              });
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

}

export function $datetime<const P extends DateTimeProps>(props: P = {} as P) {
  return new $DateTimeSchema(props);
};

export class $DateTimeSchema<const P extends DateTimeProps> extends SchemaItem<$DateTime> {

  constructor(protected props: P = {} as P) {
    super();
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "input";
  }

  public getLabel(): string | undefined {
    return this.props.label;
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<$DateTime> {
    if (this.props.parser) return this.props.parser(value, params);
    if (value == null || value === "") return { value: undefined };
    try {
      const datetime = new $DateTime(value as string);
      return { value: datetime };
    } catch {
      return {
        value: null,
        messages: [
          pickMessage("parse", {
            label: this.getLabel(),
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      };
    }
  }

  public validate(
    value: $Schema.Nullable<$DateTime>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.Message[] {
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
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) {
                return getMessage(p as $Schema.ValidationResultArgParams);
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDateTime: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDateTime,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDateTime: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDateTime,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDate: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minDate,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDate: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxDate,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minTime: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    minTime,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxTime: m,
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
                  ...p as $Schema.ValidationResultArgParams<$DateTime>,
                  params: {
                    maxTime,
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
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime,
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
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime,
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

  public getSplitYear<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minDateTime] = getValidationArray(this.props.minDateTime);
    const [maxDateTime] = getValidationArray(this.props.maxDateTime);
    const [minDate] = getValidationArray(this.props.minDate);
    const [maxDate] = getValidationArray(this.props.maxDate);

    const getMinDateTime = (p: $Schema.RuleArgParams<number>) => {
      if (minDateTime == null) return null;
      if (typeof minDateTime === "function") {
        return minDateTime(p);
      }
      return minDateTime;
    };
    const getMaxDateTime = (p: $Schema.RuleArgParams<number>) => {
      if (maxDateTime == null) return null;
      if (typeof maxDateTime === "function") {
        return maxDateTime(p);
      }
      return maxDateTime;
    };
    const getMinDate = (p: $Schema.RuleArgParams<number>) => {
      if (minDate == null) return null;
      if (typeof minDate === "function") {
        return minDate(p);
      }
      return minDate;
    };
    const getMaxDate = (p: $Schema.RuleArgParams<number>) => {
      if (maxDate == null) return null;
      if (typeof maxDate === "function") {
        return maxDate(p);
      }
      return null;
    };

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "Y",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: (p) => {
          if (p.value == null) return [true, -1];
          let min = getMinDateTime(p)?.getYear();
          const d = getMinDate(p);
          if (min == null) min = d?.getYear();
          else if (d) min = Math.max(min, d.getYear());
          if (min == null) return [true, -1];
          return [min <= p.value, min];
        },
        isValidMax: (p) => {
          if (p.value == null) return [true, -1];
          let max = getMaxDateTime(p)?.getYear();
          const d = getMaxDate(p);
          if (max == null) max = d?.getYear();
          else if (d) max = Math.min(max, d.getYear());
          if (max == null) return [true, -1];
          return [p.value <= max, max];
        },
      },
    );
  }

  public getSplitMonth<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "M",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: (p) => {
          if (p.value == null) return [true, -1];
          // NOTE: 最小値および年の値によって変動するため、最小日付と比較を行わない
          return [1 <= p.value, 1];
        },
        isValidMax: (p) => {
          if (p.value == null) return [true, -1];
          // NOTE: 最大値および年の値によって変動するため、最大日付と比較を行わない
          return [p.value <= 12, 12];
        },
      },
    );
  }

  public getSplitDay<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "D",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: (p) => {
          if (p.value == null) return [true, -1];
          // NOTE: 最小値および年月の値によって変動するため、最小日付と比較を行わない
          return [1 <= p.value, 1];
        },
        isValidMax: (p) => {
          if (p.value == null) return [true, -1];
          // NOTE: 最大値および年月の値によって変動するため、最大日付と比較を行わない
          return [p.value <= 31, 31];
        },
      },
    );
  }

  public getSplitHour<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minTime] = getValidationArray(this.props.minTime);
    const [maxTime] = getValidationArray(this.props.maxTime);

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "m",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: !minTime ?
          () => [true, -1] :
          typeof minTime === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = minTime(p);
              if (m == null) return [true, -1];
              const h = m.getHour();
              return [h <= p.value, h];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const h = minTime.getHour();
              return [h <= p.value, h];
            },
        isValidMax: !maxTime ?
          () => [true, -1] :
          typeof maxTime === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = maxTime(p);
              if (m == null) return [true, -1];
              const h = m.getHour();
              return [p.value <= h, h];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const h = maxTime.getHour();
              return [p.value <= h, h];
            },
      },
    );
  }

  public getSplitMinute<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "m",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: (p) => {
          if (p.value == null) return [true, -1];
          return [0 <= p.value, 0];
        },
        isValidMax: (p) => {
          if (p.value == null) return [true, -1];
          return [p.value <= 59, 59];
        },
      },
    );
  }

  public getSplitSecond<const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateTimeSchema<P, SP>(
      this,
      splitProps,
      "s",
      {
        isValidRequired: !required ?
          () => true :
          typeof required === "function" ?
            (p) => {
              const req = required(p);
              if (!req) return true;
              return p.value != null;
            } :
            (p) => p.value != null,
        isValidMin: (p) => {
          if (p.value == null) return [true, -1];
          return [0 <= p.value, 0];
        },
        isValidMax: (p) => {
          if (p.value == null) return [true, -1];
          return [p.value <= 59, 59];
        },
      },
    );
  }

  public overwrite<const OP extends DateTimeProps>(props: OP) {
    return new $DateTimeSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

}
