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

export function getValidationValue<T extends Schema.$ValidationValue<unknown>>(
  params: Schema.DynamicValidationValueParams,
  validationValue: T,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type V = T extends ((...args: any[]) => infer V) ? V : T;
  if (validationValue == null) return undefined as V;
  if (typeof validationValue === "function") return validationValue(params) as V;
  return validationValue as V;
};
