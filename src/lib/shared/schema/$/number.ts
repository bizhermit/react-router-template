import { parseNumber } from "$/shared/objects/numeric";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_NUMBER = "num";

type NumberValidation_MinParams = { min: number; };
type NumberValidation_MaxParams = { max: number; };
type NumberValidation_FloatParams = { float: number; currentFloat: number; };

export type NumberValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_NUMBER;
};
export type NumberValidationMessage = NumberValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "min"; } & NumberValidation_MinParams)
  | ({ code: "max"; } & NumberValidation_MaxParams)
  | ({ code: "float"; } & NumberValidation_FloatParams)
);

type NumberOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.Validation<$Schema.Nullable<number>, boolean, undefined, NumberValidationMessage>;
  min?: $Schema.Validation<number, number, NumberValidation_MinParams, NumberValidationMessage>;
  max?: $Schema.Validation<number, number, NumberValidation_MaxParams, NumberValidationMessage>;
  float?: $Schema.Validation<number, number, NumberValidation_FloatParams, NumberValidationMessage>;
  rules?: $Schema.Rule<number>[];
};

type NumberProps = $Schema.SchemaItemAbstractProps & NumberOptions;

export function getFloatPosition(value: number) {
  const [_, n] = String(value).split(".");
  return n?.length ?? 0;
};

export function $num<const P extends NumberProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_NUMBER,
    _validators: null,
    getActionType: function () {
      return this.actionType || "input";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_NUMBER,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      const [num, succeeded] = parseNumber(params.value);
      if (succeeded) return { value: num };
      return {
        value: num,
        message: {
          ...this.getCommonTypeMessageParams(),
          code: "parse",
        },
      };
    },
    validate: function (params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = this.getCommonTypeMessageParams();

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              (() => ({
                ...commonMsgParams,
                code: "required",
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p);
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
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinMessage> =
              getMinMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "min",
                min: p.validationValues.min,
              }));

            if (typeof min === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = min(p);
                if (m == null || m <= p.value) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    min: m,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (min <= p.value) return null;
                return getMessage({
                  ...p,
                  validationValues: {
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
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxMessage> =
              getMaxMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "max",
                max: p.validationValues.max,
              }));

            if (typeof max === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = max(p);
                if (m == null || p.value <= m) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    max: m,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value <= max) return null;
                return getMessage({
                  ...p,
                  validationValues: {
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
            const getMessage: $Schema.ValidationMessageGetter<typeof getFloatMessage> =
              getFloatMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "float",
                float: p.validationValues.float,
                currentFloat: p.validationValues.currentFloat,
              }));

            if (typeof float === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const f = float(p);
                if (f == null) return null;
                const cur = getFloatPosition(p.value);
                if (cur <= f) return null;
                return getMessage({
                  ...p,
                  validationValues: {
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
                  ...p,
                  validationValues: {
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

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies NumberProps & $Schema.SchemaItemInterfaceProps<number, NumberValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, NumberProps, P>(fixedProps, props)({});
};
