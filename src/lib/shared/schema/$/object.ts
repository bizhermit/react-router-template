import { getSchemaItemPropsGenerator, getValidationArray } from ".";
import { SCHEMA_ITEM_TYPE_ARRAY } from "./array";

export const SCHEMA_ITEM_TYPE_OBJECT = "obj";

type ObjectValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_OBJECT;
};
export type ObjectValidationMessage = ObjectValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
);

type ObjectOptions<Contents extends Record<string, $Schema.SchemaItemInterfaceProps<unknown>>> = {
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

type ObjectProps<Contents extends Record<string, $Schema.SchemaItemInterfaceProps<unknown>>> =
  $Schema.SchemaItemAbstractProps & ObjectOptions<Contents>;

type Struct = Record<string, unknown>;

export function $object<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Contents extends Record<string, $Schema.SchemaItemInterfaceProps<any>>,
  const P extends ObjectProps<Contents>
>(props: P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_OBJECT,
    props: props.props,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    parse: function (value, params) {
      if (this.parser) return this.parser(value, params);
      if (value == null || value === "") return { value: undefined };
      return { value: value as $Schema.InferValue<Contents> };
    },
    parseWithChildren: function (value: unknown, params: $Schema.ParseArgParams): {
      value: $Schema.Nullable<$Schema.InferValue<Contents>>;
      messages: $Schema.Message[];
    } {
      const parsed = this.parse(value, params) as $Schema.ParseResult<Struct>;
      const messages: $Schema.Message[] = [];
      if (parsed.message) messages.push(parsed.message);

      if (parsed.value != null) {
        const prefixName = params.name ? `${params.name}.` : "";

        Object.entries(parsed.value).forEach(([key, val]) => {
          const name = `${prefixName}${key}`;

          const prop = this.props[key];
          console.log(prop, name);
          if (prop == null) {
            messages.push({
              type: "w",
              label: this.label,
              message: `remove not accept value: ${name}`,
            });
            delete parsed.value![key];
            return;
          }
          if (
            prop.type === SCHEMA_ITEM_TYPE_ARRAY ||
            prop.type === SCHEMA_ITEM_TYPE_OBJECT
          ) {
            const parsedItem = (prop as ReturnType<typeof $object>).parseWithChildren(val, {
              ...params,
              name,
            });
            parsed.value![key] = parsedItem.value;
            if (parsedItem.messages.length > 0) messages.push(...parsedItem.messages);
            return;
          }
          const parsedItem = prop.parse(val, {
            ...params,
            name,
          });
          parsed.value![key] = parsedItem.value;
          if (parsedItem.message) messages.push(parsedItem.message);
        });
      }

      return { value: parsed.value as $Schema.Nullable<$Schema.InferValue<Contents>>, messages };
    },
    validate: function (value, params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_OBJECT,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "required",
                ...p,
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
      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<$Schema.InferValue<Contents>>;

      for (const vali of this._validators) {
        msg = vali(ruleArg);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies ObjectProps<Contents> & $Schema.SchemaItemInterfaceProps<$Schema.InferValue<Contents>>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ObjectProps<Contents>, P>(fixedProps, props)({});
};
