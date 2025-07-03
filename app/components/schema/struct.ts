import { getRequiredTextKey, getValidationArray } from "./utilities";

function STRUCT_PARSER({ value }: Schema.ParserParams): Schema.ParserResult<Record<string, unknown>> {
  return { value };
};

export function $struct<Props extends Schema.StructProps>(props: Props) {
  const validators: Array<Schema.Validator<Record<string, unknown>>> = [];

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
    validators.push(...props.validators as typeof validators);
  }

  return {
    type: "struct",
    actionType,
    props: props.props as Props["props"],
    key: props.key,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: (props.parser ?? STRUCT_PARSER) as Schema.Parser<Schema.SchemaValue<Props["props"]>>,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
  } as const satisfies Schema.$Struct<Props["props"]>;
};
