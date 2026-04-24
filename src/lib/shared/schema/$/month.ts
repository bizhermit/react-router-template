import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Month } from "$/shared/objects/timestamp";
import { getPickMessageGetter, getValidationArray, getValidationArrayAsArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthPair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
};

type MonthValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  minMonth: $Schema.ValidationEntry<$Month, $Month, { minMonth: $Month; }>;
  maxMonth: $Schema.ValidationEntry<$Month, $Month, { maxMonth: $Month; }>;
  pairs: $Schema.ValidationEntry<
    MonthPair | MonthPair[],
    $Month,
    Omit<Required<MonthPair>, "name"> & { pairName: string; pairMonth: $Month; }
  >;
};

export type MonthSchemaMessage = $Schema.ValidationMessages<
  MonthValidations,
  typeof SCHEMA_ITEM_TYPE_MONTH
>;

type MonthProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<MonthValidations>
  & {
    parser?: $Schema.Parser<$Month>;
    rules?: $Schema.Rule<$Month>[];
  };

export type MonthValidationMessage = MonthSchemaMessage;

export type SplitMonthPart = "Y" | "M";

type SplitMonthValidations = {
  required: $Schema.ValidationEntry<boolean | "inherit", null | undefined>;
  min: $Schema.ValidationEntry<number | "inherit", number, { min: number; }>;
  max: $Schema.ValidationEntry<number | "inherit", number, { max: number; }>;
};

export type SplitMonthSchemaMessage = $Schema.ValidationMessages<
  SplitMonthValidations,
  `${typeof SCHEMA_ITEM_TYPE_MONTH}-${SplitMonthPart}`
>;

type SplitMonthProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<SplitMonthValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_MONTH);

export class $SplitMonthSchema<
  const Base extends MonthProps,
  const SP extends SplitMonthProps
> extends SchemaItem<number> {

  protected pickMessage: ReturnType<typeof getPickMessageGetter<`${typeof SCHEMA_ITEM_TYPE_MONTH}-${SplitMonthPart}`>>;

  constructor(
    protected base: $MonthSchema<Base>,
    protected props: SP,
    protected key: SplitMonthPart,
    protected validations: {
      isValidRequired: (params: $Schema.RuleArgParams<number>) => boolean;
      isValidMin: (params: $Schema.RuleArgParams<number>) => [boolean, number];
      isValidMax: (params: $Schema.RuleArgParams<number>) => [boolean, number];
    },
  ) {
    super();
    this.pickMessage = getPickMessageGetter(`${SCHEMA_ITEM_TYPE_MONTH}-${key}`);
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

export function $month<const P extends MonthProps>(props: P = {} as P) {
  return new $MonthSchema<P>(props);
};

export class $MonthSchema<const P extends MonthProps> extends SchemaItem<$Month> {

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
  ): $Schema.ParseResult<$Month> {
    if (this.props.parser) return this.props.parser(value, params);
    if (value == null || value === "") return { value: undefined };
    try {
      const month = new $Month(value as string);
      return { value: month };
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
    value: $Schema.Nullable<$Month>,
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

      // minMonth
      if (this.props.minMonth) {
        const [minMonth, getMinMonthMessage] = getValidationArray(this.props.minMonth);
        if (minMonth != null) {
          const getMessage = getMinMonthMessage ?? ((p) => pickMessage("minMonth", p));

          if (typeof minMonth === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = minMonth(p);
              if (m == null) return null;
              if (p.value.isBefore(m)) {
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<$Month>,
                  params: {
                    minMonth: m,
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isBefore(minMonth)) {
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<$Month>,
                  params: {
                    minMonth,
                  },
                });
              }
              return null;
            });
          }
        }
      }

      // maxMonth
      if (this.props.maxMonth) {
        const [maxMonth, getMaxMonthMessage] = getValidationArray(this.props.maxMonth);
        if (maxMonth != null) {
          const getMessage = getMaxMonthMessage ?? ((p) => pickMessage("maxMonth", p));

          if (typeof maxMonth === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = maxMonth(p);
              if (m == null) return null;
              if (p.value.isAfter(m)) {
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<$Month>,
                  params: {
                    maxMonth: m,
                  },
                });
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              if (p.value.isAfter(maxMonth)) {
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<$Month>,
                  params: {
                    maxMonth,
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
                  const pairMonth = new $Month(pairValue as string);
                  if (!pair.disallowSame && p.value.isEqual(pairMonth)) continue;
                  if (pair.position === "after") {
                    if (p.value.isBefore(pairMonth)) continue;
                  } else {
                    if (p.value.isAfter(pairMonth)) continue;
                  }
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$Month>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth,
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
                  const pairMonth = new $Month(pairValue as string);
                  if (!pair.disallowSame && p.value.isEqual(pairMonth)) continue;
                  if (pair.position === "after") {
                    if (p.value.isBefore(pairMonth)) continue;
                  } else {
                    if (p.value.isAfter(pairMonth)) continue;
                  }
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$Month>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth,
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

  public getSplitYear<const SP extends SplitMonthProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);
    const [minMonth] = getValidationArray(this.props.minMonth);
    const [maxMonth] = getValidationArray(this.props.maxMonth);

    return new $SplitMonthSchema<P, SP>(
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
        isValidMin: !minMonth ?
          () => [true, -1] :
          typeof minMonth === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = minMonth(p);
              if (m == null) return [true, -1];
              const y = m.getYear();
              return [y <= p.value, y];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const y = minMonth.getYear();
              return [y <= p.value, y];
            },
        isValidMax: !maxMonth ?
          () => [true, -1] :
          typeof maxMonth === "function" ?
            (p) => {
              if (p.value == null) return [true, -1];
              const m = maxMonth(p);
              if (m == null) return [true, -1];
              const y = m.getYear();
              return [p.value <= y, y];
            } :
            (p) => {
              if (p.value == null) return [true, -1];
              const y = maxMonth.getYear();
              return [p.value <= y, y];
            },
      },
    );
  }

  public getSplitMonth<const SP extends SplitMonthProps>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitMonthSchema<P, SP>(
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

  public overwrite<const OP extends MonthProps>(props: OP) {
    return new $MonthSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

};
