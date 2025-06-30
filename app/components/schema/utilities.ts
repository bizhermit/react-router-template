export function getValidationArray<T extends Schema.Validation<any, any>>(validation: T) {
  type U = Schema.ValidationArray<T>;
  if (validation == null) return [undefined] as U;
  if (Array.isArray(validation)) return validation as U;
  return [validation] as U;
};

export function getRequiredTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>): I18nTextKey {
  return `required_${actionType}`;
};

export function getInvalidValueTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>): I18nTextKey {
  return `invalidValue_${actionType}`;
};