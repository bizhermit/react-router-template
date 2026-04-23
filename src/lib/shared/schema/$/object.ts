import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_OBJECT = "obj";

type ObjectValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_OBJECT;
};
export type ObjectValidationMessage = ObjectValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
);

type ObjectValue<Contents extends Record<string, $Schema.SchemaItemInterfaceProps<unknown>>> = $Schema.Infer<{
  type: typeof SCHEMA_ITEM_TYPE_OBJECT;
  props: Contents;
}>;

type ObjectOptions<Contents extends Record<string, $Schema.SchemaItemInterfaceProps<unknown>>> = {
  props: Contents;
  parser?: $Schema.Parser<ObjectValue<Contents>>;
  required?: $Schema.ValidationItem<boolean, null | undefined>;
  rules?: $Schema.Rule<ObjectValue<Contents>>[];
};

type ObjectProps<Contents extends Record<string, $Schema.SchemaItemInterfaceProps<unknown>>> =
  $Schema.SchemaItemAbstractProps & ObjectOptions<Contents>;

type Struct = Record<string, unknown>;

export function $object<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Contents extends Record<string, $Schema.SchemaItemInterfaceProps<any>>,
  const P extends ObjectProps<Contents>
>(props: P) {
  type Value = ObjectValue<P["props"]>;

  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_OBJECT,
    props: props.props,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    parse: function (value, params = getEmptyInjectParams()) {
      let structValue: $Schema.Nullable<Struct> = undefined;
      const messages: $Schema.Message[] = [];

      if (this.parser) {
        const parsed = this.parser(value, params);
        structValue = parsed.value;
        if (parsed.messages) messages.push(...parsed.messages);
      } else {
        if (value != null && value !== "") {
          structValue = value as Struct;
        }
      }

      if (structValue != null) {
        const prefixName = params.name ? `${params.name}.` : "";

        Object.entries(structValue).forEach(([key, val]) => {
          const name = `${prefixName}${key}`;

          const prop = this.props[key];
          if (prop == null) {
            messages.push({
              type: "w",
              label: this.label,
              message: `remove not accept value: ${name}`,
              name,
            });
            delete (structValue as Struct)[key];
            return;
          }

          const parsedItem = prop.parse(val, {
            ...params,
            name,
          });
          (structValue as Struct)[key] = parsedItem.value;
          if (parsedItem.messages) messages.push(...parsedItem.messages);
        });
      }
      return { value: structValue as Value, messages };
    },
    validate: function (value, params = getEmptyInjectParams()) {
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
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
              name: p.name,
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
        const prefixName = params.name ? `${params.name}.` : "";
        Object.entries(this.props).forEach(([key, prop]) => {
          const name = `${prefixName}${key}`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = (value as Struct)[key] as any;

          const msgs = prop.validate(val, { ...params, name });
          if (msgs.length > 0) messages.push(...msgs);
        });
      }

      return messages;
    },
  } as const satisfies ObjectProps<Contents> & $Schema.SchemaItemInterfaceProps<Value>;

  return getSchemaItemPropsGenerator<typeof fixedProps, ObjectProps<Contents>, P>(fixedProps, props)({});
};
