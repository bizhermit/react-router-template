import { getValidationArray } from "./utilities";

const TRUE = true;
const FALSE = false;

export function $bool<Props extends Schema.BooleanProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.BooleanValue>> = [];
  const trueValue = (props?.trueValue ?? TRUE) as Props extends undefined ? typeof TRUE : (Props extends { trueValue: infer T } ? (T extends Schema.BooleanValue ? T : typeof TRUE) : typeof TRUE);
  const falseValue = (props?.falseValue ?? FALSE) as Props extends undefined ? typeof FALSE : (Props extends { falseValue: infer F } ? (F extends Schema.BooleanValue ? F : typeof FALSE) : typeof FALSE);

  const [required, getRequiredMessage] = getValidationArray(props?.required);

  if (required) {
    const requiredAllowFalse = props?.requiredAllowFalse ?? false;
    const getMessage: Schema.MessageGetter<Schema.StringProps["required"]> = getRequiredMessage ?
      (p) => getRequiredMessage(p) :
      (p) => p.env.t("入力してください。");

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (requiredAllowFalse && p.value === falseValue) return null;
        if (p.value === trueValue) return null;
        return {
          type: "e",
          code: "required",
          message: getMessage(p),
        };
      });
    } else {
      validators.push((p) => {
        if (requiredAllowFalse && p.value === falseValue) return null;
        if (p.value === trueValue) return null;
        return {
          type: "e",
          code: "required",
          message: getMessage(p),
        };
      });
    }
  };

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "bool",
    trueValue,
    falseValue,
    validators,
    required: required as unknown as Schema.ValidationArray<Props["required"]>,
    getSource: function (params: { env: Schema.Env }) {
      function getText(v: any) {
        if (v == null) return undefined;
        return params.env.t(String(v));
      };
      return [
        {
          value: trueValue,
          text: getText(props?.trueText) ?? getText(trueValue),
        },
        {
          value: falseValue,
          text: getText(props?.falseText) ?? getText(falseValue),
        },
      ] as const;
    },
  } as const;
};
