export function getValidationArray<T extends Schema.Validation<unknown, unknown>>(validation: T) {
  type U = Schema.ValidationArray<T>;
  if (validation == null) return [undefined] as U;
  if (Array.isArray(validation)) return validation as U;
  return [validation] as U;
};

export function getRequiredTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>) {
  return `required_${actionType}` satisfies I18nTextKey;
};

export function getInvalidValueTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>) {
  return `invalidValue_${actionType}` satisfies I18nTextKey;
};
