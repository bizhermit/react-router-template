import { getValidationArray } from "./utilities";

function STRUCT_PARSER({
  value,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Schema.ParserParams): Schema.ParserResult<Record<string, any>, Schema.StructValidationResult> {
  return { value: value as Record<string, unknown> };
};

export function $struct<Props extends Schema.StructProps>(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validators: Array<Schema.Validator<Record<string, any>, Schema.Result>> = [];

  const actionType = props.actionType ?? "set";
  const [required, getRequiredMessage] = getValidationArray(props?.required);

  const baseResult = {
    label: props?.label,
    otype: "struct",
    type: "e",
    actionType,
  } as const satisfies Pick<Schema.StructValidationResult, "type" | "label" | "actionType" | "otype">;

  if (required) {
    const getMessage: Schema.CustomValidationMessageOrDefault<typeof getRequiredMessage> =
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

  if (props.validators) {
    (validators as typeof props.validators).push(...props.validators);
  }

  return {
    type: "struct",
    actionType,
    props: props.props as Props["props"],
    key: typeof props.key === "string" ? () => (props.key as string) : props.key,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: (props.parser as Schema.Parser<Schema.SchemaValue<Props["props"]>>) ?? STRUCT_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
  } as const satisfies Schema.$Struct<Props["props"]>;
};

export function trimStruct<T extends Record<string, unknown> = Record<string, unknown>>(
  struct: Record<string, unknown> | null | undefined
) {
  const ret: Record<string, unknown> = {};
  if (!struct) return ret as T;
  Object.entries(struct).forEach(([k, v]) => {
    if (v == null) return;
    ret[k] = v;
  });
  return ret as T;
};
