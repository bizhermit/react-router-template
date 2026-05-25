import { parseNumber } from "$/shared/objects/numeric";
import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";
import type { $DateSchema } from "./date";
import type { $DateTimeSchema } from "./datetime";
import type { $MonthSchema } from "./month";

export type DateSplitPart =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second";

type SplitDateValidations = {
  required: $Schema.ValidationEntry<boolean | "inherit", null | undefined>;
  min: $Schema.ValidationEntry<number | "inherit", number, { min: number; }>;
  max: $Schema.ValidationEntry<number | "inherit", number, { max: number; }>;
};

export type SplitDateSchemaMessage = $Schema.ValidationMessages<
  SplitDateValidations,
  `split-${DateSplitPart}`,
  {
    code: "split-required";
    targets: DateSplitPart[];
  }
>;

export type SplitDateProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<SplitDateValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };

export class $SplitDateSchema<
  const Base extends $DateSchema<any> | $DateTimeSchema<any> | $MonthSchema<any>,
  const Props extends SplitDateProps
> extends SchemaItem<number> {

  protected pickMessage: ReturnType<typeof getPickMessageGetter<`split-${DateSplitPart}`>>;

  constructor(
    protected base: Base,
    protected props: Props,
    protected part: DateSplitPart,
    protected baseGetters: {
      required: (params: $Schema.InjectParams) => $Schema.Nullable<boolean>;
      min: (params: $Schema.InjectParams) => $Schema.Nullable<number>;
      max: (params: $Schema.InjectParams) => $Schema.Nullable<number>;
    }
  ) {
    super(props);
    this.pickMessage = getPickMessageGetter(`split-${part}`);
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || this.base.getActionType();
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<number> {
    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      return {
        value: parsed.value,
        messages: { [params.name || ""]: parsed.messages },
      };
    }

    const [num, succeeded] = parseNumber(value);
    if (succeeded) return { value: num };
    return {
      value: num,
      messages: {
        [params.name || ""]: [
          this.pickMessage("parse", {
            label: this.getLabel(),
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      },
    };
  }

  public validate(
    value: $Schema.Nullable<number>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.RecordMessages {
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
              if (this.baseGetters.required(p)) {
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
                }
              }
              return null;
            }
            if (p.value == null) {
              return getMessage(p as $Schema.ValidationResultArgParams);
            }
            return null;
          });
        } else {
          if (required === "inherit") {
            this.validators.push((p) => {
              if (this.baseGetters.required(p)) {
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
                }
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
              const baseMin = this.baseGetters.min(p);
              if (baseMin == null || baseMin <= p.value) return null;
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
              if (p.value == null) return null;
              const baseMin = this.baseGetters.min(p);
              if (baseMin == null || baseMin <= p.value) return null;
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
              const baseMax = this.baseGetters.max(p);
              if (baseMax == null || p.value <= baseMax) return null;
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
              if (p.value == null) return null;
              const baseMax = this.baseGetters.max(p);
              if (baseMax == null || p.value <= baseMax) return null;
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

  public getBase() {
    return this.base;
  }

  public getRequired(params: $Schema.InjectParams) {
    const required = getValidationArray(this.props.required)[0];
    const req = typeof required === "function" ? required(params) : required;
    if (req === "inherit") {
      return this.baseGetters.required(params) ?? false;
    }
    return req ?? false;
  }

  public getMin(params: $Schema.InjectParams) {
    const min = getValidationArray(this.props.min)[0];
    const m = typeof min === "function" ? min(params) : min;
    if (m === "inherit") {
      return this.baseGetters.min(params);
    }
    return m;
  }

  public getMax(params: $Schema.InjectParams) {
    const max = getValidationArray(this.props.max)[0];
    const m = typeof max === "function" ? max(params) : max;
    if (m === "inherit") {
      return this.baseGetters.max(params);
    }
    return m;
  }

};
