import { getSchemaItemPropsGenerator } from ".";

type ArrayOptions<Content> = {
  prop: Content;
  parser?: $Schema.Parser<$Schema.InferValue<Content>[]>;
  required?: $Schema.Validation<$Schema.Nullable<$Schema.InferValue<Content>[]>, boolean>;
  length?: $Schema.Validation<$Schema.InferValue<Content>[], number, { length: number; currentLength: number; }>;
  minLength?: $Schema.Validation<$Schema.InferValue<Content>[], number, { minLength: number; currentLength: number; }>;
  maxLength?: $Schema.Validation<$Schema.InferValue<Content>[], number, { maxLength: number; currentLength: number; }>;
  rules?: $Schema.Rule<$Schema.InferValue<Content>[]>[];
};

type ArrayProps<Content> = $Schema.SchemaItemAbstractProps & ArrayOptions<Content>;

export function $array<
  const Content,
  const P extends ArrayProps<Content>
>(props: P) {
  type Value = $Schema.InferValue<Content>[];

  const fixedProps = {
    type: "arr",
    prop: props.prop,
    _validators: null,
    parse: function (params) {
      const { value, message } = ((): $Schema.ParseResult<Value> => {
        if (this.parser) return this.parser(params);
        if (params.value == null || params.value === "") return { value: undefined };
        if (Array.isArray(params.value)) {
          return { value: params.value as Value };
        }
        return { value: [params.value] as Value };
      })();
      // TODO: children error
      return { value };
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies ArrayProps<Content> & $Schema.SchemaItemInterfaceProps<Value>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ArrayProps<Content>, P>(fixedProps, props)({});
};
