export const DEFAULT_LABEL_KEY = "default_label";

function parseFunction(customValidationMessage: Schema.CustomValidationMessage<unknown>) {
  if (customValidationMessage == null) return undefined;
  switch (typeof customValidationMessage) {
    case "function": return customValidationMessage;
    case "string": return () => ({ type: "e", message: customValidationMessage });
    default: return () => customValidationMessage;
  }
}

export function getValidationArray<T extends Schema.Validation<unknown, unknown>>(validation: T) {
  type U = Schema.ValidationArray<T>;
  if (validation == null) return [undefined] as U;
  if (Array.isArray(validation)) return [validation[0], parseFunction(validation[1])] as U;
  return [validation] as U;
};

export function getRequiredTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>) {
  return `required_${actionType}` satisfies I18nTextKey;
};

export function getInvalidValueTextKey(actionType: NonNullable<Schema.BaseProps["actionType"]>) {
  return `invalidValue_${actionType}` satisfies I18nTextKey;
};
