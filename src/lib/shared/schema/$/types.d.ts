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
    | import("./string").StringValidationMessage
    | import("./number").NumberValidationMessage
    | import("./source").SourceValidationMessage
    | import("./boolean").BooleanValidationMessage
    | import("./date").DateValidationMessage
    | import("./date").SplitDateValidationMessage
    | import("./month").MonthValidationMessage
    | import("./month").SplitMonthValidationMessage
    | import("./datetime").DateTimeValidationMessage
    | import("./file").FileValidationMessage
    | import("./array").ArrayValidationMessage
    | import("./object").ObjectValidationMessage
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

  type ValidationValue<SettingsValue> =
    | Nullable<SettingsValue>
    | ((params: ArgParams) => Nullable<SettingsValue>)
    ;

  type ValidationResultArgParams<
    const Value,
    const ValidationAddonValues extends Record<string, unknown> = {}
  > = ValidationArgParams<Value> & (
    ValidationAddonValues extends undefined ? {} : { validationValues: ValidationAddonValues; }
  );

  type ValidationCustomMessage<
    const Value,
    const ValidationAddonValues extends Record<string, unknown> = {},
    const Msg extends Message = Message
  > = (params: ValidationResultArgParams<Value, ValidationAddonValues>) => (string | Message | Msg | null);

  type Validation<
    const Value,
    const SettingsValue,
    const ValidationAddonValues extends Record<string, unknown> | undefined = undefined,
    const Msg extends Message = Message
  > =
    | ValidationValue<SettingsValue>
    | [ValidationValue<SettingsValue>, (
      | string
      | Msg
      | ValidationCustomMessage<Value, ValidationAddonValues, Msg>
    )?]
    ;

  type ValidationResult<T> =
    T extends string | Message | undefined ? undefined :
    (p: Parameters<T>[0]) => (Extract<ReturnType<T>, Message> | null)
    ;

  type ValidationArray<T extends Validation<unknown, unknown>> =
    T extends Array<unknown> ? [T[0], ValidationResult<T[1]>] : [T];

  type ValidationArrayAsArray<T extends Validation<never, unknown | Array<unknown>>> =
    T extends ((params: never) => unknown) ? [T] :
    T extends Array<unknown> ? (
      T[0] extends ((params: never) => unknown) ? [T[0]] :
      [T[0], ValidationResult<Exclude<T[1], T[0]>>]
    ) : [undefined];

  type ValidationMessageGetter<T> =
    (p: Exclude<Parameters<Exclude<T, undefined>>[0], undefined>) => ReturnType<Exclude<T, undefined>>;

  type RuleArgParams<Value> = ArgParams & {
    value: Nullable<Value>;
  };

  type Rule<Value> = (params: RuleArgParams<Value>) => (Message | null);

  type SchemaItemAbstractProps = {
    label?: string;
    refs?: string[];
    mode?: (params: ArgParams) => Mode;
    actionType?: ActionType;
  };

  type SchemaItemInterfaceProps<Value, AbstractTypeMessage> = {
    type: string;
    parse: Parser<Value>;
    validate: (params: ValidationArgParams<Value>) => (Message | null);
    getActionType: () => ActionType;
    getCommonTypeMessageParams: () => AbstractTypeMessage;
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

  type InferValue<P> =
    P extends { type: infer T; required?: infer R; } ? (
      T extends "str" ? InferRequired<R> extends true ? string : Nullable<string> :
      T extends "num" ? InferRequired<R> extends true ? number : Nullable<number> :
      T extends "bool" ? P extends { trueValue: infer TV; falseValue: infer FV; } ? InferRequired<R> extends true | "nonFalse" ? (TV | FV) : Nullable<(TV | FV)> : InferRequired<R> extends true | "nonFalse" ? boolean : Nullable<boolean> :
      T extends "src" ? P extends { items: readonly { value: infer V; }[]; } ? InferRequired<R> extends true ? V : Nullable<V> : never :
      T extends "date" ? InferRequired<R> extends true ? $Date : Nullable<$Date> :
      T extends "date-s" ? InferRequired<R> extends true ? number : Nullable<number> :
      T extends "month" ? InferRequired<R> extends true ? $Month : Nullable<$Month> :
      T extends "month-s" ? InferRequired<R> extends true ? number : Nullable<number> :
      T extends "datetime" ? InferRequired<R> extends true ? $DateTime : Nullable<$DateTime> :
      T extends "datetime-s" ? InferRequired<R> extends true ? number : Nullable<number> :
      T extends "file" ? InferRequired<R> extends true ? File | string : Nullable<File | string> :
      T extends "arr" ? P extends { prop: infer Prop; } ? (InferRequired<R> extends true ? InferValue<Prop>[] : Nullable<InferValue<Prop>[]>) : never :
      T extends "obj" ? (InferRequired<R> extends true ? Infer<P> : Nullable<Infer<P>>) :
      never
    ) : never;

  type Infer<P> = P extends { type: "obj"; props: infer Props; } ? { [K in keyof Props]: InferValue<Props[K]> } : InferValue<P>;

}
