/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class SchemaItem<Value = any> {

  protected validators: $Schema.Rule<Value>[] | null;

  constructor() {
    this.validators = null;
  }

  protected getEmptyInjectParams() {
    return {
      data: {},
      isServer: typeof window === "undefined",
      values: {},
    } as const satisfies $Schema.InjectParams;
  }

  abstract getActionType(): $Schema.ActionType;

  abstract getLabel(): string | undefined;

  abstract parse(value: any, params?: $Schema.ParseArgParams): $Schema.ParseResult<Value>;

  public validate(
    value: $Schema.Nullable<Value>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.RecordMessages {
    if (this.validators == null) throw new Error("not initialized: validators");

    const ruleArgParams = {
      ...params,
      label: this.getLabel(),
      actionType: this.getActionType(),
      value: value,
    } as const satisfies $Schema.RuleArgParams<Value>;

    for (const validator of this.validators) {
      const msg = validator(ruleArgParams);
      if (msg) return { [params.name || ""]: [msg] };
    }
    return { [params.name || ""]: undefined };
  }

};

export function optimizeValidationMessage<
  T extends string | $Schema.Message | ((params: never) => unknown)
>(m: T | null | undefined): $Schema.ValidationResult<T> | undefined {
  if (m == null) return undefined;
  type U = $Schema.ValidationResult<T>;
  type Params = T extends (params: infer P) => unknown
    ? P
    : $Schema.ValidationResultArgParams<Record<string, unknown>>;
  if (typeof m === "string") {
    return ((params: Params) => {
      return {
        type: "e",
        label: params.label,
        message: m,
        name: params.name,
        actionType: params.actionType,
      } as const satisfies $Schema.Message;
    }) as U;
  }
  if (typeof m === "function") {
    const fn = m as unknown as (params: Params) => string | $Schema.Message | null;
    return ((params: Params) => {
      const ret = fn(params);
      if (typeof ret === "string") {
        return {
          type: "e",
          label: params.label,
          message: ret,
          name: params.name,
          actionType: params.actionType,
        } as const satisfies $Schema.Message;
      }
      return ret;
    }) as U;
  }
  return (() => m) as unknown as U;
};

export function getValidationArray<
  T extends $Schema.Validation<unknown, unknown>
>(validation: T, initValue?: $Schema.ValidationArray<T>[0]): $Schema.ValidationArray<T> {
  type U = $Schema.ValidationArray<T>;
  if (validation == null) return [initValue] as U;
  if (Array.isArray(validation)) {
    const [v, m] = validation;
    return [v ?? initValue, optimizeValidationMessage(m)] as U;
  }
  return [validation ?? initValue] as U;
};

export function getValidationArrayAsArray<
  T extends $Schema.Validation<unknown | Array<unknown>, never> = $Schema.Validation<Array<unknown>, unknown>
>(validation: T): $Schema.ValidationArrayAsArray<T> {
  type U = $Schema.ValidationArrayAsArray<T>;
  if (validation == null) return [undefined] as U;
  if (typeof validation === "function") return [validation] as U;
  if (Array.isArray(validation)) {
    const [v, m] = validation;
    if (Array.isArray(v) || typeof v === "function") {
      return [v, optimizeValidationMessage(
        m as string | $Schema.Message | ((params: never) => unknown) | undefined
      )] as unknown as U;
    }
    return [validation] as U;
  }
  throw new Error(`validation value is not array type`);
};

export function getPickMessageGetter<const OType extends $Schema.ValidationMessage["otype"]>(otype: OType) {
  return function pickMessage<
    const Code extends $Schema.ExtractCodeFromOType<OType>,
    const Params extends Pick<$Schema.ValidationResultArgParams<unknown, $Schema.ExtractParamsFromOTypeAndCode<OType, Code>>, "actionType" | "name" | "label" | "params">
  >(code: Code, params: Params) {
    return {
      type: "e",
      code,
      otype,
      actionType: params.actionType,
      label: params.label,
      name: params.name,
      params: params.params as Params["params"],
    } as const satisfies $Schema.AbstractMessage & {
      code: Code;
      otype: OType;
      params: Params["params"];
    };
  };
};
