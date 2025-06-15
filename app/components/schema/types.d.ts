namespace Schema {

  type Data = import("./data").SchemaData;
  type Eval<T> = { [K in keyof T]: T[K] };
  type Cast<T, U> = T extends U ? T : U;

  interface Env {
    isServer: boolean;
    t: (key: string) => string;
  };

  interface Result {
    type: "e" | "w" | "i";
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
    result?: Result | null | undefined;
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
    [Exclude<T, undefined>]
    ;

  type PickCustomValidationMessageAddonParams<T extends CustomValidationMessage<any, any> | undefined> =
    Omit<Parameters<Exclude<T, undefined>>[0], keyof ValidationParams<any>>;

  interface MessageGetter<T extends CustomValidationMessage<any, any> | undefined> {
    (params: ValidationParams<any> & PickCustomValidationMessageAddonParams<T>): string;
  };

  type $ValidationValue<T> = undefined | T | DynamicValidationValue<T, any>;

  type GetValidationValue<Props extends any, Key extends keyof Props> =
    Props extends { [K in Key]: infer R } ? ValidationArray<R>[0] : undefined

  type GetSource<T extends Source<any> | DynamicValidationValue<Source<any>, any> | undefined> =
    T extends Array<any> ? T :
    T extends () => any ? T :
    undefined;

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
    parser?: Parser<V>;
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
    parser: Parser<V>;
    source: Source<V> | DynamicValidationValue<Source<V>, V> | undefined;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    length: $ValidationValue<number>;
    minLength: $ValidationValue<number>;
    maxLength: $ValidationValue<number>;
    pattern: $ValidationValue<RegExp | StrPattern>;
  };

  interface NumericProps<V extends number = number> extends BaseProps {
    parser?: Parser<V>;
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
    parser: Parser<V>;
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
    parser?: Parser<TV | FV>;
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
    parser: Parser<TV | FV>;
    validators: Array<Validator<TV | FV>>;
    required: $ValidationValue<boolean>;
    getSource: (params: { env: Schema.Env }) => Source<TV | FV>;
  };

  type MonthString = `${number}-${number}`;
  type DateString = `${number}-${number}-${number}`;
  type TimeHMString = `${number}:${number}`;
  type TimeHMSString = `${number}:${number}:${number}`;
  type DateTime_HM_String = `${DateString}T${TimeHMString}`;
  type DateTime_HMS_String = `${DateString}T${TimeHMSString}`;
  type TimeString = TimeHMString | TimeHMSString;
  type DateTimeString = `${DateString}T${TimeHMString | TimeHMSString}`;
  type SplitDateTarget = "Y" | "M" | "D" | "h" | "m" | "s";

  type DateValueString =
    | MonthString
    | DateString
    | DateTimeString
    ;

  interface DateBaseProps<V extends DateValueString = DateValueString> extends BaseProps {
    parser?: Parser<V>;
    required?: Validation<boolean, V>;
    minDate?: Validation<Date | V, V, { minDate: Date; date: Date; }>;
    maxDate?: Validation<Date | V, V, { maxDate: Date; date: Date; }>;
    pair?: Validation<{
      name: string;
      position: "before" | "after";
      same?: boolean;
    }, V, { pairDate: Date; date: Date; }>;
    validators?: Array<Validator<V>>;
  };

  interface MonthProps<V extends MonthString = MonthString> extends DateBaseProps<V> { };

  interface DateProps<V extends DateString = DateString> extends DateBaseProps<V> { };

  interface DateTimeProps<V extends DateTimeString = DateTimeString> extends DateBaseProps<V> {
    time?: "hm" | "hms";
    minTime?: Validation<TimeString, V, { minTime: TimeString; date: Date; }>;
    maxTime?: Validation<TimeString, V, { maxTime: TimeString; date: Date; }>;
  };

  interface SplitDateProps<V extends number = number> extends BaseProps {
    parser?: Parser<V>;
    required?: Validation<boolean, V>;
    min?: Validation<number, V, { min: number }>;
    max?: Validation<number, V, { max: number }>;
    validators?: Array<Validator<V>>;
  };

  interface $BaseDate<V extends DateValueString = DateValueString> {
    parser: Parser<V>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    minDate: $ValidationValue<Date | V>;
    maxDate: $ValidationValue<Date | V>;
    pair: $ValidationValue<{
      name: string;
      position: "before" | "after";
      same?: boolean;
    }>;
    splitYear: <Props extends SplitDateProps>(props: Props) => $SplitDate<"Y">;
    splitMonth: <Props extends SplitDateProps>(props: Props) => $SplitDate<"M">;
  };

  type DateSplits<T extends SplitDateTarget> = Partial<Record<T, $SplitDate<T>>>;

  interface $Month<V extends MonthString = MonthString> extends $BaseDate<V> {
    type: "month";
    splits: DateSplits<"Y" | "M">;
  };

  interface $Date<V extends DateString = DateString> extends $BaseDate<V> {
    type: "date";
    splits: DateSplits<"Y" | "M" | "D">;
    splitDay: <Props extends SplitDateProps>(props: Props) => $SplitDate<"D">;
  };

  interface $DateTime<V extends DateTimeString = DateTimeString> extends $BaseDate<V> {
    type: "datetime";
    time: "hm" | "hms";
    minTime: $ValidationValue<TimeString>;
    maxTime: $ValidationValue<TimeString>;
    splits: DateSplits<"Y" | "M" | "D" | "h" | "m" | "s">;
    splitDay: <Props extends SplitDateProps>(props: Props) => $SplitDate<"D">;
    splitHour: <Props extends SplitDateProps>(props: Props) => $SplitDate<"h">;
    splitMinute: <Props extends SplitDateProps>(props: Props) => $SplitDate<"m">;
    splitSecond: <Props extends SplitDateProps>(props: Props) => $SplitDate<"s">;
  };

  interface $SplitDate<T extends SplitDateTarget, V extends number = number> {
    type: `sdate-${T}`;
    parser: Parser<V>;
    core: $Date | $Month | $DateTime;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    min: $ValidationValue<number>;
    max: $ValidationValue<number>;
  };

  interface FileProps<V extends File | string = File | string> extends BaseProps {
    parser?: Parser<V>;
    required?: Validation<boolean, V>;
    accept?: Validation<string, V, { accept: string }>;
    maxSize?: Validation<number, V, { maxSize: number; maxSizeText: string; }>;
    validators?: Array<Validator<V>>;
  };

  interface $File<V extends File | string = File | string> {
    type: "file";
    parser: Parser<V>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    accept: $ValidationValue<string>;
    maxSize: $ValidationValue<number>;
  };

  interface ArrayProps<Prop extends $Any = $Any> {
    prop: Prop;
    parser?: Parser<ValueType<Prop>[]>;
    required?: Validation<boolean, ValueType<Prop>[]>;
    len?: Validation<number, ValueType<Prop>[], { length: number; currentLength: number; }>;
    min?: Validation<number, ValueType<Prop>[], { minLength: number; currentLength: number; }>;
    max?: Validation<number, ValueType<Prop>[], { maxLength: number; currentLength: number; }>;
    validators?: Array<Validator<ValueType<Prop>[]>>;
  };

  interface $Array<Prop extends $Any = $Any> {
    type: "arr";
    prop: Prop;
    parser: Parser<ValueType<Prop>[]>;
    validators: Array<Validator<ValueType<Prop>[]>>;
    required: $ValidationValue<boolean>;
    length: $ValidationValue<number>;
    minLength: $ValidationValue<number>;
    maxLength: $ValidationValue<number>;
  };

  interface StructProps<Props extends Record<string, $Any> = Record<string, $Any>> {
    props: Props;
    parser?: Parser<SchemaValue<Props>>;
    required?: Validation<boolean, SchemaValue<Props>>;
    validators?: Array<Validator<SchemaValue<Props>>>;
  };

  interface $Struct<Props extends Record<string, $Any> = Record<string, $Any>> {
    type: "struct";
    props: Props;
    parser: Parser<SchemaValue<Props>>;
    validators: Array<Validator<SchemaValue<Props>>>;
    required: $ValidationValue<boolean>;
  };

  type $Any =
    | $String
    | $Numeric
    | $Boolean
    | $Date
    | $Month
    | $DateTime
    | $SplitDate
    | $File
    | $Array
    | $Struct
    ;

  type RequiredValue<V, R extends boolean | DynamicValidationValue<boolean, any>, O extends boolean = false> =
    O extends true ? V | null | undefined :
    R extends true ? V :
    R extends (...args?: any[]) => true ? V :
    V | null | undefined;

  type ValueType<Props extends $Any, Strict extends boolean = true, Optional extends boolean = false> =
    Props extends { source: Array<{ value: infer V }> } ? (
      RequiredValue<V, Props["required"], Optional>
    ) :
    Props extends { type: infer T } ? (
      T extends "str" ? (
        Strict extends true ? RequiredValue<string, Props["required"], Optional> :
        string | number | null | undefined
      ) :
      T extends "num" ? (
        Strict extends true ? RequiredValue<number, Props["required"], Optional> :
        number | `${number}` | null | undefined
      ) :
      T extends "bool" ? (
        Strict extends true ? RequiredValue<Props["trueValue"] | Props["falseValue"], Props["required"], Optional> :
        BooleanValue | null | undefined
      ) :
      T extends "date" ? (
        Strict extends true ? RequiredValue<DateString, Props["required"], Optional> :
        DateValueString | Date | null | undefined
      ) :
      T extends "month" ? (
        Strict extends true ? RequiredValue<MonthString, Props["required"], Optional> :
        DateValueString | Date | null | undefined
      ) :
      T extends "datetime" ? (
        Strict extends true ? RequiredValue<Props["time"] extends "hms" ? DateTime_HMS_String : DateTime_HM_String, Props["required"], Optional> :
        DateValueString | Date | null | undefined
      ) :
      T extends `sdate-${SplitDateTarget}` ? (
        Strict extends true ? RequiredValue<number, Props["required"], Optional> :
        number | `${number}` | null | undefined
      ) :
      T extends "file" ? (
        Strict extends true ? RequiredValue<File | string, Props["required"], Optional> :
        File | Blob | string | null | undefined
      ) :
      T extends "arr" ? (
        Strict extends true ? RequiredValue<ValueType<Props["prop"], Strict, Optional>[], Props["required"], Optional> :
        ValueType<Props["prop"], Strict, Optional>[] | null | undefined
      ) :
      T extends "struct" ? (
        Strict extends true ? RequiredValue<SchemaValue<Props["props"], Optional>, Props["required"], Optional> :
        TolerantSchemaValue<Props["props"]> | null | undefined
      ) : (
        Props extends Record<string, any> ?
        Strict extends true ? SchemaValue<Props, Optional> : TolerantSchemaValue<Props> :
        never
      )
    ) :
    never;

  type SchemaValue<Props extends Record<string, any>, Optional extends boolean = false> =
    Eval<{ -readonly [K in keyof Props]: ValueType<Props[K], true, Optional> }>;

  type PartialSchemaValue<Props extends Record<string, any>> = SchemaValue<Props, true>;

  type TolerantSchemaValue<Props extends Record<string, any>> =
    Eval<{ -readonly [K in keyof Props]?: ValueType<Props[K], false> }>;

};
