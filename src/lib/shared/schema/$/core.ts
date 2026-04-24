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
  ): $Schema.Message[] {
    if (this.validators == null) throw new Error("not initialized: validators");

    const ruleArgParams = {
      ...params,
      label: this.getLabel(),
      actionType: this.getActionType(),
      value: value,
    } as const satisfies $Schema.RuleArgParams<Value>;

    for (const vali of this.validators) {
      const msg = vali(ruleArgParams);
      if (msg) return [msg];
    }
    return [];
  }

}
