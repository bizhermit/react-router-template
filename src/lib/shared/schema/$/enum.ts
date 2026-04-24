import { getEmptyInjectParams, getPickMessageGetter, getSchemaItemPropsGenerator, getValidationArray, optimizeValidationMessage } from ".";

export const SCHEMA_ITEM_TYPE_ENUM = "src";

type EnumArrayNoise =
  | $Schema.SourceItem<unknown>[]
  | readonly $Schema.SourceItem<unknown>[];

type RemoveEnumArrayNoise<T> = T extends infer U & EnumArrayNoise
  ? Extract<U, readonly unknown[]>
  : T;

type EnumValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
};

export type EnumSchemaMessage = $Schema.ValidationMessages<
  EnumValidations,
  typeof SCHEMA_ITEM_TYPE_ENUM,
  {
    code: "notFound";
    params: {
      items: $Schema.SourceItem<unknown>[] | readonly $Schema.SourceItem<unknown>[];
    };
  }
>;

type EnumProps<Value> = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<EnumValidations>
  & {
    parser?: $Schema.Parser<Value>;
    items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[];
    notFoundMessage?: $Schema.ValidationCustomMessage<
      unknown,
      { items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[]; },
      $Schema.Message
    >;
    rules?: $Schema.Rule<Value>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_ENUM);

export function $enum<
  const Value,
  const P extends EnumProps<Value>
>(props: P) {
  type Items = RemoveEnumArrayNoise<P["items"]>;

  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_ENUM,
    items: props.items as Items,
    _validators: null,
    getActionType: function () {
      return this.actionType || "set";
    },
    find: function (value: unknown) {
      if (value == null || value === "") return undefined;
      const v = String(value);
      return this.items.find(item => {
        return String(item.value) === v;
      });
    },
    parse: function (value, params = getEmptyInjectParams()) {
      if (this.parser) return this.parser(value, params);
      const item = this.find(value);
      if (item) return { value: item.value };
      return {
        value: value as Value,
        messages: [
          pickMessage("parse", {
            label: this.label,
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      };
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

        // notFound
        const getSourceMessage = optimizeValidationMessage(this.notFoundMessage) ?? ((p) => pickMessage("notFound", p));

        this._validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const item = this.find(p.value);
          if (item) return null;
          return getSourceMessage({
            ...p as $Schema.ValidationResultArgParams<unknown>,
            params: {
              items: this.items,
            },
          });
        });

        // rules
        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<Value>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
    },
  } as const satisfies Omit<EnumProps<Value>, "items"> & $Schema.SchemaItemInterfaceProps<Value> & {
    items: Items;
    find: (value: unknown) => $Schema.SourceItem<Value> | undefined;
  };

  return getSchemaItemPropsGenerator<typeof fixedProps, EnumProps<Value>, P>(fixedProps, props)({});
};
