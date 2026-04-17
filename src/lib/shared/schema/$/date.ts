import { $Date, $DateTime, $Month } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator } from ".";

type DateOptions = {
  parser?: $Schema.Parser<$Date>;
  required?: $Schema.Validation<$Schema.Nullable<$Date>, boolean, { date: $Date; }>;
  minDate?: $Schema.Validation<$Date, $Date, { minDate: $Date; currentDate: $Date; }>;
  maxDate?: $Schema.Validation<$Date, $Date, { maxDate: $Date; currentDate: $Date; }>;
  pair?: $Schema.Validation<
    $Date,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $Date; position: "bafore" | "after"; currentDate: $Date; }
  >;
  rules?: $Schema.Rule<$Date>[];
};

type DateProps = $Schema.SchemaItemAbstractProps & DateOptions;

export function $date<const P extends DateProps>(props: P = {} as P) {
  const fixedProps = {
    type: "date",
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
            label: this.label,
            actionType: this.actionType ?? "input",
            type: "e",
            code: "parse",
            message: "", // TODO
          },
        };
      }
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies DateProps & $Schema.SchemaItemInterfaceProps<$Date>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateProps, P>(fixedProps, props)({});
};

type MonthOptions = {
  parser?: $Schema.Parser<$Month>;
  required?: $Schema.Validation<$Schema.Nullable<$Month>, boolean, { date: $Month; }>;
  minMonth?: $Schema.Validation<$Month, $Month, { minMonth: $Month; currentDate: $Month; }>;
  maxMonth?: $Schema.Validation<$Month, $Month, { minMonth: $Month; currentDate: $Month; }>;
  pair?: $Schema.Validation<
    $Month,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $Month; position: "bafore" | "after"; currentDate: $Month; }
  >;
  rules?: $Schema.Rule<$Month>[];
};

type MonthProps = $Schema.SchemaItemAbstractProps & MonthOptions;

export function $month<const P extends MonthProps>(props: P = {} as P) {
  const fixedProps = {
    type: "month",
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
            label: this.label,
            actionType: this.actionType ?? "input",
            type: "e",
            code: "parse",
            message: "", // TODO
          },
        };
      }
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies MonthProps & $Schema.SchemaItemInterfaceProps<$Month>;

  return getSchemaItemPropsGenerator<typeof fixedProps, MonthProps, P>(fixedProps, props)({});
};

type TimeHMString = `${number}:${number}`;
type TimeHMSString = `${number}:${number}:${number}`;
type TimeString = TimeHMString | TimeHMSString;

type DateTimeOptions = {
  parser?: $Schema.Parser<$DateTime>;
  required?: $Schema.Validation<$Schema.Nullable<$DateTime>, boolean, { dateTime: $DateTime; }>;
  minDateTime?: $Schema.Validation<$DateTime, $DateTime, { minDateTime: $DateTime; currentDateTime: $DateTime; }>;
  maxDateTime?: $Schema.Validation<$DateTime, $DateTime, { maxDateTime: $DateTime; currentDateTime: $DateTime; }>;
  minDate?: $Schema.Validation<$DateTime, $Date, { minDate: $Date; currentDateTime: $DateTime; }>;
  maxDate?: $Schema.Validation<$DateTime, $Date, { maxDate: $Date; currentDateTime: $DateTime; }>;
  minTime?: $Schema.Validation<TimeString, $Month, { minTime?: number; }>;
  maxTime?: $Schema.Validation<TimeString, $Month, { mmnTime?: number; }>;
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
    type: "datetime",
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
            label: this.label,
            actionType: this.actionType ?? "input",
            type: "e",
            code: "parse",
            message: "", // TODO
          },
        };
      }
    },
    validate: function (params) {
      // TODO:
      return null;
    },
  } as const satisfies DateTimeProps & $Schema.SchemaItemInterfaceProps<$DateTime>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateTimeProps, P>(fixedProps, props)({});
};
