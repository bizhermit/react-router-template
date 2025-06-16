import { getValidationArray } from "./utilities";

const TRUE = true;
const FALSE = false;

export function $bool<Props extends Schema.BooleanProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.BooleanValue>> = [];
  type TrueValue = Props extends undefined ? typeof TRUE : (Props extends { trueValue: infer T } ? (T extends Schema.BooleanValue ? T : typeof TRUE) : typeof TRUE);
  type FalseValue = Props extends undefined ? typeof FALSE : (Props extends { falseValue: infer F } ? (F extends Schema.BooleanValue ? F : typeof FALSE) : typeof FALSE)
  const trueValue = (props?.trueValue ?? TRUE) as TrueValue;
  const falseValue = (props?.falseValue ?? FALSE) as FalseValue;

  const [required, getRequiredMessage] = getValidationArray(props?.required);

  if (required) {
    const requiredAllowFalse = props?.requiredAllowFalse ?? false;
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
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
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: (props?.parser as Schema.Parser<TrueValue | FalseValue> | undefined) ?? function ({ value, env }) {
      const s = String(value);
      if (s === String(trueValue)) {
        return { value: trueValue };
      }
      if (s === String(falseValue)) {
        return { value: falseValue };
      }
      if (value == null || value === "") {
        return { value: undefined };
      }
      const ls = s.toLowerCase();
      if (ls === "on") {
        return { value: trueValue };
      }
      if (ls === "off") {
        return { value: falseValue };
      }
      return {
        value: undefined,
        result: {
          type: "e",
          code: "parse",
          message: env.t("真偽値に変換できません。"),
        },
      };
    },
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    getSource: function (params: { env: Schema.Env }) {
      function getText(v: any) {
        if (v == null) return undefined;
        return params.env.t(String(v));
      };
      return [
        {
          value: trueValue,
          text: getText(props?.trueText) ?? getText(trueValue) ?? "",
        },
        {
          value: falseValue,
          text: getText(props?.falseText) ?? getText(falseValue) ?? "",
        },
      ] as const;
    },
  } as const satisfies Schema.$Boolean<typeof trueValue, typeof falseValue>;
};
