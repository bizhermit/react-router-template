import { getSchemaItemPropsGenerator } from ".";

// type SourceArrayNoise =
//   | $Schema.SourceItem<unknown>[]
//   | readonly $Schema.SourceItem<unknown>[];

// type RemoveSourceArrayNoise<T> =
//   [T] extends [infer U & SourceArrayNoise] ? U : T;

type SourceArrayNoise =
  | $Schema.SourceItem<unknown>[]
  | readonly $Schema.SourceItem<unknown>[];

type RemoveSourceArrayNoise<T> = T extends infer U & SourceArrayNoise
  ? Extract<U, readonly unknown[]>
  : T;

type SourceOptions<Value> = {
  parser?: $Schema.Parser<Value>;
  items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[];
  required?: $Schema.Validation<$Schema.Nullable<Value>, boolean>;
  rules?: $Schema.Rule<Value>[];
};

type SourceProps<Value> = $Schema.SchemaItemAbstractProps & SourceOptions<Value>;

export function $$source<
  const Value,
  const P extends SourceProps<Value>
>(props: P) {
  type Items = RemoveSourceArrayNoise<P["items"]>;

  const fixedProps = {
    type: "src",
    items: props.items as Items,
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      const item = this.items.find(item => {
        return String(item.value) === String(params.value);
      });
      if (item) return { value: item.value };
      return {
        value: params.value as Value,
        message: {
          label: this.label,
          actionType: this.actionType ?? "select",
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
  } as const satisfies Omit<SourceProps<Value>, "items"> & $Schema.SchemaItemInterfaceProps<Value> & {
    items: Items;
  };

  return getSchemaItemPropsGenerator<typeof fixedProps, SourceProps<Value>, P>(fixedProps, props)({});
};
