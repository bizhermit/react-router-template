/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awaitable } from "better-auth";
import { getPickMessageGetter, getValidationArray, optimizeValidationMessage, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_ENUM = "enum";

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

type EnumItems<Value> =
  | $Schema.SourceItem<Value>[]
  | readonly $Schema.SourceItem<Value>[]
  ;

type DynamicEnumItems<Value> = (params: $Schema.InjectParams) => (EnumItems<Value> | Promise<EnumItems<Value>>);

type EnumProps<Value> = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<EnumValidations>
  & {
    parser?: $Schema.Parser<Value>;
    items: EnumItems<Value> | DynamicEnumItems<Value>;
    notFoundMessage?: $Schema.ValidationCustomMessage<
      unknown,
      { items: $Schema.SourceItem<Value>[] | readonly $Schema.SourceItem<Value>[]; },
      $Schema.Message
    >;
    rules?: $Schema.Rule<Value>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_ENUM);

type InferItems<P> =
  P extends { readonly items: infer T extends readonly $Schema.SourceItem<any>[]; } ? RemoveEnumArrayNoise<T> :
  P extends { readonly items: infer T extends () => Awaitable<readonly $Schema.SourceItem<any>[]>; } ? (
    RemoveEnumArrayNoise<Awaited<ReturnType<T>>>
  ) : never;

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

  protected items: InferItems<P> | undefined;

  constructor(protected props: P) {
    super(props);
    if (Array.isArray(props.items)) {
      this.items = props.items as unknown as InferItems<P>;
    }
  }

  public initialize(params: $Schema.InjectParams): Promise<void>[] {
    if (typeof this.props.items !== "function" || this.items != null) {
      this.initialized = true;
      return [];
    }
    const ret = this.props.items(params);
    if (!("then" in ret)) {
      this.items = ret as InferItems<P>;
      this.initialized = true;
      return [];
    }
    return [
      ret.then((items) => {
        this.items = items as InferItems<P>;
        this.initialized = true;
      }),
    ];
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "select";
  }

  public find(value: unknown): [item: $Schema.SourceItem<Value> | undefined, hasItems: boolean] {
    if (this.items == null) return [undefined, false];
    if (value == null || value === "") return [undefined, true];
    const v = String(value);
    return [
      this.items.find(item => {
        return String(item.value) === v;
      }),
      true,
    ];
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<Value> {
    if (this.items == null) {
      console.warn("loading items");
      return { value: value as Value };
    }

    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      return {
        value: parsed.value,
        messages: { [params.name || ""]: parsed.messages },
      };
    }

    if (value == null || value === "") return { value: undefined };
    const item = this.find(value)[0];
    if (item) return { value: item.value };
    return {
      value: value as Value,
      messages: {
        [params.name || ""]: [
          pickMessage("parse", {
            label: this.getLabel(),
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      },
    };
  }

  public validate(
    value: $Schema.Nullable<Value>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.RecordMessages {
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
        const item = this.find(p.value)[0];
        if (item) return null;
        return getSourceMessage({
          ...p as $Schema.ValidationResultArgParams<unknown>,
          params: {
            items: this.items as unknown as $Schema.SourceItem<Value>[],
          },
        });
      });

      // rules
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    if (this.items == null) {
      console.warn("loading items");
      return {};
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

  public getRequired(params: $Schema.InjectParams) {
    const required = getValidationArray(this.props.required)[0];
    if (typeof required === "function") {
      return required(params) ?? false;
    }
    return required ?? false;
  }

  public getItems() {
    return this.items;
  }

}
