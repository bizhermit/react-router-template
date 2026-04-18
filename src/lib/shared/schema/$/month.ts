import { $Month } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthPair = { name: string; position: "before" | "after"; noSame?: boolean; };

type MonthValidation_MinMonth = { minMonth: $Month; };
type MonthValidation_MaxMonth = { maxMonth: $Month; };
type MonthValidation_Pair = Omit<Required<MonthPair>, "name"> & { pairName: string; pairMonth: $Month; };

type MonthValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_MONTH;
};
export type MonthValidationMessage = MonthValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minMonth"; } & MonthValidation_MinMonth)
  | ({ code: "maxMonth"; } & MonthValidation_MaxMonth)
  | ({ code: "pair"; } & MonthValidation_Pair)
);

type MonthOptions = {
  parser?: $Schema.Parser<$Month>;
  required?: $Schema.Validation<$Schema.Nullable<$Month>, boolean, undefined, MonthValidationMessage>;
  minMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MinMonth, MonthValidationMessage>;
  maxMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MaxMonth, MonthValidationMessage>;
  pair?: $Schema.Validation<
    $Month,
    MonthPair | MonthPair[],
    MonthValidation_Pair,
    MonthValidationMessage
  >;
  rules?: $Schema.Rule<$Month>[];
};

type MonthProps = $Schema.SchemaItemAbstractProps & MonthOptions;

export function $month<const P extends MonthProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_MONTH,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_MONTH,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $Month(params.value as string);
        return { value };
      } catch {
        return {
          value: null,
          message: {
            ...this.getCommonTypeMessageParams(),
            code: "parse",
          },
        };
      }
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

        // TODO:

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
  } as const satisfies MonthProps & $Schema.SchemaItemInterfaceProps<$Month, MonthValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, MonthProps, P>(fixedProps, props)({});
};
