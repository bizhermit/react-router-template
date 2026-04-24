import { parseNumber } from "$/shared/objects/numeric";
import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_NUMBER = "num";

type NumberValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  min: $Schema.ValidationEntry<number, number, { min: number; }>;
  max: $Schema.ValidationEntry<number, number, { max: number; }>;
  float: $Schema.ValidationEntry<number, number, { float: number; currentFloat: number; }>;
};

export type NumberSchemaMessage = $Schema.ValidationMessages<
  NumberValidations,
  typeof SCHEMA_ITEM_TYPE_NUMBER
>;

type NumberProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<NumberValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };
;

export function getFloatPosition(value: number) {
  const [_, n] = String(value).split(".");
  return n?.length ?? 0;
};

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_NUMBER);

export function $num<const P extends NumberProps>(props: P = {} as P) {
  return new $NumSchema<P>(props);
};

export class $NumSchema<const P extends NumberProps> extends SchemaItem<number> {

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
      if (this.props.required != null) {
        const [required, getRequiredMessage] = getValidationArray(this.props.required);
        if (required) {
          const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

          if (typeof required === "function") {
            this.validators.push((p) => {
              if (!required(p)) return null;
              if (p.value == null) {
                return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) {
                return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
              }
              return null;
            });
          }
        }
      }

      // min
      if (this.props.min != null) {
        const [min, getMinMessage] = getValidationArray(this.props.min);
        if (min != null) {
          const getMessage = getMinMessage ?? ((p) => pickMessage("min", p));

          if (typeof min === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = min(p);
              if (m == null || m <= p.value) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  min: m,
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
      if (this.props.max != null) {
        const [max, getMaxMessage] = getValidationArray(this.props.max);
        if (max != null) {
          const getMessage = getMaxMessage ?? ((p) => pickMessage("max", p));

          if (typeof max === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const m = max(p);
              if (m == null || p.value <= m) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  max: m,
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

      // float
      if (this.props.float != null) {
        const [float, getFloatMessage] = getValidationArray(this.props.float);
        if (float != null) {
          const getMessage = getFloatMessage ?? ((p) => pickMessage("float", p));

          if (typeof float === "function") {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const f = float(p);
              if (f == null) return null;
              const cur = getFloatPosition(p.value);
              if (cur <= f) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  float: f,
                  currentFloat: cur,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) return null;
              const cur = getFloatPosition(p.value);
              if (cur <= float) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<number>,
                params: {
                  float,
                  currentFloat: cur,
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

  public overwrite<const OP extends NumberProps>(props: OP) {
    return new $NumSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

}
