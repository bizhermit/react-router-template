import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_BOOLEAN = "bool";

type BooleanValue = boolean | number | string;

type BooleanValidations<FalseValue extends BooleanValue> = {
  required: $Schema.ValidationEntry<boolean | "nonFalse", $Schema.Nullable<FalseValue>>;
};

export type BooleanSchemaMessage<FalseValue extends BooleanValue = BooleanValue> =
  $Schema.ValidationMessages<
    BooleanValidations<FalseValue>,
    typeof SCHEMA_ITEM_TYPE_BOOLEAN
  >;

type BooleanProps<
  TrueValue extends BooleanValue,
  FalseValue extends BooleanValue
> = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<BooleanValidations<FalseValue>>
  & {
    trueValue?: TrueValue;
    falseValue?: FalseValue;
    parser?: $Schema.Parser<TrueValue | FalseValue>;
    rules?: $Schema.Rule<TrueValue | FalseValue>[];
    trueText?: string;
    falseText?: string;
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_BOOLEAN);

export function $bool<
  const P extends BooleanProps<BooleanValue, BooleanValue>
>(props: P = {} as P) {
  return new $BoolSchema<P>(props);
}

type InferTrue<P> = P extends { trueValue: infer T extends BooleanValue; } ? T : true;
type InferFalse<P> = P extends { falseValue: infer F extends BooleanValue; } ? F : false;

export class $BoolSchema<
  const P extends BooleanProps<BooleanValue, BooleanValue>
> extends SchemaItem<InferTrue<P> | InferFalse<P>> {

  protected trueValue: InferTrue<P>;
  protected falseValue: InferFalse<P>;

  constructor(protected props: P = {} as P) {
    super(props);
    this.trueValue = (props.trueValue ?? true) as InferTrue<P>;
    this.falseValue = (props.falseValue ?? false) as InferFalse<P>;
  }

  public getTrueValue() {
    return this.trueValue;
  }

  public getFalseValue() {
    return this.falseValue;
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "select";
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<InferTrue<P> | InferFalse<P>> {
    if (this.props.parser) {
      const parsed = this.props.parser(value, params) as $Schema.ParserResult<InferTrue<P> | InferFalse<P>>;
      return {
        value: parsed.value,
        messages: { [params.name || ""]: parsed.messages },
      };
    }

    const s = String(value);
    if (s === String(this.trueValue)) {
      return { value: this.trueValue };
    }
    if (s === String(this.falseValue)) {
      return { value: this.falseValue };
    }
    if (value == null || value === "") {
      return { value: undefined };
    }
    const ls = s.toLowerCase();
    if (ls === "on") {
      return { value: this.trueValue };
    }
    if (ls === "off") {
      return { value: this.falseValue };
    }

    return {
      value: undefined,
      messages: {
        [params.name || ""]: [
          pickMessage("parse", {
            actionType: this.getActionType(),
            label: this.getLabel(),
            name: params.name,
          }),
        ],
      },
    };
  }

  public validate(
    value: $Schema.Nullable<InferTrue<P> | InferFalse<P>>,
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
              const r = required(p);
              if (!r) return null;
              if (r === "nonFalse") {
                if (p.value === this.trueValue) return null;
                return getMessage(p);
              }
              if (p.value == this.trueValue || p.value === this.falseValue) return null;
              return getMessage(p);
            });
          } else {
            this.validators.push((p) => {
              if (required === "nonFalse") {
                if (p.value === this.trueValue) return null;
                return getMessage(p);
              }
              if (p.value === this.trueValue || p.value === this.falseValue) return null;
              return getMessage(p);
            });
          }
        }
      }

      // rules
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    return super.validate(value, params);
  }

  public overwrite<const OP extends Omit<BooleanProps<BooleanValue, BooleanValue>, "trueValue" | "falseValue">>(props: OP) {
    return new $BoolSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
      trueValue: this.trueValue,
      falseValue: this.falseValue,
    });
  }

  public getRequired(params: $Schema.InjectParams) {
    const required = getValidationArray(this.props.required)[0];
    if (typeof required === "function") {
      return required(params) ?? false;
    }
    return required ?? false;
  }

}
