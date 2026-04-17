import { getSchemaItemPropsGenerator } from ".";

type FileOptions = {
  parser?: $Schema.Parser<File>;
  required?: $Schema.Validation<$Schema.Nullable<File>, boolean>;
  accept?: $Schema.Validation<File, string, { accept: string; currentAccept: string; }>;
  maxSize?: $Schema.Validation<File, number, { maxSize: number; currentSize: number; }>;
  rules?: $Schema.Rule<File>[];
};

type FileProps = $Schema.SchemaItemAbstractProps & FileOptions;

export function $file<const P extends FileProps>(props: P = {} as P) {
  const fixedProps = {
    type: "file",
    _validators: null,
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      // TODO:
      return { value: undefined };
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies FileProps & $Schema.SchemaItemInterfaceProps<File>;

  return getSchemaItemPropsGenerator<typeof fixedProps, FileProps, P>(fixedProps, props)({});
};
