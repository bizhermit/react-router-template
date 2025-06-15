import { getValidationArray } from "./utilities";

function STRUCT_PARSER({ value }: Schema.ParserParams): Schema.ParserResult<Record<string, any>> {
  return { value };
};

export function $struct<Props extends Schema.StructProps>(props: Props) {
  const validators: Array<Schema.Validator<Record<string, any>>> = [];

  const [required, getRequiredMessage] = getValidationArray(props?.required);

  if (required) {
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t("入力してください。");

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
    props: props.props as Props["props"],
    parser: (props.parser as Schema.Parser<Schema.SchemaValue<Props["props"]>>) ?? STRUCT_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
  } as const satisfies Schema.$Struct<Props["props"]>;
};
