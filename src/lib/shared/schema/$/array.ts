import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_ARRAY = "arr";

type ArrayValidation_LengthParams = { length: number; currentLength: number; };
type ArrayValidation_MinLengthParams = { minLength: number; currentLength: number; };
type ArrayValidation_MaxLengthParams = { maxLength: number; currentLength: number; };

type ArrayValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_ARRAY;
};
export type ArrayValidationMessage = ArrayValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "length"; } & ArrayValidation_LengthParams)
  | ({ code: "minLength"; } & ArrayValidation_MinLengthParams)
  | ({ code: "maxLength"; } & ArrayValidation_MaxLengthParams)
);

type ArrayOptions<Content> = {
  prop: Content;
  parser?: $Schema.Parser<$Schema.InferValue<Content>[]>;
  required?: $Schema.Validation<
    $Schema.Nullable<$Schema.InferValue<Content>[]>,
    boolean,
    undefined,
    ArrayValidationMessage
  >;
  length?: $Schema.Validation<
    $Schema.InferValue<Content>[],
    number,
    ArrayValidation_LengthParams,
    ArrayValidationMessage
  >;
  minLength?: $Schema.Validation<
    $Schema.InferValue<Content>[],
    number,
    ArrayValidation_MinLengthParams,
    ArrayValidationMessage
  >;
  maxLength?: $Schema.Validation<
    $Schema.InferValue<Content>[],
    number,
    ArrayValidation_MaxLengthParams,
    ArrayValidationMessage
  >;
  rules?: $Schema.Rule<$Schema.InferValue<Content>[]>[];
};

type ArrayProps<Content> = $Schema.SchemaItemAbstractProps & ArrayOptions<Content>;

export function $array<
  const Content,
  const P extends ArrayProps<Content>
>(props: P) {
  type Value = $Schema.InferValue<Content>[];

  const fixedProps = {
    type: "arr",
    prop: props.prop,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_ARRAY,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      if (Array.isArray(params.value)) {
        return { value: params.value as Value };
      }
      return { value: [params.value] as Value };
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

        // length
        if (this.length != null) {
          const [length, getLengthMessage] = getValidationArray(this.length);
          if (length != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getLengthMessage> =
              getLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "length",
                length: p.validationValues.length,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof length === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const len = length(p);
                if (len == null) return null;
                if (p.value.length === len) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    length: len,
                    currentLength: p.value.length,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.length === length) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    length,
                    currentLength: p.value.length,
                  },
                });
              });
            }
          }
        }

        // minLength
        if (this.minLength != null) {
          const [minLength, getMinLengthMessage] = getValidationArray(this.minLength);
          if (minLength != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinLengthMessage> =
              getMinLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minLength",
                minLength: p.validationValues.minLength,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof minLength === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const minLen = minLength(p);
                if (minLen == null) return null;
                if (minLen <= p.value.length) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    minLength: minLen,
                    currentLength: p.value.length,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (minLength <= p.value.length) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    minLength,
                    currentLength: p.value.length,
                  },
                });
              });
            }
          }
        }

        // maxLength
        if (this.maxLength != null) {
          const [maxLength, getMaxLengthMessage] = getValidationArray(this.maxLength);
          if (maxLength != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxLengthMessage> =
              getMaxLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxLength",
                maxLength: p.validationValues.maxLength,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof maxLength === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const maxLen = maxLength(p);
                if (maxLen == null) return null;
                if (p.value.length <= maxLen) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxLength: maxLen,
                    currentLength: p.value.length,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.length <= maxLength) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxLength: maxLength,
                    currentLength: p.value.length,
                  },
                });
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
  } as const satisfies ArrayProps<Content> & $Schema.SchemaItemInterfaceProps<Value, ArrayValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ArrayProps<Content>, P>(fixedProps, props)({});
};
