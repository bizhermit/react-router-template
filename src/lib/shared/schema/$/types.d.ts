namespace $Schema {

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
  };

  type I18nMessage<K extends I18nTextKey = I18nTextKey> = AbstractMessage & {
    key: K;
    code?: string;
    params?: Omit<I18nReplaceParams<K>, "label">;
    otype?: never;
  };

  type CustomMessage = AbstractMessage & {
    code?: string;
    message: string;
    otype?: never;
  };

  type ValidationMessage<
    Params extends Record<string, unknown> = {}
  > = AbstractMessage & {
    code: string;
    otype: string;
  } & ParamsField<Params>;

  type Message =
    | I18nMessage
    | CustomMessage
    | ValidationMessage
    ;

  type ParseResult<Value> = {
    value: Nullable<Value>;
    messages?: Message[];
  };

  type ParseArgParams = InjectParams & { name?: string; };

  type Parser<Value> =
    (value: unknown, params: ParseArgParams) => ParseResult<Value>;

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

  type ValidationItem<
    const SettingsValue,
    const ResultArgValue,
    const UsedParams extends Record<string, unknown> = {}
  > =
    | ValidationValue<SettingsValue>
    | [
      ValidationValue<SettingsValue>,
      ValidationCustomMessage<ResultArgValue, UsedParams, ValidationMessage<UsedParams>>?
    ]
    ;

  type ValidationResult<T> =
    T extends string | I18nMessage | CustomMessage | undefined ? undefined :
    (p: Parameters<T>[0]) => (Exclude<ReturnType<T>, string | I18nMessage | CustomMessage> | null)
    ;

  type ValidationArray<T extends ValidationItem<unknown, unknown>> =
    T extends Array<unknown> ? [T[0], ValidationResult<T[1]>] : [T];

  type ValidationArrayAsArray<T extends ValidationItem<unknown | Array<unknown>, never>> =
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

  type SchemaItemInterfaceProps<Value> = {
    type: string;
    parse: (value: unknown, params?: ParseArgParams) => ParseResult<Value>;
    validate: (value: Nullable<Value>, params?: ValidationArgParams) => Message[];
    getActionType: () => ActionType;
    _validators: null | Rule<Value>[];
  } & Record<string, unknown>;

  type SourceItem<const Value> = {
    value: Value;
    text?: string;
    node?: React.ReactNode;
  };

  type InferRequired<R> = R extends Array<unknown> ? R[0] : R;

  type $Date = import("../../objects/timestamp").$Date;
  type $Month = import("../../objects/timestamp").$Month;
  type $DateTime = import("../../objects/timestamp").$DateTime;

  type InferValue<P, Strict extends boolean = false> =
    P extends { type: infer T; required?: infer R; } ? (
      T extends "str" ? InferRequired<R> extends true ? (Strict extends true ? string : Nullable<string>) : Nullable<string> :
      T extends "num" ? InferRequired<R> extends true ? (Strict extends true ? number : Nullable<number>) : Nullable<number> :
      T extends "bool" ? P extends { trueValue: infer TV; falseValue: infer FV; } ? InferRequired<R> extends true | "nonFalse" ? (Strict extends true ? (TV | FV) : Nullable<TV | FV>) : Nullable<(TV | FV)> : InferRequired<R> extends true | "nonFalse" ? boolean : Nullable<boolean> :
      T extends "src" ? P extends { items: readonly { value: infer V; }[]; } ? InferRequired<R> extends true ? (Strict extends true ? V : Nullable<V>) : Nullable<V> : never :
      T extends "date" ? InferRequired<R> extends true ? (Strict extends true ? $Date : Nullable<$Date>) : Nullable<$Date> :
      T extends "date-s" ? InferRequired<R> extends true ? (Strict extends true ? number : Nullable<number>) : Nullable<number> :
      T extends "month" ? InferRequired<R> extends true ? (Strict extends true ? $Month : Nullable<$Month>) : Nullable<$Month> :
      T extends "month-s" ? InferRequired<R> extends true ? (Strict extends true ? number : Nullable<number>) : Nullable<number> :
      T extends "datetime" ? InferRequired<R> extends true ? (Strict extends true ? $DateTime : Nullable<$DateTime>) : Nullable<$DateTime> :
      T extends "datetime-s" ? InferRequired<R> extends true ? (Strict extends true ? number : Nullable<number>) : Nullable<number> :
      T extends "file" ? InferRequired<R> extends true ? (Strict extends true ? File | string : Nullable<File | string>) : Nullable<File | string> :
      T extends "arr" ? P extends { prop: infer Prop; } ? (InferRequired<R> extends true ? (Strict extends true ? InferValue<Prop>[] : Nullable<InferValue<Prop>[]>) : Nullable<InferValue<Prop>[]>) : never :
      T extends "obj" ? (InferRequired<R> extends true ? (Strict extends true ? Infer<P> : Nullable<Infer<P>>) : Nullable<Infer<P>>) :
      never
    ) : never;

  type Infer<P, Strict extends boolean = false> = P extends { type: "obj"; props: infer Props; }
    ? { [K in keyof Props]: InferValue<Props[K], Strict> }
    : InferValue<P, Strict>;

}
