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
    } as Props;
    return {
      ...overwritedProps,
      ...fixedProps,
      overwrite: getSchemaItemPropsGenerator<FixedProps, ArgProps, Props>(fixedProps, overwritedProps),
    } as const;
  };
};
