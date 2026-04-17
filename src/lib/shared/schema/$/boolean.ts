import { getSchemaItemPropsGenerator } from ".";

type BooleanValue = boolean | number | string;

type BooleanOptions<
  TrueValue extends BooleanValue,
  FalseValue extends BooleanValue
> = {
  trueValue?: TrueValue;
  falseValue?: FalseValue;
  parser?: $Schema.Parser<TrueValue | FalseValue>;
  required?: $Schema.Validation<$Schema.Nullable<TrueValue | FalseValue>, boolean | "nonFalse", {}>;
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
    type: "bool",
    trueValue,
    falseValue,
    _validators: null,
    parse: function (params) {
      if (this.parser) return this.parser(params);
      const s = String(params.value);
      if (s === String(trueValue)) {
        return { value: trueValue };
      }
      if (s === String(falseValue)) {
        return { value: falseValue };
      }
      if (params.value == null || params.value === "") {
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
          label: this.label,
          actionType: this.actionType ?? "select",
          type: "e",
          code: "parse",
          message: "", // TODO:
        },
      };
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies BooleanProps<TV, FV> & $Schema.SchemaItemInterfaceProps<TV | FV>;

  return getSchemaItemPropsGenerator<typeof fixedProps, BooleanProps<TV, FV>, P>(fixedProps, props)({});
};
