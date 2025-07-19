/* eslint-disable @stylistic/indent */

namespace Schema {

  type Data = import("./data").SchemaData;
  type Eval<T> = { [K in keyof T]: T[K] };
  type Cast<T, U> = T extends U ? T : U;

  interface Env {
    isServer: boolean;
    t: I18nGetter;
  };

  interface Result {
    type: "e" | "w" | "i";
    code: string;
    message: string;
  };

  type Mode = "enabled" | "disabled" | "readonly" | "hidden";

  interface ModeParams {
    data: Data;
    dep: Record<string, unknown>;
    env: Env;
  };

  interface ModeFunction {
    (params: ModeParams): Mode;
  };

  interface ParserParams {
    value: unknown;
    dep: Record<string, unknown>;
    env: Env;
    label: string | undefined;
  };

  interface ParserResult<V> {
    value: V | null | undefined;
    result?: Result | null | undefined;
  };

  interface Parser<V> {
    (params: ParserParams): ParserResult<V>;
  };

  interface ValidationParams<V> {
    name: string;
    label: string | undefined;
    value: V | null | undefined;
    data: Data;
    dep: Record<string, unknown>;
    env: Env;
  };

  interface Validator<V> {
    (params: ValidationParams<V>): Result | null | undefined;
  };

  interface CustomValidationMessage<V, P = {}> {
    (params: ValidationParams<V> & P): string;
  };

  interface DynamicValidationValueParams {
    name: string;
    label: string | undefined;
    data: Data;
    dep: Record<string, unknown>;
    env: Env;
  };

  interface DynamicValidationValue<T> {
    (params: Schema.DynamicValidationValueParams): T;
  };

  type Validation<T, V, P = {}> =
    | T
    | DynamicValidationValue<T>
    | [T | DynamicValidationValue<T>, CustomValidationMessage<V, P>?]
    ;

  type ValidationArray<T extends Validation<unknown, unknown>> =
    T extends Array<unknown> ? T : [Exclude<T, undefined>];

  type PickCustomValidationMessageAddonParams<T extends CustomValidationMessage<unknown, unknown> | undefined> =
    Omit<Parameters<Exclude<T, undefined>>[0], keyof ValidationParams<unknown>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface MessageGetter<T extends CustomValidationMessage<any, any> | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: ValidationParams<any> & PickCustomValidationMessageAddonParams<T>): string;
  };

  type $ValidationValue<T> = undefined | T | DynamicValidationValue<T>;

  type GetValidationValue<Props, Key extends keyof Props> =
    Props extends { [K in Key]: infer R } ? ValidationArray<R>[0] : undefined;

  type GetSource<T extends Source<unknown> | DynamicValidationValue<Source<unknown>> | undefined> =
    T extends Array<unknown> ? T : T extends () => unknown ? T : undefined;

  interface SourceItem<V> {
    value: V;
    text?: string;
  };

  type Source<V> = SourceItem<V>[];

  interface BaseProps {
    label?: string;
    refs?: string[];
    mode?: ModeFunction;
    actionType?: "input" | "select" | "set";
  };

  interface $Base {
    mode?: ModeFunction;
    refs?: string[];
    actionType: BaseProps["actionType"];
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
    source?: Source<V> | DynamicValidationValue<Source<V>>;
    sourceValidation?: Validation<boolean, V, { source: Source<V>; }>;
    len?: Validation<number, V, { length: number; currentLength: number; }>;
    min?: Validation<number, V, { minLength: number; currentLength: number; }>;
    max?: Validation<number, V, { maxLength: number; currentLength: number; }>;
    pattern?: Validation<RegExp | StrPattern, V, { pattern: RegExp | StrPattern; }>;
    validators?: Array<Validator<V>>;
  };

  interface $String<V extends string = string> extends $Base {
    type: "str";
    label: string | undefined;
    parser: Parser<V>;
    source: Source<V> | DynamicValidationValue<Source<V>> | undefined;
    sourceValidation: $ValidationValue<boolean>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    length: $ValidationValue<number>;
    minLength: $ValidationValue<number>;
    maxLength: $ValidationValue<number>;
    pattern: $ValidationValue<RegExp | StrPattern>;
  };

  interface NumberProps<V extends number = number> extends BaseProps {
    parser?: Parser<V>;
    required?: Validation<boolean, V>;
    source?: Source<V> | DynamicValidationValue<Source<V>>;
    sourceValidation?: Validation<boolean, V, { source: Source<V>; }>;
    min?: Validation<number, V, { min: number; }>;
    max?: Validation<number, V, { max: number; }>;
    float?: Validation<number, V, { float: number; currentFloat: number; }>;
    validators?: Array<Validator<V>>;
  };

  interface $Number<V extends number = number> extends $Base {
    type: "num";
    label: string | undefined;
    parser: Parser<V>;
    source: Source<V> | DynamicValidationValue<Source<V>> | undefined;
    sourceValidation: $ValidationValue<boolean>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    min: $ValidationValue<number>;
    max: $ValidationValue<number>;
    float: $ValidationValue<number>;
  };

  type BooleanValue = boolean | number | string;

  interface BooleanProps<
    TV extends BooleanValue = BooleanValue,
    FV extends BooleanValue = BooleanValue
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
    FV extends BooleanValue = BooleanValue
  > extends $Base {
    type: "bool";
    label: string | undefined;
    trueValue: TV;
    falseValue: FV;
    trueText: string | undefined;
    falseText: string | undefined;
    parser: Parser<TV | FV>;
    validators: Array<Validator<TV | FV>>;
    required: $ValidationValue<boolean>;
    getSource: (params: { env: Schema.Env; }) => Source<TV | FV>;
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
    source?: Source<V> | DynamicValidationValue<Source<V>>;
    sourceValidation?: Validation<boolean, V, { source: Source<V>; }>;
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
    min?: Validation<number, V, { min: number; }>;
    max?: Validation<number, V, { max: number; }>;
    step?: number;
    validators?: Array<Validator<V>>;
  };

  interface $BaseDate<V extends DateValueString = DateValueString> extends $Base {
    source: Source<V> | DynamicValidationValue<Source<V>> | undefined;
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
    formatPattern: string;
    splitYear: <Props extends SplitDateProps>(props: Props) => $SplitDate<"Y">;
    splitMonth: <Props extends SplitDateProps>(props: Props) => $SplitDate<"M">;
  };

  type DateSplits<T extends SplitDateTarget> = Partial<Record<T, $SplitDate<T>>>;

  interface $Month<V extends MonthString = MonthString> extends $BaseDate<V> {
    type: "month";
    label: string | undefined;
    splits: DateSplits<"Y" | "M">;
    _splits: Partial<Record<SplitDateTarget, DataItem<$SplitDate>>>;
  };

  interface $Date<V extends DateString = DateString> extends $BaseDate<V> {
    type: "date";
    label: string | undefined;
    splits: DateSplits<"Y" | "M" | "D">;
    _splits: Partial<Record<SplitDateTarget, DataItem<$SplitDate>>>;
    splitDay: <Props extends SplitDateProps>(props: Props) => $SplitDate<"D">;
  };

  interface $DateTime<V extends DateTimeString = DateTimeString> extends $BaseDate<V> {
    type: "datetime";
    time: "hm" | "hms";
    label: string | undefined;
    minTime: $ValidationValue<TimeString>;
    maxTime: $ValidationValue<TimeString>;
    splits: DateSplits<"Y" | "M" | "D" | "h" | "m" | "s">;
    _splits: Partial<Record<SplitDateTarget, DataItem<$SplitDate>>>;
    splitDay: <Props extends SplitDateProps>(props: Props) => $SplitDate<"D">;
    splitHour: <Props extends SplitDateProps>(props: Props) => $SplitDate<"h">;
    splitMinute: <Props extends SplitDateProps>(props: Props) => $SplitDate<"m">;
    splitSecond: <Props extends SplitDateProps>(props: Props) => $SplitDate<"s">;
  };

  interface $SplitDate<
    T extends SplitDateTarget = SplitDateTarget,
    V extends number = number
  > extends $Base {
    type: `sdate-${T}`;
    label: string | undefined;
    parser: Parser<V>;
    core: $Date | $Month | $DateTime;
    _core: DataItem<$Date | $Month | $DateTime>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    min: $ValidationValue<number>;
    max: $ValidationValue<number>;
    step: number;
  };

  interface FileProps<V extends File | string = File | string> extends BaseProps {
    parser?: Parser<V>;
    required?: Validation<boolean, V>;
    accept?: Validation<string, V, { accept: string; }>;
    maxSize?: Validation<number, V, { maxSize: number; maxSizeText: string; }>;
    validators?: Array<Validator<V>>;
  };

  interface $File<V extends File | string = File | string> extends $Base {
    type: "file";
    label: string | undefined;
    parser: Parser<V>;
    validators: Array<Validator<V>>;
    required: $ValidationValue<boolean>;
    accept: $ValidationValue<string>;
    maxSize: $ValidationValue<number>;
  };

  interface ArrayProps<Prop extends $Any = $Any> extends BaseProps {
    prop: Prop;
    parser?: Parser<ValueType<Prop>[]>;
    autoRemoveNull?: boolean;
    required?: Validation<boolean, ValueType<Prop>[]>;
    source?: Source<ValueType<Prop>> | DynamicValidationValue<Source<ValueType<Prop>>>;
    sourceValidation?: Validation<boolean, ValueType<Prop>, { source: Source<ValueType<Prop>>; }>;
    len?: Validation<number, ValueType<Prop>[], { length: number; currentLength: number; }>;
    min?: Validation<number, ValueType<Prop>[], { minLength: number; currentLength: number; }>;
    max?: Validation<number, ValueType<Prop>[], { maxLength: number; currentLength: number; }>;
    validators?: Array<Validator<ValueType<Prop>[]>>;
  };

  interface $Array<Prop extends $Any = $Any> extends $Base {
    type: "arr";
    label: string | undefined;
    prop: Prop;
    autoRemoveNull: boolean;
    source: Source<unknown> | DynamicValidationValue<Source<unknown>> | undefined;
    sourceValidation: $ValidationValue<boolean>;
    key: ((value: Record<string, unknown>) => string) | undefined;
    parser: Parser<unknown[]>;
    validators: Array<Validator<unknown[]>>;
    required: $ValidationValue<boolean>;
    length: $ValidationValue<number>;
    minLength: $ValidationValue<number>;
    maxLength: $ValidationValue<number>;
  };

  interface StructProps<
    Props extends Record<string, $Any> = Record<string, $Any>
  > extends BaseProps {
    props: Props;
    key?: string | ((value: Record<string, unknown> | null | undefined) => string);
    parser?: Parser<SchemaValue<Props>>;
    required?: Validation<boolean, SchemaValue<Props>>;
    validators?: Array<Validator<SchemaValue<Props>>>;
  };

  interface $Struct<Props extends Record<string, $Any> = Record<string, $Any>> extends $Base {
    type: "struct";
    label: string | undefined;
    key: ((value: Record<string, unknown> | null | undefined) => string) | undefined;
    props: Props;
    parser: Parser<SchemaValue<unknown>>;
    validators: Array<Validator<SchemaValue<unknown>>>;
    required: $ValidationValue<boolean>;
  };

  type $Any =
    | $String
    | $Number
    | $Boolean
    | $Date
    | $Month
    | $DateTime
    | $SplitDate
    | $File
    | $Array
    | $Struct
    ;

  type DataItem<P extends $Any = $Any> = {
    label: string | undefined;
    name: string;
    parent?: DataItem<$Struct | $Array>;
    _: P;
  } & (P extends { type: infer T; } ? (
    T extends "struct" ? {
      dataItems: { [K in keyof P["props"]]: DataItem<P["props"][K]> };
    } : T extends "arr" ? {
      generateDataItem: (index: number) => DataItem<P["prop"]>;
    } : T extends "date" | "month" | "datetime" ? {
      splits: Partial<Record<SplitDateTarget, DataItem<$SplitDate>>>;
    } : T extends `sdate-${SplitDateTarget}` ? {
      core: DataItem<$Date | $Month | $DateTime>;
    } : {}
  ) : never);

  type DataItems<Props extends Record<string, $Any>> =
    { -readonly [K in keyof Props]: DataItem<Props[K]> };

  type RequiredValue<
    V,
    R extends boolean | DynamicValidationValue<boolean>,
    O extends boolean = false
  > =
    O extends true ? V | null | undefined :
    R extends true ? V :
    R extends ((...args?: unknown[]) => true) ? V :
    V | null | undefined;

  type ValueType<
    Props extends $Any,
    Strict extends boolean = true,
    Optional extends boolean = false
  > =
    Props extends {
      source: Array<{ value: infer V; }>;
      type: "str" | "num" | "date" | "month" | "datetime";
      sourceValidation: true | [true, unknown?] | null | undefined;
    } ? (
      RequiredValue<V, Props["required"], Optional>
    ) : Props extends { type: infer T; } ? (
      T extends "str" ? (
        Strict extends true ? RequiredValue<string, Props["required"], Optional> :
        string | number | null | undefined
      ) :
      T extends "num" ? (
        Strict extends true ?
        RequiredValue<number, Props["required"], Optional> :
        number | `${number}` | null | undefined
      ) :
      T extends "bool" ? (
        Strict extends true ? RequiredValue<Props["trueValue"] | Props["falseValue"], Props["required"], Optional> :
        BooleanValue | null | undefined
      ) :
      T extends "date" ? (
        Strict extends true ? RequiredValue<DateString, Props["required"], Optional> :
        string | Date | null | undefined
      ) :
      T extends "month" ? (
        Strict extends true ? RequiredValue<MonthString, Props["required"], Optional> :
        string | Date | null | undefined
      ) :
      T extends "datetime" ? (
        Strict extends true ? RequiredValue<Props["time"] extends "hms" ? DateTime_HMS_String : DateTime_HM_String, Props["required"], Optional> :
        string | Date | null | undefined
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
        Props extends {
          source: Array<{ value: infer V; }>;
          sourceValidation: true | [true, unknown?] | null | undefined;
        } ? (
          Strict extends true ? RequiredValue<V[], Props["required"], Optional> :
          V[] | null | undefined
        ) :
        Strict extends true ? RequiredValue<ValueType<Props["prop"], Strict, Optional>[], Props["required"], Optional> :
        ValueType<Props["prop"], Strict, Optional>[] | null | undefined
      ) :
      T extends "struct" ? (
        Strict extends true ? RequiredValue<SchemaValue<Props["props"], Optional>, Props["required"], Optional> :
        TolerantSchemaValue<Props["props"]> | null | undefined
      ) : (
        Props extends Record<string, unknown> ?
        Strict extends true ? SchemaValue<Props, Optional> : TolerantSchemaValue<Props> :
        never
      )
    ) : never;

  type SchemaValue<Props extends Record<string, $Any>, Optional extends boolean = false> =
    Eval<{ -readonly [K in keyof Props]: ValueType<Props[K], true, Optional> }>;

  type PartialSchemaValue<Props extends Record<string, $Any>> = SchemaValue<Props, true>;

  type TolerantSchemaValue<Props extends Record<string, $Any>> =
    Eval<{ -readonly [K in keyof Props]?: ValueType<Props[K], false> }>;

};
