import { parseNumber } from "../objects/numeric";
import { getValidationArray } from "./utilities";

function NUMBER_PARSER({
  value,
  label,
}: Schema.ParserParams): Schema.ParserResult<number, Schema.NumberValidationResult> {
  const [num, succeeded] = parseNumber(value);
  if (succeeded) return { value: num };
  return {
    value: num,
    result: {
      type: "e",
      label,
      otype: "num",
      code: "parse",
    } satisfies Schema.NumberValidationResult,
  };
};

export function $num<Props extends Schema.NumberProps>(props?: Props) {
  const validators: Array<Schema.Validator<number, Schema.Result>> = [];

  const actionType = props?.actionType ?? (props?.source ? "select" : "input");
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [min, getMinMessage] = getValidationArray(props?.min);
  const [max, getMaxMessage] = getValidationArray(props?.max);
  const [float, getFloatMessage] = getValidationArray(props?.float);
  const [sourceValidation, getSourceValidationMessage] = getValidationArray(props?.sourceValidation);

  const baseResult = {
    label: props?.label,
    otype: "num",
    type: "e",
    actionType,
  } as const satisfies Pick<Schema.NumberValidationResult, "type" | "label" | "actionType" | "otype">;

  if (required) {
    const getMessage: Schema.ResultGetter<typeof getRequiredMessage> =
      getRequiredMessage ??
      (() => ({
        ...baseResult,
        code: "required",
      }));

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null) {
          return getMessage(p);
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null) {
          return getMessage(p);
        }
        return null;
      });
    }
  };

  if (sourceValidation !== false && props?.source) {
    const source = props.source;
    const getMessage: Schema.ResultGetter<typeof getSourceValidationMessage> =
      getSourceValidationMessage ??
      (() => ({
        ...baseResult,
        code: "source",
      }));

    if (typeof source === "function") {
      validators.push((p) => {
        if (p.value == null) return null;
        const src = source(p);
        if (src.some(item => item.value === p.value)) return null;
        return getMessage({ ...p, source: src });
      });
    } else {
      validators.push((p) => {
        if (p.value == null) return null;
        if (source.some(item => item.value === p.value)) return null;
        return getMessage({ ...p, source });
      });
    }
  } else {
    if (min != null) {
      const getMessage: Schema.ResultGetter<typeof getMinMessage> =
        getMinMessage ??
        (({ min }) => ({
          ...baseResult,
          code: "min",
          min,
        }));

      if (typeof min === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const m = min(p);
          if (m <= p.value) return null;
          return getMessage({
            ...p,
            min: m,
          });
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          if (min <= p.value) return null;
          return getMessage({
            ...p,
            min,
          });
        });
      }
    }

    if (max != null) {
      const getMessage: Schema.ResultGetter<typeof getMaxMessage> =
        getMaxMessage ??
        (({ max }) => ({
          ...baseResult,
          code: "max",
          max,
        }));

      if (typeof max === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const m = max(p);
          if (p.value <= m) return null;
          return getMessage({
            ...p,
            max: m,
          });
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          if (p.value <= max) return null;
          return getMessage({
            ...p,
            max,
          });
        });
      }
    }

    if (float != null) {
      const getMessage: Schema.ResultGetter<typeof getFloatMessage> =
        getFloatMessage ??
        (({ float, currentFloat }) => ({
          ...baseResult,
          code: "float",
          float,
          currentFloat,
        }));

      if (typeof float === "function") {
        validators.push((p) => {
          if (p.value == null) return null;
          const f = float(p);
          const [_, n] = String(p.value).split(".");
          const cur = n?.length ?? 0;
          if (cur <= f) return null;
          return getMessage({
            ...p,
            float: f,
            currentFloat: cur,
          });
        });
      } else {
        validators.push((p) => {
          if (p.value == null) return null;
          const [_, n] = String(p.value).split(".");
          const cur = n?.length ?? 0;
          if (cur <= float) return null;
          return getMessage({
            ...p,
            float,
            currentFloat: cur,
          });
        });
      }
    }
  }

  if (props?.validators) {
    (validators as typeof props.validators).push(...props.validators);
  }

  return {
    type: "num",
    actionType,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? NUMBER_PARSER,
    source: props?.source as Schema.GetSource<Props["source"]>,
    sourceValidation: sourceValidation as Schema.GetValidationValue<Props, "sourceValidation">,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    min,
    max,
    float,
  } as const satisfies Schema.$Number;
};
