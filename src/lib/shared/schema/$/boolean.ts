import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_BOOLEAN = "bool";

type BooleanValue = boolean | number | string;

export type BooleanValidationMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_BOOLEAN;
} & (
    | { code: "parse"; }
    | { code: "required"; }
  );

type BooleanOptions<
  TrueValue extends BooleanValue,
  FalseValue extends BooleanValue
> = {
  trueValue?: TrueValue;
  falseValue?: FalseValue;
  parser?: $Schema.Parser<TrueValue | FalseValue>;
  required?: $Schema.Validation<$Schema.Nullable<TrueValue | FalseValue>, boolean | "nonFalse", undefined, BooleanValidationMessage>;
  rules?: $Schema.Rule<TrueValue | FalseValue>[];
  trueText?: string;
  falseText?: string;
};

type BooleanProps<
  TrueValue extends BooleanValue,
  FalseValue extends BooleanValue
> = $Schema.SchemaItemAbstractProps & BooleanOptions<TrueValue, FalseValue>;

export function $bool<
  const TrueValue extends BooleanValue,
  const FalseValue extends BooleanValue,
  const P extends BooleanProps<TrueValue, FalseValue>
>(props: P = {} as P) {
  type TV = P extends undefined ? true :
    P extends { trueValue: infer T; } ? Exclude<T, undefined> : true;
  type FV = P extends undefined ? false :
    P extends { falseValue: infer T; } ? Exclude<T, undefined> : false;

  const trueValue = (props?.trueValue ?? true) as TV;
  const falseValue = (props?.falseValue ?? false) as FV;

  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_BOOLEAN,
    trueValue,
    falseValue,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    parse: function (value, params) {
      if (this.parser) return this.parser(value, params);
      const s = String(value);
      if (s === String(trueValue)) {
        return { value: trueValue };
      }
      if (s === String(falseValue)) {
        return { value: falseValue };
      }
      if (value == null || value === "") {
        return { value: undefined };
      }
      const ls = s.toLowerCase();
      if (ls === "on") {
        return { value: trueValue };
      }
      if (ls === "off") {
        return { value: falseValue };
      }
      return {
        value: undefined,
        message: {
          type: "e",
          label: this.label,
          actionType: this.getActionType(),
          otype: SCHEMA_ITEM_TYPE_BOOLEAN,
          code: "parse",
        },
      };
    },
    validate: function (value, params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_BOOLEAN,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "required",
                ...p,
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                const r = required(p);
                if (!r) return null;
                if (r === "nonFalse") {
                  if (p.value === trueValue) return null;
                  return getMessage(p);
                }
                if (p.value == trueValue || p.value === falseValue) return null;
                return getMessage(p);
              });
            } else {
              this._validators.push((p) => {
                if (required === "nonFalse") {
                  if (p.value === trueValue) return null;
                  return getMessage(p);
                }
                if (p.value === trueValue || p.value === falseValue) return null;
                return getMessage(p);
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
      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<TV | FV>;

      for (const vali of this._validators) {
        msg = vali(ruleArg);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies BooleanProps<TV, FV> & $Schema.SchemaItemInterfaceProps<TV | FV>;

  return getSchemaItemPropsGenerator<typeof fixedProps, BooleanProps<TV, FV>, P>(fixedProps, props)({});
};
