/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_OBJECT = "obj";

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
    parser?: $Schema.Parser<$Schema.Infer<Props>>;
    rules?: $Schema.Rule<$Schema.Infer<Props>>[];
  };

type Struct = Record<string, unknown>;

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_OBJECT);

type InferChildren<P> = P extends { props: infer T extends Record<string, SchemaItem<any>>; } ? T : {};

export function $obj<
  const Props extends Record<string, SchemaItem<any>>,
  const P extends ObjectProps<Props>
>(props: P) {
  return new $ObjSchema<Props, P>(props);
};

export class $ObjSchema<
  const Props extends Record<string, SchemaItem<any>>,
  const P extends ObjectProps<Props>
> extends SchemaItem<$Schema.Infer<InferChildren<P>>> {

  protected children: InferChildren<P>;

  constructor(protected props: P) {
    super();
    this.children = props.props as InferChildren<P>;
  }

  public getActionType() {
    return this.props.actionType || "set";
  }

  public getLabel() {
    return this.props.label;
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<$Schema.Infer<InferChildren<P>>> {
    let structValue: $Schema.Nullable<Struct> = undefined;
    const messages: Record<string, $Schema.Message[] | undefined> = {
      [params.name || ""]: undefined,
    };

    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      structValue = parsed.value;
      if (parsed.messages) {
        messages[params.name || ""] = parsed.messages;
      }
    } else {
      if (value != null && value !== "") {
        if (Object.prototype.toString.call(value) !== "[object Object]") {
          messages[params.name || ""] = [
            pickMessage("parse", {
              actionType: this.getActionType(),
              label: this.getLabel(),
              name: params.name,
            }),
          ];
          structValue = null;
        } else {
          structValue = value as Struct;
        }
      }
    }

    if (structValue != null) {
      const prefixName = params.name ? `${params.name}.` : "";

      Object.entries(structValue).forEach(([key, val]) => {
        const name = `${prefixName}${key}`;

        const prop = this.children[key];
        if (prop == null) {
          messages[params.name || ""] = [{
            type: "w",
            label: this.getLabel(),
            message: `remove not accept property: ${name}`,
            name,
            actionType: this.getActionType(),
          }];
          delete structValue[key];
          return;
        }

        const parsedItem = prop.parse(val, {
          ...params,
          name,
        });

        structValue[key] = parsedItem.value;
        if (parsedItem.messages) {
          Object.assign(messages, parsedItem.messages);
          if (!(name in parsedItem.messages)) messages[name] = undefined;
        } else {
          messages[name] = undefined;
        }
      });
    }

    return {
      value: structValue as $Schema.Nullable<$Schema.Infer<InferChildren<P>>>,
      messages,
    };
  }

  public validate(
    value: $Schema.Nullable<$Schema.Infer<InferChildren<P>>>,
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
    }

    const messages = super.validate(value, params);

    if (value != null) {
      const prefixName = params.name ? `${params.name}.` : "";
      Object.entries(this.children).forEach(([key, prop]) => {
        const name = `${prefixName}${key}`;
        const val = (value as Struct)[key];

        const validated = prop.validate(val, { ...params, name });

        Object.assign(messages, validated);
        if (!(name in validated)) messages[name] = undefined;
      });
    }

    return messages;
  }

  public overwrite<const OP extends Omit<ObjectProps<Props>, "props">>(props: OP) {
    return new $ObjSchema<Props, Omit<P, keyof OP> & OP & { props: Props; }>({
      ...this.props,
      ...props,
      props: this.children,
    });
  }

  public getSchemaItem(name: string) {
    return this.children[name];
  }

  public getChildren() {
    return this.children;
  }

};
