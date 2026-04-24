/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPickMessageGetter, getValidationArray } from ".";
import { SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_ARRAY = "arr";

type ArrayValidations<Prop extends SchemaItem<any>> = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  length: $Schema.ValidationEntry<
    number,
    $Schema.InferClassValue<Prop>[],
    { length: number; currentLength: number; }
  >;
  minLength: $Schema.ValidationEntry<
    number,
    $Schema.InferClassValue<Prop>[],
    { minLength: number; currentLength: number; }
  >;
  maxLength: $Schema.ValidationEntry<
    number,
    $Schema.InferClassValue<Prop>[],
    { maxLength: number; currentLength: number; }
  >;
};

export type ArraySchemaMessage<Prop extends SchemaItem<any> = SchemaItem<any>> =
  $Schema.ValidationMessages<
    ArrayValidations<Prop>,
    typeof SCHEMA_ITEM_TYPE_ARRAY
  >;

type ArrayProps<Prop extends SchemaItem<any>> =
  & $Schema.SchemaItemAbstractProps
  & $Schema.Validations<ArrayValidations<Prop>>
  & {
    prop: Prop;
    parser?: $Schema.Parser<$Schema.InferClassValue<Prop>[]>;
    rules?: $Schema.Rule<$Schema.InferClassValue<Prop>[]>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_ARRAY);

type InferChild<P> = P extends { prop: infer T extends SchemaItem<any>; } ? T : unknown;

export function $arr<
  const Prop extends SchemaItem<any>,
  const P extends ArrayProps<Prop>
>(props: P) {
  return new $ArrSchema<Prop, P>(props);
};

export class $ArrSchema<
  const Prop extends SchemaItem<any>,
  const P extends ArrayProps<Prop>
> extends SchemaItem<$Schema.InferClassValue<InferChild<P>>[]> {

  protected child: InferChild<P>;

  constructor(protected props: P) {
    super();
    this.child = props.prop as InferChild<P>;
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
  ): $Schema.ParseResult<$Schema.InferClassValue<InferChild<P>>[]> {
    let arrValue: $Schema.Nullable<$Schema.InferClassValue<InferChild<P>>[]> = undefined;
    const messages: $Schema.Message[] = [];

    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      arrValue = parsed.value;
      if (parsed.messages) messages.push(...parsed.messages);
    } else {
      if (value != null && value !== "") {
        arrValue = Array.isArray(value) ? value : [value];
      }
    }

    if (arrValue != null) {
      const prefixName = params.name || "";

      for (let i = 0, il = arrValue.length; i < il; i++) {
        const val = arrValue[i];
        const name = `${prefixName}[${i}]`;

        const parsedItem = this.child.parse(val, {
          ...params,
          name,
        });
        arrValue[i] = parsedItem.value;
        if (parsedItem.messages) messages.push(...parsedItem.messages);
      }
    }
    return { value: arrValue, messages };
  }

  public validate(
    value: $Schema.Nullable<$Schema.InferClassValue<InferChild<P>>[]>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.Message[] {
    if (this.validators == null) {
      this.validators = [];
      type Value = $Schema.InferClassValue<InferChild<P>>[];

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

      // length
      if (this.props.length != null) {
        const [length, getLengthMessage] = getValidationArray(this.props.length);
        if (length != null) {
          const getMessage = getLengthMessage ?? ((p) => pickMessage("length", p));

          if (typeof length === "function") {
            this.validators.push((p) => {
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
            this.validators.push((p) => {
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
      if (this.props.minLength != null) {
        const [minLength, getMinLengthMessage] = getValidationArray(this.props.minLength);
        if (minLength != null) {
          const getMessage = getMinLengthMessage ?? ((p) => pickMessage("minLength", p));

          if (typeof minLength === "function") {
            this.validators.push((p) => {
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
            this.validators.push((p) => {
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
      if (this.props.maxLength != null) {
        const [maxLength, getMaxLengthMessage] = getValidationArray(this.props.maxLength);
        if (maxLength != null) {
          const getMessage = getMaxLengthMessage ?? ((p) => pickMessage("maxLength", p));

          if (typeof maxLength === "function") {
            this.validators.push((p) => {
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
            this.validators.push((p) => {
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
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    const messages = super.validate(value, params);

    if (value != null) {
      const prefixName = params.name || "";

      for (let i = 0, il = value.length; i < il; i++) {
        const val = value[i];
        const name = `${prefixName}[${i}]`;
        const msgs = this.child.validate(val, { ...params, name });
        if (msgs) messages.push(...msgs);
      }
    }

    return messages;
  }

  public overwrite<const OP extends Omit<ArrayProps<Prop>, "prop">>(props: OP) {
    return new $ArrSchema<Prop, Omit<P, keyof OP> & OP & { prop: Prop; }>({
      ...this.props,
      ...props,
      prop: this.child,
    });
  }

}
