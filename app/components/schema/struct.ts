import { getRequiredTextKey, getValidationArray } from "./utilities";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function STRUCT_PARSER({ value }: Schema.ParserParams): Schema.ParserResult<Record<string, any>> {
  return { value: value as Record<string, unknown> };
};

export function $struct<Props extends Schema.StructProps>(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validators: Array<Schema.Validator<Record<string, any>>> = [];

  const actionType = props.actionType ?? "set";
  const [required, getRequiredMessage] = getValidationArray(props?.required);

  if (required) {
    const textKey = getRequiredTextKey(actionType);
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
      });

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null) {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null) {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    }
  };

  if (props.validators) {
    validators.push(...props.validators);
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
