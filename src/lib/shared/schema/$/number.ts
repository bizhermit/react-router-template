import { parseNumber } from "$/shared/objects/numeric";
import { getEmptyInjectParams, getPickMessageGetter, getSchemaItemPropsGenerator, getValidationArray } from ".";

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
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_NUMBER,
    _validators: null,
    getActionType: function () {
      return this.actionType || "input";
    },
    parse: function (value, params = getEmptyInjectParams()) {
      if (this.parser) return this.parser(value, params);
      const [num, succeeded] = parseNumber(value);
      if (succeeded) return { value: num };
      return {
        value: num,
        messages: [
          pickMessage("parse", {
            label: this.label,
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      };
    },
    validate: function (value, params = getEmptyInjectParams()) {
      if (this._validators == null) {
        this._validators = [];

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
                }
                return null;
              });
            }
          }
        }

        // min
        if (this.min != null) {
          const [min, getMinMessage] = getValidationArray(this.min);
          if (min != null) {
            const getMessage = getMinMessage ?? ((p) => pickMessage("min", p));

            if (typeof min === "function") {
              this._validators.push((p) => {
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
              this._validators.push((p) => {
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
        if (this.max != null) {
          const [max, getMaxMessage] = getValidationArray(this.max);
          if (max != null) {
            const getMessage = getMaxMessage ?? ((p) => pickMessage("max", p));

            if (typeof max === "function") {
              this._validators.push((p) => {
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
              this._validators.push((p) => {
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
        if (this.float != null) {
          const [float, getFloatMessage] = getValidationArray(this.float);
          if (float != null) {
            const getMessage = getFloatMessage ?? ((p) => pickMessage("float", p));

            if (typeof float === "function") {
              this._validators.push((p) => {
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
              this._validators.push((p) => {
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
        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<number>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
    },
  } as const satisfies NumberProps & $Schema.SchemaItemInterfaceProps<number>;

  return getSchemaItemPropsGenerator<typeof fixedProps, NumberProps, P>(fixedProps, props)({});
};
