import { getValue } from "$/shared/objects/data";
import { $Month } from "$/shared/objects/timestamp";
import { getPickMessageGetter, getValidationArray, getValidationArrayAsArray, SchemaItem } from "./core";
import { $SplitDateSchema, type SplitDateProps } from "./split-date";

export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthPair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
};

type MonthValidations = {
  required: Schema.ValidationEntry<boolean, null | undefined>;
  minMonth: Schema.ValidationEntry<$Month, $Month, { minMonth: $Month; }>;
  maxMonth: Schema.ValidationEntry<$Month, $Month, { maxMonth: $Month; }>;
  pairs: Schema.ValidationEntry<
    MonthPair | MonthPair[],
    $Month,
    Omit<Required<MonthPair>, "name"> & { pairName: string; pairMonth: $Month; }
  >;
};

export type MonthSchemaMessage = Schema.ValidationMessages<
  MonthValidations,
  typeof SCHEMA_ITEM_TYPE_MONTH
>;

export type MonthProps = Schema.SchemaItemAbstractProps
  & Schema.Validations<MonthValidations>
  & {
    parser?: Schema.Parser<$Month>;
    rules?: Schema.Rule<$Month>[];
    splits?: [string, string];
  };

export type MonthValidationMessage = MonthSchemaMessage;

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_MONTH);

export function $month<const P extends MonthProps>(props: P = {} as P) {
  return new $MonthSchema<P>(props);
};

export class $MonthSchema<const P extends MonthProps> extends SchemaItem<$Month> {

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
    refs.push(...ps.map(p => p.name));
    return refs;
  }

  public parse(
    value: unknown,
    params: Schema.ParseArgParams = this.getEmptyInjectParams()
  ): Schema.ParseResult<$Month> {
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
        if (y != null && m != null) {
          const date = new $Month(`${y}-${m}`);
          return { value: date.lock() };
        }
        return { value: null };
      }

      if (value == null) return { value };
      if (value === "") return { value: null };
      const month = new $Month(value as string);
      return { value: month.lock() };
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
    value: Schema.Nullable<$Month>,
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
                  ...p as Schema.ValidationResultArgParams<$Month>,
                  params: {
                    minMonth: m.toJSON(),
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
                  ...p as Schema.ValidationResultArgParams<$Month>,
                  params: {
                    minMonth: minMonth.toJSON(),
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
                  ...p as Schema.ValidationResultArgParams<$Month>,
                  params: {
                    maxMonth: m.toJSON(),
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
                  ...p as Schema.ValidationResultArgParams<$Month>,
                  params: {
                    maxMonth: maxMonth.toJSON(),
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
                    ...p as Schema.ValidationResultArgParams<$Month>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth: pairMonth.toJSON(),
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
                    ...p as Schema.ValidationResultArgParams<$Month>,
                    params: {
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth: pairMonth.toJSON(),
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
    const [minMonth] = getValidationArray(this.props.minMonth);
    const [maxMonth] = getValidationArray(this.props.maxMonth);

    return new $SplitDateSchema<$MonthSchema<P>, SP>(
      this,
      splitProps,
      "year",
      {
        required: typeof required === "function" ?
          (p: Schema.InjectParams) => required(p) :
          () => required,
        min: typeof minMonth === "function" ?
          (p) => minMonth(p)?.getYear() :
          () => minMonth?.getYear(),
        max: typeof maxMonth === "function" ?
          (p) => maxMonth(p)?.getYear() :
          () => maxMonth?.getYear(),
      },
    );
  }

  public getSplitMonth<const SP extends Omit<SplitDateProps, "step">>(splitProps: SP = {} as SP) {
    const [required] = getValidationArray(this.props.required);

    return new $SplitDateSchema<$MonthSchema<P>, SP>(
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

  public overwrite<const OP extends MonthProps>(props: OP) {
    return new $MonthSchema<Omit<P, keyof OP> & OP>({
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

  public getMinMonth(params: Schema.InjectParams) {
    const minMonth = getValidationArray(this.props.minMonth)[0];
    if (typeof minMonth === "function") {
      return minMonth(params);
    }
    return minMonth;
  }

  public getMaxMonth(params: Schema.InjectParams) {
    const maxMonth = getValidationArray(this.props.maxMonth)[0];
    if (typeof maxMonth === "function") {
      return maxMonth(params);
    }
    return maxMonth;
  }

  public getMinDate() {
    return undefined;
  }

  public getMaxDate() {
    return undefined;
  }

  public getMinTime() {
    return undefined;
  }

  public getMaxTime() {
    return undefined;
  }

  public getMinDateTime() {
    return undefined;
  }

  public getMaxDateTime() {
    return undefined;
  }

};
