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

export function getValidationArray<
  T extends $Schema.Validation<unknown, unknown>
>(validation: T): $Schema.ValidationArray<T> {
  type U = $Schema.ValidationArray<T>;
  if (validation == null) return [undefined] as U;
  if (Array.isArray(validation)) {
    const [v, m] = validation;
    if (m == null) return [v] as U;
    if (typeof m === "string") {
      return [
        v,
        (params: $Schema.ValidationArgParams<unknown>) => {
          return {
            type: "e",
            label: params.label,
            actionType: params.actionType,
            message: m,
          } as const satisfies $Schema.Message;
        },
      ] as U;
    }
    if (typeof m === "function") {
      return [
        v,
        (params: $Schema.ValidationArgParams<unknown>) => {
          const ret = m(params);
          if (typeof ret === "string") {
            return {
              type: "e",
              label: params.label,
              actionType: params.actionType,
              message: ret,
            } as const satisfies $Schema.Message;
          }
          return ret;
        },
      ] as U;
    }
    return [v, () => m] as unknown as U;
  }
  return [validation] as U;
};
