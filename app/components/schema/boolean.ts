import { getValidationArray } from "./utilities";

const TRUE = true;
const FALSE = false;

export function $bool<Props extends Schema.BooleanProps>(props?: Props) {
  const validators: Array<Schema.Validator<Schema.BooleanValue, Schema.Result>> = [];
  type TrueValue = Props extends undefined ? typeof TRUE :
    (Props extends { trueValue: infer T; } ?
      (T extends Schema.BooleanValue ? T : typeof TRUE) :
      typeof TRUE
    );
  type FalseValue = Props extends undefined ? typeof FALSE :
    (Props extends { falseValue: infer F; } ?
      (F extends Schema.BooleanValue ? F : typeof FALSE) :
      typeof FALSE
    );
  const trueValue = (props?.trueValue ?? TRUE) as TrueValue;
  const falseValue = (props?.falseValue ?? FALSE) as FalseValue;

  const actionType = props?.actionType ?? "select";
  const [required, getRequiredMessage] = getValidationArray(props?.required);

  const baseResult = {
    label: props?.label,
    otype: "bool",
    type: "e",
    actionType,
  } as const satisfies Pick<Schema.BooleanValidationResult, "type" | "label" | "actionType" | "otype">;

  if (required) {
    const requiredAllowFalse = props?.requiredAllowFalse ?? false;
    const getMessage: Schema.ResultGetter<typeof getRequiredMessage> =
      getRequiredMessage ??
      (() => ({
        ...baseResult,
        code: "required",
      }));

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (requiredAllowFalse && p.value === falseValue) return null;
        if (p.value === trueValue) return null;
        return getMessage(p);
      });
    } else {
      validators.push((p) => {
        if (requiredAllowFalse && p.value === falseValue) return null;
        if (p.value === trueValue) return null;
        return getMessage(p);
      });
    }
  };

  if (props?.validators) {
    (validators as typeof props.validators).push(...props.validators);
  }

  return {
    type: "bool",
    actionType,
    trueValue,
    falseValue,
    trueText: props?.trueText,
    falseText: props?.falseText,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: (props?.parser as Schema.Parser<TrueValue | FalseValue> | undefined) ??
      function ({ value }) {
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
            ...baseResult,
            code: "parse",
          },
        };
      },
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
  } as const satisfies Schema.$Boolean<typeof trueValue, typeof falseValue>;
};
