import { getSchemaItemPropsGenerator, getValidationArray } from ".";
import { SCHEMA_ITEM_TYPE_OBJECT } from "./object";

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

type ArrayOptions<Content extends $Schema.SchemaItemInterfaceProps<unknown>> = {
  prop: Content;
  parser?: $Schema.Parser<$Schema.InferValue<Content>[]>;
  required?: $Schema.ValidationItem<boolean, null | undefined>;
  length?: $Schema.ValidationItem<
    number,
    $Schema.InferValue<Content>[],
    { length: number; currentLength: number; }
  >;
  minLength?: $Schema.ValidationItem<
    number,
    $Schema.InferValue<Content>[],
    { minLength: number; currentLength: number; }
  >;
  maxLength?: $Schema.ValidationItem<
    number,
    $Schema.InferValue<Content>[],
    { maxLength: number; currentLength: number; }
  >;
  rules?: $Schema.Rule<$Schema.InferValue<Content>[]>[];
};

type ArrayProps<Content extends $Schema.SchemaItemInterfaceProps<unknown>> =
  $Schema.SchemaItemAbstractProps & ArrayOptions<Content>;

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
    parse: function (value, params) {
      if (this.parser) return this.parser(value, params);
      if (value == null || value === "") return { value: undefined };
      if (Array.isArray(value)) {
        return { value: value as Value };
      }
      return { value: [value] as Value };
    },
    parseWithChildren: function (value: unknown, params: $Schema.ParseArgParams): {
      value: $Schema.Nullable<Value>;
      messages: $Schema.Message[];
    } {
      const parsed = this.parse(value, params);
      const messages: $Schema.Message[] = [];
      if (parsed.message) messages.push(parsed.message);

      if (parsed.value != null) {
        const prefixName = params.name || "";

        for (let i = 0, il = parsed.value.length; i < il; i++) {
          const val = parsed.value[i];
          const name = `${prefixName}[${i}]`;

          if (
            this.prop.type === SCHEMA_ITEM_TYPE_ARRAY ||
            this.prop.type === SCHEMA_ITEM_TYPE_OBJECT
          ) {
            const parsedItem = (this.prop as unknown as ReturnType<typeof $array>).parseWithChildren(val, {
              ...params,
              name,
            });
            parsed.value[i] = parsedItem.value as Value[number];
            if (parsedItem.messages.length > 0) messages.push(...parsedItem.messages);
            continue;
          }
          const parsedItem = this.prop.parse(val, {
            ...params,
            name,
          });
          parsed.value[i] = parsedItem.value as Value[number];
          if (parsedItem.message) messages.push(parsedItem.message);
        }
      }
      return { value: parsed.value, messages };
    },
    validate: function (value, params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_ARRAY,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
            }));

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
            const getMessage = getLengthMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "length",
              label: p.label,
              params: p.params,
            }));

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
            const getMessage = getMinLengthMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "minLength",
              label: p.label,
              params: p.params,
            }));

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
            const getMessage = getMaxLengthMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "maxLength",
              label: p.label,
              params: p.params,
            }));

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

      let msg: $Schema.Message | null = null;
      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<Value>;

      for (const vali of this._validators) {
        msg = vali(ruleArg);
        if (msg) break;
      }
      return msg;
    },
    validateWithChildren: function (value: $Schema.Nullable<Value>, params: $Schema.ValidationArgParams) {
      const messages: $Schema.Message[] = [];

      const msg = this.validate(value, params);
      if (msg) messages.push(msg);

      if (value != null) {
        const prefixName = params.name || "";

        for (let i = 0, il = value.length; i < il; i++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = value[i] as any;
          const name = `${prefixName}[${i}]`;

          if (
            this.prop.type === SCHEMA_ITEM_TYPE_ARRAY ||
            this.prop.type === SCHEMA_ITEM_TYPE_OBJECT
          ) {
            const msgs = (this.prop as unknown as ReturnType<typeof $array>).validateWithChildren(val, {
              ...params,
              name,
            });
            if (msgs.length > 0) messages.push(...msgs);
            continue;
          }
          const msg = this.prop.validate(val, { ...params, name });
          if (msg) messages.push(msg);
        }
      }

      return messages;
    },
  } as const satisfies ArrayProps<Content> & $Schema.SchemaItemInterfaceProps<Value>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ArrayProps<Content>, P>(fixedProps, props)({});
};
