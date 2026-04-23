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
    : $Schema.ValidationResultArgParams<Record<string, unknown>>;
  if (typeof m === "string") {
    return ((params: Params) => {
      return {
        type: "e",
        label: params.label,
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
          message: ret,
        } as const satisfies $Schema.Message;
      }
      return ret;
    }) as U;
  }
  return (() => m) as unknown as U;
};

export function getValidationArray<
  T extends $Schema.ValidationItem<unknown, unknown>
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
  T extends $Schema.ValidationItem<unknown | Array<unknown>, never> = $Schema.ValidationItem<Array<unknown>, unknown>
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
