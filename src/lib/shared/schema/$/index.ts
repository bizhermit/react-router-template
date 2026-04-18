export function getSchemaItemPropsGenerator<
  const FixedProps extends Record<string, unknown>,
  const Props,
  const BaseProps
>(fixedProps: FixedProps, baseProps: BaseProps) {
  type ArgProps = Omit<Props, keyof FixedProps>;
  return function <OverwriteProps extends ArgProps>(overwriteProps: OverwriteProps) {
    type Props = Omit<BaseProps, keyof OverwriteProps> & OverwriteProps;
    const overwritedProps = {
      ...baseProps,
      ...overwriteProps,
      _validators: null,
    } as Props;
    return {
      ...overwritedProps,
      ...fixedProps,
      overwrite: getSchemaItemPropsGenerator<FixedProps, ArgProps, Props>(fixedProps, overwritedProps),
    } as const;
  };
};

export function optimizeValidationMessage<
  T extends string | $Schema.Message | ((params: never) => unknown)
>(m: T | null | undefined): $Schema.ValidationResult<T> | undefined {
  if (m == null) return undefined;
  type U = $Schema.ValidationResult<T>;
  type Params = T extends (params: infer P) => unknown
    ? P
    : $Schema.ValidationResultArgParams<unknown, Record<string, unknown>>;
  if (typeof m === "string") {
    return ((params: Params) => {
      return {
        type: "e",
        label: params.label,
        actionType: params.actionType,
        message: m,
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
          actionType: params.actionType,
          message: ret,
        } as const satisfies $Schema.Message;
      }
      return ret;
    }) as U;
  }
  return (() => m) as unknown as U;
};

export function getValidationArray<
  T extends $Schema.Validation<unknown, unknown>
>(validation: T): $Schema.ValidationArray<T> {
  type U = $Schema.ValidationArray<T>;
  if (validation == null) return [undefined] as U;
  if (Array.isArray(validation)) {
    const [v, m] = validation;
    return [v, optimizeValidationMessage(m)] as U;
  }
  return [validation] as U;
};
