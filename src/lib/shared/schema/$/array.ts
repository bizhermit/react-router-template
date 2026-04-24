import { getEmptyInjectParams, getPickMessageGetter, getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_ARRAY = "arr";

type Content = $Schema.SchemaItemInterfaceProps<unknown>;

type ArrayValidations<C extends Content> = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  length: $Schema.ValidationEntry<
    number,
    $Schema.InferValue<C>[],
    { length: number; currentLength: number; }
  >;
  minLength: $Schema.ValidationEntry<
    number,
    $Schema.InferValue<C>[],
    { minLength: number; currentLength: number; }
  >;
  maxLength: $Schema.ValidationEntry<
    number,
    $Schema.InferValue<C>[],
    { maxLength: number; currentLength: number; }
  >;
};

export type ArraySchemaMessage<C extends Content = Content> =
  $Schema.ValidationMessages<
    ArrayValidations<C>,
    typeof SCHEMA_ITEM_TYPE_ARRAY
  >;

type ArrayProps<C extends Content> =
  & $Schema.SchemaItemAbstractProps
  & $Schema.Validations<ArrayValidations<C>>
  & {
    prop: C;
    parser?: $Schema.Parser<$Schema.InferValue<C>[]>;
    rules?: $Schema.Rule<$Schema.InferValue<C>[]>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_ARRAY);

export function $array<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Content extends $Schema.SchemaItemInterfaceProps<any>,
  const P extends ArrayProps<Content>
>(props: P) {
  type Value = $Schema.InferValue<Content>[];

  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_ARRAY,
    prop: props.prop,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    parse: function (value, params = getEmptyInjectParams()) {
      let arrValue: $Schema.Nullable<Value> = undefined;
      const messages: $Schema.Message[] = [];

      if (this.parser) {
        const parsed = this.parser(value, params);
        arrValue = parsed.value;
        if (parsed.messages) messages.push(...parsed.messages);
      } else {
        if (value != null && value !== "") {
          arrValue = Array.isArray(value) ? value : [value];
        }
      }

      if (arrValue != null) {
        const prefixName = params.name || "";

        for (let i = 0, il = arrValue.length; i < il; i++) {
          const val = arrValue[i];
          const name = `${prefixName}[${i}]`;

          const parsedItem = this.prop.parse(val, {
            ...params,
            name,
          });
          arrValue[i] = parsedItem.value;
          if (parsedItem.messages) messages.push(...parsedItem.messages);
        }
      }
      return { value: arrValue, messages };
    },
    validate: function (value, params = getEmptyInjectParams()) {
      if (this._validators == null) {
        this._validators = [];

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
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
            const getMessage = getLengthMessage ?? ((p) => pickMessage("length", p));

            if (typeof length === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const len = length(p);
                if (len == null) return null;
                if (p.value.length === len) return null;
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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
            const getMessage = getMinLengthMessage ?? ((p) => pickMessage("minLength", p));

            if (typeof minLength === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const minLen = minLength(p);
                if (minLen == null) return null;
                if (minLen <= p.value.length) return null;
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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
            const getMessage = getMaxLengthMessage ?? ((p) => pickMessage("maxLength", p));

            if (typeof maxLength === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const maxLen = maxLength(p);
                if (maxLen == null) return null;
                if (p.value.length <= maxLen) return null;
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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
                  ...p as $Schema.RuleArgParamsAsValidation<Value>,
                  params: {
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

      const messages: $Schema.Message[] = [];
      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<Value>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) {
          messages.push(msg);
          break;
        }
      }

      if (value != null) {
        const prefixName = params.name || "";

        for (let i = 0, il = value.length; i < il; i++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = value[i] as any;
          const name = `${prefixName}[${i}]`;

          const msgs = this.prop.validate(val, { ...params, name });
          if (msgs) messages.push(...msgs);
        }
      }

      return messages;
    },
  } as const satisfies ArrayProps<Content> & $Schema.SchemaItemInterfaceProps<Value>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ArrayProps<Content>, P>(fixedProps, props)({});
};
