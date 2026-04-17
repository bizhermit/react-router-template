namespace $Schema {

  type Nullable<T> = T | null | undefined;

  type Mode = "enabled" | "disabled" | "readonly" | "hidden";
  type ActionType = "input" | "select" | "set";

  type ArgParams = {
    name: string;
    label: string | undefined;
    actionType: ActionType;
    values: Record<string, unknown>;
    data: Record<string, unknown>;
    isServer: boolean;
  };

  type AbstractMessage = {
    type: "e" | "w" | "i";
    label: string | undefined;
    actionType?: ActionType;
  };

  type I18nMessage<K extends I18nTextKey = I18nTextKey> = AbstractMessage & {
    key: K;
    params?: Omit<I18nReplaceParams<K>, "label">;
  };

  type CustomMessage = AbstractMessage & {
    code?: string;
    message: string;
  };

  type Message =
    | I18nMessage
    | CustomMessage
    ;

  type ParseResult<Value> = {
    value: Nullable<Value>;
    message?: Message | null;
  };

  type ParseArgParams = ArgParams & {
    value: unknown;
  };

  type Parser<Value> =
    (params: ParseArgParams) => ParseResult<Value>;

  type ValidationArgParams<Value> = ArgParams & {
    value: Nullable<Value>;
  };

  type ValidationValue<Value, SettingsValue> =
    | Nullable<SettingsValue>
    | ((params: ValidationArgParams<Value>) => Nullable<SettingsValue>)
    ;

  type ValidationCustomMessage<
    Value,
    ValidationAddonValues extends Record<string, unknown> = {},
    Msg extends AbstractMessage = Message
  > =
    (params: ValidationArgParams<Value> & (
      ValidationAddonValues extends undefined ? {} : { validationValues: ValidationAddonValues; }
    )) => (string | Message | Msg | null);

  type Validation<
    Value,
    SettingsValue,
    ValidationAddonValues extends Record<string, unknown> | undefined = undefined,
    Msg extends AbstractMessage = Message
  > =
    | ValidationValue<Value, SettingsValue>
    | [ValidationValue<Value, SettingsValue>, (
      | string
      | Message
      | Msg
      | ValidationCustomMessage<Value, ValidationAddonValues, Msg>
    )?]
    ;

  type ValidationResult<T> =
    T extends string | AbstractMessage | undefined ? undefined :
    (p: Parameters<T>[0]) => (Extract<ReturnType<T>, AbstractMessage> | null)
    ;

  type ValidationArray<T extends Validation<unknown, unknown>> =
    T extends Array<unknown> ? [T[0], ValidationResult<T[1]>] : [T];

  type ValidationMessageGetter<T> =
    (p: Exclude<Parameters<Exclude<T, undefined>>[0], undefined>) => ReturnType<Exclude<T, undefined>>;

  type RuleArgParams<Value> = ArgParams & {
    value: Nullable<Value>;
  };

  type Rule<Value> = (params: RuleArgParams<Value>) => (AbstractMessage | null);

  type SchemaItemAbstractProps = {
    label?: string;
    refs?: string[];
    mode?: (params: ArgParams) => Mode;
    actionType?: ActionType;
  };

  type SchemaItemInterfaceProps<Value> = {
    type: string;
    parse: Parser<Value>;
    validate: (params: ValidationArgParams<Value>) => (AbstractMessage | null);
    _validators: null | Rule<Value>[];
  };

  type SourceItem<const Value> = {
    value: Value;
    text?: string;
    node?: React.ReactNode;
  };

  type InferRequired<R> = R extends Array<unknown> ? R[0] : R;

  type InferValue<P> =
    P extends { type: infer T; required?: infer R; } ? (
      T extends "str" ? InferRequired<R> extends true ? string : Nullable<string> :
      T extends "num" ? InferRequired<R> extends true ? number : Nullable<number> :
      T extends "bool" ? P extends { trueValue: infer TV; falseValue: infer FV; } ? InferRequired<R> extends true | "nonFalse" ? (TV | FV) : Nullable<(TV | FV)> : InferRequired<R> extends true | "nonFalse" ? boolean : Nullable<boolean> :
      T extends "src" ? P extends { items: readonly { value: infer V; }[]; } ? InferRequired<R> extends true ? V : Nullable<V> : never :
      T extends "date" ? InferRequired<R> extends true ? $Date : Nullable<$Date> :
      T extends "month" ? InferRequired<R> extends true ? $Month : Nullable<$Month> :
      T extends "datetime" ? InferRequired<R> extends true ? $DateTime : Nullable<$DateTime> :
      T extends "file" ? InferRequired<R> extends true ? File : Nullable<File> :
      T extends "arr" ? P extends { prop: infer Prop; } ? (InferRequired<R> extends true ? InferValue<Prop>[] : Nullable<InferValue<Prop>[]>) : never :
      T extends "obj" ? (InferRequired<R> extends true ? Infer<P> : Nullable<Infer<P>>) :
      never
    ) : never;

  type Infer<P> = P extends { type: "obj"; props: infer Props; } ? { [K in keyof Props]: InferValue<Props[K]> } : InferValue<P>;

}
