/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPickMessageGetter, getValidationArray } from ".";
import { SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_OBJECT = "obj";

type ObjectValue<Props extends Record<string, SchemaItem<any>>> = $Schema.Infer<{
  type: typeof SCHEMA_ITEM_TYPE_OBJECT;
  props: Props;
}>;

type ObjectValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
};

export type ObjectSchemaMessage = $Schema.ValidationMessages<
  ObjectValidations,
  typeof SCHEMA_ITEM_TYPE_OBJECT
>;

type ObjectProps<Props extends Record<string, SchemaItem<any>>> =
  & $Schema.SchemaItemAbstractProps
  & $Schema.Validations<ObjectValidations>
  & {
    props: Props;
    parser?: $Schema.Parser<ObjectValue<Props>>;
    rules?: $Schema.Rule<ObjectValue<Props>>[];
  };

type Struct = Record<string, unknown>;

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_OBJECT);

type InferChildren<P> = P extends { props: infer T extends Record<string, SchemaItem<any>>; } ? T : {};

export function $obj<
  const Props extends Record<string, SchemaItem<any>>,
  const P extends ObjectProps<Props>
>(props: P) {
  return new $Obj<Props, P>(props);
};

export class $Obj<
  const Props extends Record<string, SchemaItem<any>>,
  const P extends ObjectProps<Props>
> extends SchemaItem<$Schema.InferClass<InferChildren<P>>> {

  protected chilren: InferChildren<P>;

  constructor(protected props: P) {
    super();
    this.chilren = props.props as InferChildren<P>;
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "set";
  }

  public getLabel(): string | undefined {
    return this.props.label;
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<$Schema.InferClass<InferChildren<P>>> {
    let structValue: $Schema.Nullable<Struct> = undefined;
    const messages: $Schema.Message[] = [];

    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      structValue = parsed.value;
      if (parsed.messages) messages.push(...parsed.messages);
    } else {
      if (value != null && value !== "") {
        if (Object.prototype.toString.call(value) !== "[object Object]") {
          return {
            value: null,
            messages: [
              pickMessage("parse", {
                actionType: this.getActionType(),
                label: this.getLabel(),
                name: params.name,
              }),
            ],
          };
        }
        structValue = value as Struct;
      }
    }

    if (structValue != null) {
      const prefixName = params.name ? `${params.name}.` : "";

      Object.entries(structValue).forEach(([key, val]) => {
        const name = `${prefixName}${key}`;

        const prop = this.chilren[key];
        if (prop == null) {
          messages.push({
            type: "w",
            label: this.getLabel(),
            message: `remove not accept value: ${name}`,
            name,
            actionType: this.getActionType(),
          });
          delete structValue[key];
          return;
        }

        const parsedItem = prop.parse(val, {
          ...params,
          name,
        });

        structValue[key] = parsedItem.value;
        if (parsedItem.messages) {
          messages.push(...parsedItem.messages);
        }
      });
    }
    return { value: structValue as $Schema.InferClass<InferChildren<P>>, messages };
  }

  public validate(
    value: $Schema.Nullable<$Schema.InferClass<InferChildren<P>>>,
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
    }

    const messages = super.validate(value, params);

    if (value != null) {
      const prefixName = params.name ? `${params.name}.` : "";
      Object.entries(this.chilren).forEach(([key, prop]) => {
        const name = `${prefixName}${key}`;
        const val = (value as Struct)[key];
        const msgs = prop.validate(val, { ...params, name });
        messages.push(...msgs);
      });
    }

    return messages;
  }

  public overwrite<const OP extends Omit<ObjectProps<Props>, "props">>(props: OP) {
    return new $Obj<Props, Omit<P, keyof OP> & OP & { props: Props; }>({
      ...this.props,
      ...props,
      props: this.chilren,
    });
  }

};
