import { getSchemaItemPropsGenerator, getValidationArray, optimizeValidationMessage } from ".";

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
  required?: $Schema.Validation<$Schema.Nullable<Value>, boolean, undefined, SourceValidationMessage>;
  notFoundMessage?:
  | string
  | $Schema.Message
  | $Schema.ValidationCustomMessage<
    Value,
    { items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[]; },
    $Schema.Message
  >;
  rules?: $Schema.Rule<Value>[];
};

type SourceProps<Value> = $Schema.SchemaItemAbstractProps & SourceOptions<Value>;

export function $$source<
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
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_SOURCE,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    find: function (value: unknown) {
      if (value == null || value === "") return undefined;
      const v = String(value);
      return this.items.find(item => {
        return String(item.value) === v;
      });
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      const item = this.find(params.value);
      if (item) return { value: item.value };
      return {
        value: params.value as Value,
        message: {
          ...this.getCommonTypeMessageParams(),
          code: "parse",
        },
      };
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

        // notFound
        const getSourceMessage = optimizeValidationMessage(this.notFoundMessage) ??
          (() => ({
            ...commonMsgParams,
            code: "notFound",
          }));

        this._validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const item = this.find(p.value);
          if (item) return null;
          return getSourceMessage({
            ...p,
            validationValues: {
              items: this.items,
            },
          });
        });

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
  } as const satisfies Omit<SourceProps<Value>, "items"> & $Schema.SchemaItemInterfaceProps<Value, SourceValidationAbstractMessage> & {
    items: Items;
    find: (value: unknown) => $Schema.SourceItem<Value> | undefined;
  };

  return getSchemaItemPropsGenerator<typeof fixedProps, SourceProps<Value>, P>(fixedProps, props)({});
};
