import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray, optimizeValidationMessage } from ".";

export const SCHEMA_ITEM_TYPE_SOURCE = "src";

type SourceValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_SOURCE;
};
export type SourceValidationMessage = SourceValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | { code: "notFound"; }
);

type SourceArrayNoise =
  | $Schema.SourceItem<unknown>[]
  | readonly $Schema.SourceItem<unknown>[];

type RemoveSourceArrayNoise<T> = T extends infer U & SourceArrayNoise
  ? Extract<U, readonly unknown[]>
  : T;

type SourceOptions<Value> = {
  parser?: $Schema.Parser<Value>;
  items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[];
  required?: $Schema.Validation<boolean, null | undefined>;
  notFoundMessage?: $Schema.ValidationCustomMessage<
    unknown,
    { items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[]; },
    $Schema.Message
  >;
  rules?: $Schema.Rule<Value>[];
};

type SourceProps<Value> = $Schema.SchemaItemAbstractProps & SourceOptions<Value>;

export function $enum<
  const Value,
  const P extends SourceProps<Value>
>(props: P) {
  type Items = RemoveSourceArrayNoise<P["items"]>;

  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_SOURCE,
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
        messages: [{
          type: "e",
          label: this.label,
          actionType: this.getActionType(),
          otype: SCHEMA_ITEM_TYPE_SOURCE,
          code: "parse",
          name: params.name,
        }],
      };
    },
    validate: function (value, params = getEmptyInjectParams()) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_SOURCE,
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

        // notFound
        const getSourceMessage = optimizeValidationMessage(this.notFoundMessage) ?? ((p) => ({
          ...commonMsgParams,
          code: "notFound",
          label: p.label,
          params: p.params,
          name: p.name,
        }));

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
  } as const satisfies Omit<SourceProps<Value>, "items"> & $Schema.SchemaItemInterfaceProps<Value> & {
    items: Items;
    find: (value: unknown) => $Schema.SourceItem<Value> | undefined;
  };

  return getSchemaItemPropsGenerator<typeof fixedProps, SourceProps<Value>, P>(fixedProps, props)({});
};
