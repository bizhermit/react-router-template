/* eslint-disable @typescript-eslint/no-explicit-any */
namespace $Schema {

  type Eval<T> = { [K in keyof T]: T[K] };

  type Nullable<T> = T | null | undefined;

  type Mode = "enabled" | "disabled" | "readonly" | "hidden";
  type ActionType = "input" | "select" | "set";

  type InjectParams = {
    values: Record<string, unknown>;
    data: Record<string, unknown>;
    isServer: boolean;
  };

  type SchemaItemArgParams = {
    label: string | undefined;
    actionType: ActionType;
  };

  type AbstractMessage = {
    type: "e" | "w" | "i";
    label: string | undefined;
    name: string | undefined;
    actionType: ActionType | undefined;
  };

  type I18nMessageMap = {
    [K in I18nTextKey]: AbstractMessage & {
      key: K;
      code?: string;
      params?: Omit<I18nReplaceParams<K>, "label">;
      otype: "i18n";
      message?: never;
    };
  };

  type I18nMessage<K extends I18nTextKey = I18nTextKey> = I18nMessageMap[K];

  type CustomMessage = AbstractMessage & {
    code?: string;
    message: string;
    otype?: never;
  };

  type ValidationMessage =
    | import("./string").StringSchemaMessage
    | import("./number").NumberSchemaMessage
    | import("./enum").EnumSchemaMessage
    | import("./boolean").BooleanSchemaMessage
    | import("./date").DateSchemaMessage
    | import("./date").SplitDateSchemaMessage
    | import("./datetime").DateTimeSchemaMessage
    | import("./datetime").SplitDateTimeSchemaMessage
    | import("./month").MonthSchemaMessage
    | import("./month").SplitMonthSchemaMessage
    | import("./file").FileSchemaMessage
    | import("./array").ArraySchemaMessage
    | import("./object").ObjectSchemaMessage
    ;

  type Message =
    | I18nMessage
    | CustomMessage
    | ValidationMessage
    ;

  type InitializeArgParams = InjectParams & { name?: string; };

  type ParserResult<Value> = {
    value: Nullable<Value>;
    messages?: Message[];
  };

  type ParseArgParams = InjectParams & { name?: string; };

  type Parser<Value> =
    (value: unknown, params: ParseArgParams) => ParserResult<Value>;

  type RecordMessages = Record<string, Message[] | undefined>;

  type ParseResult<Value> = {
    value: Nullable<Value>;
    messages?: RecordMessages;
  };

  type ValidationArgParams = InjectParams & { name?: string; };

  type ValidationValue<SettingsValue> =
    | Nullable<SettingsValue>
    | ((params: InjectParams) => Nullable<SettingsValue>)
    ;

  type ParamsField<Params extends Record<string, unknown>> = keyof Params extends never
    ? { params?: Params; } // キー0個なら任意
    : { params: Params; }; // キー1個以上なら必須

  type ValidationResultArgParams<
    const Value = null | undefined,
    const Params extends Record<string, unknown> = {}
  > =
    & ValidationArgParams
    & SchemaItemArgParams
    & { value: Value; }
    & ParamsField<Params>
    ;

  type ValidationCustomMessage<
    const Value,
    const Params extends Record<string, unknown> = {},
    const Msg extends Message = Message
  > =
    | string
    | I18nMessage
    | CustomMessage
    | ((params: ValidationResultArgParams<Value, Params>) => (string | Message | Msg | null));

  type Validation<
    const SettingsValue,
    const ResultArgValue,
    const UsedParams extends Record<string, unknown> = {}
  > =
    | ValidationValue<SettingsValue>
    | [
      ValidationValue<SettingsValue>,
      ValidationCustomMessage<ResultArgValue, UsedParams>?
    ];

  type ValidationEntry<
    const SettingsValue = unknown,
    const ResultArgValue = unknown,
    const Params extends Record<string, unknown> = {}
  > = {
    settings: SettingsValue;
    result: ResultArgValue;
    params: Params;
  };

  type ValidationSchema = Record<string, ValidationEntry>;

  type Validations<
    Schema extends ValidationSchema
  > = { [K in keyof Schema]?: Validation<Schema[K]["settings"], Schema[K]["result"], Schema[K]["params"]>; };

  type ValidationMessages<
    Schema extends ValidationSchema,
    OType extends string,
    Extra extends Record<string, unknown> = never
  > =
    | (AbstractMessage & {
      code: "parse";
      otype: OType;
      message?: never;
    })
    | (AbstractMessage & {
      otype: OType;
      message?: never;
    } & Extra)
    | {
      [K in keyof Schema]: AbstractMessage & {
        code: K;
        otype: OType;
        message?: never;
      } & ParamsField<Schema[K]["params"]>;
    }[keyof Schema];

  type ExtractCodeFromOType<OType extends ValidationMessage["otype"]> = Extract<ValidationMessage, { otype: OType; }> extends infer M
    ? (M extends { code: infer C extends string; } ? C : never)
    : never;

  type ExtractParamsFromOTypeAndCode<
    OType extends Message["otype"],
    Code extends string
  > = Extract<ValidationMessage, { otype: OType; code: Code; }> extends infer M
    ? (M extends { params: infer P; } ? P : {})
    : {};

  type ValidationResult<T> =
    T extends string | I18nMessage | CustomMessage | undefined ? undefined :
    (p: Parameters<T>[0]) => (Exclude<ReturnType<T>, string | I18nMessage | CustomMessage> | null)
    ;

  type ValidationArray<T extends Validation<unknown, unknown>> =
    T extends Array<unknown> ? [T[0], ValidationResult<T[1]>] : [T];

  type ValidationArrayAsArray<T extends Validation<unknown | Array<unknown>, never>> =
    T extends ((params: never) => unknown) ? [T] :
    T extends Array<unknown> ? (
      T[0] extends ((params: never) => unknown) ? [T[0]] :
      [T[0], ValidationResult<Exclude<T[1], T[0]>>]
    ) : [undefined];

  type RuleArgParamsAsValidation<Value> = InjectParams & SchemaItemArgParams & {
    value: Value;
    name?: string | undefined;
  };

  type RuleArgParams<Value> = InjectParams & SchemaItemArgParams & {
    value: Nullable<Value>;
    name?: string | undefined;
  };

  type Rule<Value> = (params: RuleArgParams<Value>) => (Message | null);

  type SchemaItemAbstractProps = Partial<SchemaItemArgParams> & {
    refs?: string[];
    mode?: (params: InjectParams) => Mode;
  };

  type SourceItem<const Value> = {
    value: Value;
    text?: string;
    node?: React.ReactNode;
  };

  type InferRequired<R> = R extends Array<unknown> ? R[0] : R;

  type RemoveIndexSignature<T> = {
    [K in keyof T as (
      string extends K ? never :
      number extends K ? never :
      symbol extends K ? never :
      K
    )]: T[K];
  };

  type $Date = import("../../objects/timestamp").$Date;
  type $Month = import("../../objects/timestamp").$Month;
  type $DateTime = import("../../objects/timestamp").$DateTime;

  type SchemaItem = import("./core").SchemaItem;
  type FormItem<S extends SchemaItem> = import("./form").FormItem<S>;

  type InferRequiredValue<R, V, Strict> =
    R extends true ? (Strict extends true ? V : Nullable<V>) : Nullable<V>;

  type InferArrayChild<S extends import("./array").$ArrSchema<any, any>> = S["child"];
  type InferObjectChildren<S extends import("./object").$ObjSchema<any, any>> = S["children"];

  type InferValue<P extends SchemaItem, Strict extends boolean = false> =
    P extends import("./string").$StrSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, string, Strict> :
    P extends import("./number").$NumSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, number, Strict> :
    P extends import("./enum").$EnumSchema<any, any> ? InferRequiredValue<
      InferRequired<P["props"]["required"]>,
      Exclude<P["items"], undefined>[number]["value"],
      Strict
    > :
    P extends import("./boolean").$BoolSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]> extends true | "nonFalse" ? true : false, P["trueValue"] | P["falseValue"], Strict> :
    P extends import("./date").$DateSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, $Date, Strict> :
    P extends import("./date").$SplitDateSchema<any, any> ? InferRequiredValue<
      InferRequired<P["props"]["required"]> extends boolean ? InferRequired<P["props"]["required"]> : InferRequired<P["base"]["props"]["required"]>,
      number,
      Strict
    > :
    P extends import("./datetime").$DateTimeSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, $Date, Strict> :
    P extends import("./datetime").$SplitDateTimeSchema<any, any> ? InferRequiredValue<
      InferRequired<P["props"]["required"]> extends boolean ? InferRequired<P["props"]["required"]> : InferRequired<P["base"]["props"]["required"]>,
      number,
      Strict
    > :
    P extends import("./month").$MonthSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, $Date, Strict> :
    P extends import("./month").$SplitMonthSchema<any, any> ? InferRequiredValue<
      InferRequired<P["props"]["required"]> extends boolean ? InferRequired<P["props"]["required"]> : InferRequired<P["base"]["props"]["required"]>,
      number,
      Strict
    > :
    P extends import("./file").$FileSchema<any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, File | string, Strict> :
    P extends import("./array").$ArrSchema<any, any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, InferValue<InferArrayChild<P>, Strict>[], Strict> :
    P extends import("./object").$ObjSchema<any, any> ? InferRequiredValue<InferRequired<P["props"]["required"]>, Infer<InferObjectChildren<P>, Strict>, Strict> :
    never
    ;

  type Infer<
    const P extends SchemaItem | Record<string, SchemaItem>,
    Strict extends boolean = false
  > = P extends SchemaItem
    ? InferValue<P, Strict>
    : (
      Strict extends true ? (
        { [K in keyof RemoveIndexSignature<P>]: InferValue<RemoveIndexSignature<P>[K], Strict> }
      ) : (
        { [K in keyof RemoveIndexSignature<P>]?: InferValue<RemoveIndexSignature<P>[K], Strict> }
      )
    );

  type ObjectFormItems<S extends import("./object").$ObjSchema<any, any>> = { [K in keyof InferObjectChildren<S>]: FormItem<InferObjectChildren<S>[K]> };

  type InferFormItems<S extends SchemaItem> =
    S extends import("./object").$ObjSchema<any, any> ? { [K in keyof InferObjectChildren<S>]: InferFormItems<InferObjectChildren<S>[K]> } :
    S extends import("./array").$ArrSchema<any, any> ? InferFormItems<InferArrayChild<S>> :
    FormItem<S>;

}
