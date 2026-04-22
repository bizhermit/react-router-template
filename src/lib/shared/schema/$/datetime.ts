import { $Date, $DateTime } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type TimeHMString = `${number}:${number}`;
type TimeHMSString = `${number}:${number}:${number}`;
type TimeString = TimeHMString | TimeHMSString;

type DateTimePair = { name: string; position: "before" | "after"; noSame?: boolean; };

type DateTimeValidation_MinDateTimeParams = { minDateTime: $DateTime; };
type DateTimeValidation_MaxDateTimeParams = { maxDateTime: $DateTime; };
type DateTimeValidation_MinDateParams = { minDate: $Date; };
type DateTimeValidation_MaxDateParams = { maxDate: $Date; };
type DateTimeValidation_MinTimeParams = { minTime: TimeString; };
type DateTimeValidation_MaxTimeParams = { maxTime: TimeString; };
type DateTimeValidation_PairParams = Omit<Required<DateTimePair>, "name"> & { pairName: string; pairDateTime: $DateTime; };

type DateTimeValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATETIME;
};
export type DateTimeValidationMessage = DateTimeValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDateTime"; } & DateTimeValidation_MinDateTimeParams)
  | ({ code: "maxDateTime"; } & DateTimeValidation_MaxDateTimeParams)
  | ({ code: "minDate"; } & DateTimeValidation_MinDateParams)
  | ({ code: "maxDate"; } & DateTimeValidation_MaxDateParams)
  | ({ code: "minTime"; } & DateTimeValidation_MinTimeParams)
  | ({ code: "maxTime"; } & DateTimeValidation_MaxTimeParams)
  | ({ code: "pair"; } & DateTimeValidation_PairParams)
);

type DateTimeOptions = {
  parser?: $Schema.Parser<$DateTime>;
  required?: $Schema.Validation<$Schema.Nullable<$DateTime>, boolean, undefined, DateTimeValidationMessage>;
  minDateTime?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MinDateTimeParams>;
  maxDateTime?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MaxDateTimeParams>;
  minDate?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MinDateParams>;
  maxDate?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MaxDateParams>;
  minTime?: $Schema.Validation<TimeString, $DateTime, DateTimeValidation_MinTimeParams>;
  maxTime?: $Schema.Validation<TimeString, $DateTime, DateTimeValidation_MaxTimeParams>;
  pair?: $Schema.Validation<
    $DateTime,
    DateTimePair | DateTimePair[],
    DateTimeValidation_PairParams,
    DateTimeValidationMessage
  >;
  rules?: $Schema.Rule<$DateTime>[];
};

type DateTimeProps = $Schema.SchemaItemAbstractProps & DateTimeOptions;

export function $datetime<const P extends DateTimeProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATETIME,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_DATETIME,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $DateTime(params.value as string);
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
  } as const satisfies DateTimeProps & $Schema.SchemaItemInterfaceProps<$DateTime, DateTimeValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateTimeProps, P>(fixedProps, props)({});
};
