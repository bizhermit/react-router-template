import { getSchemaItemPropsGenerator } from ".";

type ObjectOptions<Contents> = {
  props: Contents;
  parser?: $Schema.Parser<$Schema.Infer<Contents>>;
  required?: $Schema.Validation<$Schema.Nullable<$Schema.InferValue<Contents>>, boolean>;
  rules?: $Schema.Rule<$Schema.InferValue<Contents>>[];
};

type ObjectProps<Contents> = $Schema.SchemaItemAbstractProps & ObjectOptions<Contents>;

export function $object<
  const Contents,
  const P extends ObjectProps<Contents>
>(props: P) {
  const fixedProps = {
    type: "obj",
    props: props.props,
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      return { value: params.value as $Schema.Infer<Contents> };
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies ObjectProps<Contents> & $Schema.SchemaItemInterfaceProps<$Schema.Infer<Contents>>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ObjectProps<Contents>, P>(fixedProps, props)({});
};
