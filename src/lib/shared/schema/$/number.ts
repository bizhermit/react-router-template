import { parseNumber } from "$/shared/objects/numeric";
import { getSchemaItemPropsGenerator } from ".";

type NumberOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.Validation<$Schema.Nullable<number>, boolean>;
  min?: $Schema.Validation<number, number, { min: number; }>;
  max?: $Schema.Validation<number, number, { max: number; }>;
  float?: $Schema.Validation<number, number, { float: number; currentFloat: number; }>;
  rules?: $Schema.Rule<number>[];
};

type NumberProps = $Schema.SchemaItemAbstractProps & NumberOptions;

export function $num<const P extends NumberProps>(props: P = {} as P) {
  const fixedProps = {
    type: "num",
    parse: function (params) {
      if (this.parser) return this.parser(params);
      const [num, succeeded] = parseNumber(params.value);
      if (succeeded) return { value: num };
      return {
        value: num,
        message: {
          label: this.label,
          actionType: this.actionType ?? "input",
          type: "e",
          code: "parse",
          message: "", // TODO
        },
      };
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies NumberProps & $Schema.SchemaItemInterfaceProps<number>;

  return getSchemaItemPropsGenerator<typeof fixedProps, NumberProps, P>(fixedProps, props)({});
};
