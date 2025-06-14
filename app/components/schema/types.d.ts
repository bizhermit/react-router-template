namespace Schema {

  type Data = import("./data").SchemaData;
  type Eval<T> = { [K in keyof T]: T[K] };
  type Cast<T, U> = T extends U ? T : U;

  interface Env {
    isServer: boolean;
    t: (key: string) => string;
  };

  interface Result {
    type: "e" | "i";
    code: string;
    message: string;
  };

  type Mode = "enabled" | "disabled" | "readonly" | "hidden";

  interface ModeParams {
    data: Data;
    dep: Record<string, any>;
    env: Env;
  };

  interface ParserParams {
    value: any;
    dep: Record<string, any>;
    env: Env;
  };

  interface ParserResult<V> {
    value: V | null | undefined;
    result: Result | null | undefined;
  };

  interface Parser<V> {
    (params: ParserParams): ParserResult<V>;
  };

  interface ValidationParams<V> {
    label: string;
    value: V | null | undefined;
    data: Data;
    dep: Record<string, any>;
    env: Env;
  };

  interface Validator<V> {
    (params: ValidationParams<V>): Result | null | undefined;
  };

  interface CustomValidationMessage<V, P = {}> {
    (params: ValidationParams<V> & P): string;
  };

  interface DynamicValidationValue<T, V> {
    (params: ValidationParams<V>): T;
  };

  type Validation<T, V, P = {}> =
    | T
    | DynamicValidationValue<T, V>
    | [T | DynamicValidationValue<T, V>, CustomValidationMessage<V, P>?]
    ;

  type ValidationArray<T extends Validation<any, any>> =
    T extends any[] ? T :
    [T]
    ;

  type PickCustomValidationMessageAddonParams<T extends CustomValidationMessage<any, any> | undefined> =
    Omit<Parameters<Exclude<T, undefined>>[0], keyof ValidationParams<any>>;

  interface MessageGetter<T extends CustomValidationMessage<any, any> | undefined> {
    (params: ValidationParams<any> & PickCustomValidationMessageAddonParams<T>): string;
  };

  type $ValidationValue<T> = undefined | T | DynamicValidationValue<T, any>;
  type GetValidationValue<T extends Validation<any, any>> = ValidationArray<T>[0];

  interface SourceItem<V> {
    value: V;
    text: string;
  };

  type Source<V> = SourceItem<V>[];

  interface BaseProps {
    label?: string;
    refs?: string[];
    mode?: (params: ModeParams) => Mode;
  };

  type StrPattern =
    | "int"
    | "h-num"
    | "num"
    | "h-alpha"
    | "alpha"
    | "h-alpha-num"
    | "h-alpha-num-syn"
    | "h-katakana"
    | "f-katakana"
    | "katakana"
    | "hiragana"
    | "half"
    | "full"
    | "email"
    | "tel"
    | "url"
    | "post-num"
    ;

  interface StringProps<V extends string = string> extends BaseProps {
    required?: Validation<boolean, V>;
    source?: Source<V> | DynamicValidationValue<Source<V>, V>;
    sourceValidationMessage?: CustomValidationMessage<V, { source: Source<V> }>;
    len?: Validation<number, V, { length: number; currentLength: number; }>;
    min?: Validation<number, V, { minLength: number; currentLength: number; }>;
    max?: Validation<number, V, { maxLength: number; currentLength: number; }>;
    pattern?: Validation<RegExp | StrPattern, V, { pattern: RegExp | StrPattern }>;
    validators?: Array<Validator<V>>;
  };

  interface $String<V extends string = string> {
    type: "str";
    source: Source<V> | DynamicValidationValue<Source<V>, V> | undefined;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    length: $ValidationValue<number>;
    minLength: $ValidationValue<number>;
    maxLength: $ValidationValue<number>;
    pattern: $ValidationValue<RegExp | StrPattern>;
  };

  interface NumericProps<V extends number = number> extends BaseProps {
    required?: Validation<boolean, V>;
    source?: Source<V> | DynamicValidationValue<Source<V>, V>;
    sourceValidationMessage?: CustomValidationMessage<V, { source: Source<V> }>;
    min?: Validation<number, V, { min: number }>;
    max?: Validation<number, V, { max: number }>;
    float?: Validation<number, V, { float: number; currentFloat: number; }>;
    validators?: Array<Validator<V>>;
  };

  interface $Numeric<V extends number = number> {
    type: "num";
    source: Source<V> | DynamicValidationValue<Source<V>, V> | undefined;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    min: $ValidationValue<number>;
    max: $ValidationValue<number>;
    float: $ValidationValue<number>;
  };

  type BooleanValue = boolean | number | string;

  interface BooleanProps<
    TV extends BooleanValue = BooleanValue,
    FV extends BooleanValue = BooleanValue,
  > extends BaseProps {
    trueValue?: TV;
    falseValue?: FV;
    trueText?: string;
    falseText?: string;
    required?: Validation<boolean, TV | FV>;
    requiredAllowFalse?: boolean;
    validators?: Array<Validator<TV | FV>>;
  };

  interface $Boolean<
    TV extends BooleanValue = BooleanValue,
    FV extends BooleanValue = BooleanValue,
  > {
    type: "bool";
    trueValue: TV,
    falseValue: FV,
    validators: Array<Validator<TV | FV>>;
    required: $ValidationValue<boolean>;
    getSource: (params: { env: Schema.Env }) => Source<TV | FV>;
  };

  type $Any =
    | $String
    | $Numeric
    | $Boolean
    ;

  type RequiredValue<V, R extends boolean, O extends boolean = false> =
    O extends true ? V | null | undefined :
    R extends true ? V :
    R extends (...args?: any[]) => true ? V :
    V | null | undefined;

  type ValueType<Props extends Record<string, any>, Strict extends boolean = true, Optional extends boolean = false> =
    Props extends { source: Array<{ value: infer V }> } ? (
      RequiredValue<V, Props["required"][0], Optional>
    ) :
    Props extends { type: infer T } ? (
      T extends "str" ? (
        Strict extends true ? RequiredValue<string, Props["required"], Optional> :
        string | number | null | undefined
      ) :
      T extends "num" ? (
        Strict extends true ? RequiredValue<string, Props["required"], Optional> :
        number | `${number}` | null | undefined
      ) :
      T extends "bool" ? (
        Strict extends true ? RequiredValue<Props["trueValue"] | Props["falseValue"], Props["required"], Optional> :
        BooleanValue | null | undefined
      ) :
      any
    ) :
    never;

  type SchemaValue<Props extends Record<string, any>> =
    { -readonly [K in keyof Props]: ValueType<Props[K]> };

  type TolerantSchemaValue<Props extends Record<string, any>> =
    { [K in keyof Props]: ValueType<Props[K], false> };

};
