import { getSchemaItemPropsGenerator } from ".";

const strPatternCheck = {
  int: () => true,
  "h-num": () => true,
  num: () => true,
  "h-alpha": () => true,
  alpha: () => true,
  "h-alpha-num": () => true,
  "h-alpha-num-syn": () => true,
  "h-katakana": () => true,
  "f-katakana": () => true,
  katakana: () => true,
  hiragana: () => true,
  half: () => true,
  full: () => true,
  email: () => true,
  tel: () => true,
  url: () => true,
  "post-num": () => true,
} as const;

type StrPattern = keyof typeof strPatternCheck;

type StringOptions = {
  parser?: $Schema.Parser<string>;
  required?: $Schema.Validation<$Schema.Nullable<string>, boolean>;
  length?: $Schema.Validation<string, number, { length: number; currentLength: number; }>;
  minLength?: $Schema.Validation<string, number, { minLength: number; currentLength: number; }>;
  maxLength?: $Schema.Validation<string, number, { maxLength: number; currentLength: number; }>;
  pattern?: $Schema.Validation<string, StrPattern, { pattern: StrPattern; }>;
  rules?: $Schema.Rule<string>[];
};

type StringProps = $Schema.SchemaItemAbstractProps & StringOptions;

export function $str<const P extends StringProps>(props: P = {} as P) {
  const fixedProps = {
    type: "str",
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      if (typeof params.value === "string") return { value: params.value };
      return { value: String(params.value) };
    },
    validate: function (params) {
      console.log(this, params);
      // TODO:
      return null;
    },
  } as const satisfies StringProps & $Schema.SchemaItemInterfaceProps<string>;

  return getSchemaItemPropsGenerator<typeof fixedProps, StringProps, P>(fixedProps, props)({});
};
