/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPickMessageGetter, getValidationArray, optimizeValidationMessage, SchemaItem } from "./core";

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

type InferItems<P> = P extends { readonly items: infer T extends readonly $Schema.SourceItem<any>[]; }
  ? RemoveEnumArrayNoise<T>
  : never;

export function $enum<
  const Value,
  const P extends EnumProps<Value>
>(props: P) {
  return new $EnumSchema<Value, P>(props);
};

export class $EnumSchema<
  const Value,
  const P extends EnumProps<Value>
> extends SchemaItem<Value> {

  protected items: InferItems<P>;

  constructor(protected props: P) {
    super();
    this.items = props.items as InferItems<P>;
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "select";
  }

  public getLabel(): string | undefined {
    return this.props.label;
  }

  public find(value: unknown) {
    if (value == null || value === "") return undefined;
    const v = String(value);
    return this.items.find(item => {
      return String(item.value) === v;
    });
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<Value> {
    if (this.props.parser) return this.props.parser(value, params);
    const item = this.find(value);
    if (item) return { value: item.value };
    return {
      value: value as Value,
      messages: [
        pickMessage("parse", {
          label: this.getLabel(),
          actionType: this.getActionType(),
          name: params.name,
        }),
      ],
    };
  }

  public validate(
    value: $Schema.Nullable<Value>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.Message[] {
    if (this.validators == null) {
      this.validators = [];

      // required
      if (this.props.required != null) {
        const [required, getRequiredMessage] = getValidationArray(this.props.required);
        if (required) {
          const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

          if (typeof required === "function") {
            this.validators.push((p) => {
              if (!required(p)) return null;
              if (p.value == null) {
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (p.value == null) {
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          }
        }
      }

      // notFound
      const getSourceMessage = optimizeValidationMessage(this.props.notFoundMessage) ?? ((p) => pickMessage("notFound", p));

      this.validators.push((p) => {
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
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    return super.validate(value, params);
  }

  public overwrite<const OP extends Omit<EnumProps<Value>, "items">>(props: OP) {
    return new $EnumSchema<Value, Omit<P, keyof OP> & OP & { items: InferItems<P>; }>({
      ...this.props,
      ...props,
      items: this.items,
    });
  }

}
