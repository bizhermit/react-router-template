import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_OBJECT = "obj";

type ObjectValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_OBJECT;
};
export type ObjectValidationMessage = ObjectValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
);

type ObjectOptions<Contents> = {
  props: Contents;
  parser?: $Schema.Parser<$Schema.InferValue<Contents>>;
  required?: $Schema.Validation<
    $Schema.Nullable<$Schema.InferValue<Contents>>,
    boolean,
    undefined,
    ObjectValidationMessage
  >;
  rules?: $Schema.Rule<$Schema.InferValue<Contents>>[];
};

type ObjectProps<Contents> = $Schema.SchemaItemAbstractProps & ObjectOptions<Contents>;

export function $object<
  const Contents,
  const P extends ObjectProps<Contents>
>(props: P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_OBJECT,
    props: props.props,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_OBJECT,
        label: this.label,
        actionType: this.getActionType(),
        type: "e",
      };
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      return { value: params.value as $Schema.InferValue<Contents> };
    },
    validate: function (params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = this.getCommonTypeMessageParams();

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              (() => ({
                ...commonMsgParams,
                code: "required",
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            }
          }
        }

        // rules
        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies ObjectProps<Contents> & $Schema.SchemaItemInterfaceProps<
    $Schema.InferValue<Contents>,
    ObjectValidationAbstractMessage
  >;

  return getSchemaItemPropsGenerator<typeof fixedProps, ObjectProps<Contents>, P>(fixedProps, props)({});
};
