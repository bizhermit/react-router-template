import { $Date, $DateTime, $Month } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

/** Date */
export const SCHEMA_ITEM_TYPE_DATE = "date";

type DateValidation_MinDate = { minDate: $Date; };
type DateValidation_MaxDate = { maxDate: $Date; };

type DateValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATE;
};
export type DateValidationMessage = DateValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDate"; } & DateValidation_MinDate)
  | ({ code: "maxDate"; } & DateValidation_MaxDate)
);

type DateOptions = {
  parser?: $Schema.Parser<$Date>;
  required?: $Schema.Validation<$Schema.Nullable<$Date>, boolean, undefined, DateValidationMessage>;
  minDate?: $Schema.Validation<$Date, $Date, DateValidation_MinDate, DateValidationMessage>;
  maxDate?: $Schema.Validation<$Date, $Date, DateValidation_MaxDate, DateValidationMessage>;
  pair?: $Schema.Validation<
    $Date,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $Date; position: "bafore" | "after"; }
  >;
  rules?: $Schema.Rule<$Date>[];
};

type DateProps = $Schema.SchemaItemAbstractProps & DateOptions;

export function $date<const P extends DateProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATE,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_DATE,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $Date(params.value as string);
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
  } as const satisfies DateProps & $Schema.SchemaItemInterfaceProps<$Date, DateValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateProps, P>(fixedProps, props)({});
};

/** Month */
export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthValidation_MinMonth = { minMonth: $Month; };
type MonthValidation_MaxMonth = { maxMonth: $Month; };

type MonthValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_MONTH;
};
export type MonthValidationMessage = MonthValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minMonth"; } & MonthValidation_MinMonth)
  | ({ code: "maxMonth"; } & MonthValidation_MaxMonth)
);

type MonthOptions = {
  parser?: $Schema.Parser<$Month>;
  required?: $Schema.Validation<$Schema.Nullable<$Month>, boolean, undefined, MonthValidationMessage>;
  minMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MinMonth, MonthValidationMessage>;
  maxMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MaxMonth, MonthValidationMessage>;
  pair?: $Schema.Validation<
    $Month,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairMonth: $Month; position: "bafore" | "after"; }
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

/** DateTime */
export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type TimeHMString = `${number}:${number}`;
type TimeHMSString = `${number}:${number}:${number}`;
type TimeString = TimeHMString | TimeHMSString;

type DateTimeValidation_MinDateTime = { minDateTime: $DateTime; };
type DateTimeValidation_MaxDateTime = { maxDateTime: $DateTime; };
type DateTimeValidation_MinDate = { minDate: $Date; };
type DateTimeValidation_MaxDate = { maxDate: $Date; };
type DateTimeValidation_MinTime = { minTime: TimeString; };
type DateTimeValidation_MaxTime = { maxTime: TimeString; };

type DateTimeValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATETIME;
};
export type DateTimeValidationMessage = DateTimeValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDateTime"; } & DateTimeValidation_MinDateTime)
  | ({ code: "maxDateTime"; } & DateTimeValidation_MaxDateTime)
  | ({ code: "minDate"; } & DateTimeValidation_MinDate)
  | ({ code: "maxDate"; } & DateTimeValidation_MaxDate)
  | ({ code: "minTime"; } & DateTimeValidation_MinTime)
  | ({ code: "maxTime"; } & DateTimeValidation_MaxTime)
);

type DateTimeOptions = {
  parser?: $Schema.Parser<$DateTime>;
  required?: $Schema.Validation<$Schema.Nullable<$DateTime>, boolean, undefined, DateTimeValidationMessage>;
  minDateTime?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MinDateTime>;
  maxDateTime?: $Schema.Validation<$DateTime, $DateTime, DateTimeValidation_MaxDateTime>;
  minDate?: $Schema.Validation<$DateTime, $Date, DateTimeValidation_MinDate>;
  maxDate?: $Schema.Validation<$DateTime, $Date, DateTimeValidation_MaxDate>;
  minTime?: $Schema.Validation<TimeString, $Month, DateTimeValidation_MinTime>;
  maxTime?: $Schema.Validation<TimeString, $Month, DateTimeValidation_MaxTime>;
  pair?: $Schema.Validation<
    $DateTime,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $DateTime; position: "bafore" | "after"; currentDate: $DateTime; }
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
