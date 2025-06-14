export function $num<Props extends Schema.NumericProps>(props?: Props) {
  const validators: Array<Schema.Validator<number>> = [];

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "num",
    source: props?.source
  } as const;
};
