import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Date } from "$/shared/objects/timestamp";
import { getPickMessageGetter, getValidationArray, getValidationArrayAsArray } from ".";
import { SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_DATE = "date";

type DatePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "date" | "month";
};

type DateValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  minDate: $Schema.ValidationEntry<$Date, $Date, { minDate: $Date; }>;
  maxDate: $Schema.ValidationEntry<$Date, $Date, { maxDate: $Date; }>;
  pairs: $Schema.ValidationEntry<
    DatePair | DatePair[],
    $Date,
    Omit<Required<DatePair>, "name"> & { pairName: string; pairDate: $Date; }
  >;
};

export type DateSchemaMessage = $Schema.ValidationMessages<
  DateValidations,
  typeof SCHEMA_ITEM_TYPE_DATE
>;

type DateProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<DateValidations>
  & {
    parser?: $Schema.Parser<$Date>;
    rules?: $Schema.Rule<$Date>[];
  };

export type SplitDatePart = "Y" | "M" | "D";

type SplitDateValidations = {
  required: $Schema.ValidationEntry<boolean | "inherit", null | undefined>;
  min: $Schema.ValidationEntry<number | "inherit", number, { min: number; }>;
  max: $Schema.ValidationEntry<number | "inherit", number, { max: number; }>;
};

export type SplitDateSchemaMessage = $Schema.ValidationMessages<
  SplitDateValidations,
  `${typeof SCHEMA_ITEM_TYPE_DATE}-${SplitDatePart}`
>;

type SplitDateProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<SplitDateValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_DATE);

export class $SplitDateSchema<
  const Base extends DateProps,
  const SP extends SplitDateProps
> extends SchemaItem<number> {

  protected pickMessage: ReturnType<typeof getPickMessageGetter<`${typeof SCHEMA_ITEM_TYPE_DATE}-${SplitDatePart}`>>;

  constructor(
    protected base: $DateSchema<Base>,
    protected props: SP,
    protected key: SplitDatePart,
    protected validations: {
      isValidRequired: (params: $Schema.RuleArgParams<number>) => boolean;
      isValidMin: (params: $Schema.RuleArgParams<number>) => [boolean, number];
      isValidMax: (params: $Schema.RuleArgParams<number>) => [boolean, number];
    },
  ) {
    super();
    this.pickMessage = getPickMessageGetter(`${SCHEMA_ITEM_TYPE_DATE}-${key}`);
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
        this.pickMessage("parse", {
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
              ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                ...p as $Schema.RuleArgParamsAsValidation<number>,
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
              ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                ...p as $Schema.RuleArgParamsAsValidation<number>,
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

export function $date<const P extends DateProps>(props: P = {} as P) {
  return new $DateSchema(props);
};

export class $DateSchema<const P extends DateProps> extends SchemaItem<$Date> {

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
  ): $Schema.ParseResult<$Date> {
    if (this.props.parser) return this.props.parser(value, params);
    if (value == null || value === "") return { value: undefined };
    try {
      const date = new $Date(value as string);
      return { value: date };
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
    value: $Schema.Nullable<$Date>,
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
              if (p.value.isBefore(m)) {
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
              if (p.value.isBefore(minDate)) {
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
              if (p.value.isAfter(m)) {
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
              if (p.value.isAfter(maxDate)) {
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
                  const pairDate = new $Date(pairValue as string);
                  if (pair.basis === "month") {
                    if (!pair.disallowSame && p.value.isEqualYearMonth(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBeforeYearMonth(pairDate)) continue;
                    } else {
                      if (p.value.isAfterYearMonth(pairDate)) continue;
                    }
                  } else {
                    if (!pair.disallowSame && p.value.isEqual(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDate)) continue;
                    } else {
                      if (p.value.isAfter(pairDate)) continue;
                    }
                  }
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDate,
                      basis: pair.basis || "date",
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
                  const pairDate = new $Date(pairValue as string);

                  if (pair.basis === "month") {
                    if (!pair.disallowSame && p.value.isEqualYearMonth(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBeforeYearMonth(pairDate)) continue;
                    } else {
                      if (p.value.isAfterYearMonth(pairDate)) continue;
                    }
                  } else {
                    if (!pair.disallowSame && p.value.isEqual(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDate)) continue;
                    } else {
                      if (p.value.isAfter(pairDate)) continue;
                    }
                  }
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDate,
                      basis: pair.basis || "date",
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

  public getSplitYear<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minDate] = getValidationArray(this.props.minDate);
    const [maxDate] = getValidationArray(this.props.maxDate);

    return new $SplitDateSchema<P, SP>(
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
        isValidMin: !minDate ?
          () => [true, -1] :
          typeof minDate === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = minDate(p);
              if (m == null) return [true, -1];
              const y = m.getYear();
              return [y <= p.value, y];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const y = minDate.getYear();
              return [y <= p.value, y];
            },
        isValidMax: !maxDate ?
          () => [true, -1] :
          typeof maxDate === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = maxDate(p);
              if (m == null) return [true, -1];
              const y = m.getYear();
              return [p.value <= y, y];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const y = maxDate.getYear();
              return [p.value <= y, y];
            },
      },
    );
  }

  public getSplitMonth<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<P, SP>(
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

  public getSplitDay<const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<P, SP>(
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

  public overwrite<const OP extends DateProps>(props: OP) {
    return new $DateSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

}
