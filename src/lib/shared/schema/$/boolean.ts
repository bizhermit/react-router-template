import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_BOOLEAN = "bool";

type BooleanValue = boolean | number | string;

type BooleanValidations<FalseValue extends BooleanValue> = {
  required: $Schema.ValidationSchemaEntry<boolean | "nonFalse", $Schema.Nullable<FalseValue>>;
};

export type BooleanSchemaMessage<FalseValue extends BooleanValue = BooleanValue> =
  $Schema.ValidationMessageFromSchema<
    BooleanValidations<FalseValue>,
    typeof SCHEMA_ITEM_TYPE_BOOLEAN
  >;

type BooleanProps<
  TrueValue extends BooleanValue,
  FalseValue extends BooleanValue
> = $Schema.SchemaItemAbstractProps
  & $Schema.ValidationOptionsFromSchema<BooleanValidations<FalseValue>>
  & {
    trueValue?: TrueValue;
    falseValue?: FalseValue;
    parser?: $Schema.Parser<TrueValue | FalseValue>;
    rules?: $Schema.Rule<TrueValue | FalseValue>[];
    trueText?: string;
    falseText?: string;
  };

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
    parse: function (value, params = getEmptyInjectParams()) {
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
        messages: [{
          type: "e",
          label: this.label,
          actionType: this.getActionType(),
          otype: SCHEMA_ITEM_TYPE_BOOLEAN,
          code: "parse",
          name: params.name,
        }],
      };
    },
    validate: function (value, params = getEmptyInjectParams()) {
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
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                const r = required(p);
                if (!r) return null;
                if (r === "nonFalse") {
                  if (p.value === trueValue) return null;
                  return getMessage(p as $Schema.ValidationResultArgParams<$Schema.Nullable<FV>>);
                }
                if (p.value == trueValue || p.value === falseValue) return null;
                return getMessage(p as $Schema.ValidationResultArgParams<$Schema.Nullable<FV>>);
              });
            } else {
              this._validators.push((p) => {
                if (required === "nonFalse") {
                  if (p.value === trueValue) return null;
                  return getMessage(p as $Schema.ValidationResultArgParams<$Schema.Nullable<FV>>);
                }
                if (p.value === trueValue || p.value === falseValue) return null;
                return getMessage(p as $Schema.ValidationResultArgParams<$Schema.Nullable<FV>>);
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
      } as const satisfies $Schema.RuleArgParams<TV | FV>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
    },
  } as const satisfies BooleanProps<TV, FV> & $Schema.SchemaItemInterfaceProps<TV | FV>;

  return getSchemaItemPropsGenerator<typeof fixedProps, BooleanProps<TV, FV>, P>(fixedProps, props)({});
};
