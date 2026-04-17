import { Button } from "$/components/elements/button/button";
import { useRender } from "$/shared/hooks/render";
import { $Date, $DateTime, $Month } from "$/shared/objects/timestamp";
import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/form";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  // eslint-disable-next-line no-console
  console.log("loader", Array.from(url.searchParams.entries()));
  return data({});
};

export function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  // eslint-disable-next-line no-console
  console.log("action", request.method, Array.from(url.searchParams.entries()));
  return data({});
};

export default function Page() {
  const [value, setValue] = useState<$DateTime>(() => new $DateTime());
  const render = useRender();
  return (
    <div>
      form sandbox
      <div className="flex row gap-2">
        <Button
          onClick={() => {
            const d = new $DateTime();
            console.log(d);
            setValue(d);
          }}
        >
          reset
        </Button>
        <Button
          onClick={() => {
            setValue(new $DateTime(new $Date(value)));
          }}
        >
          set timestamp
        </Button>
        <Button
          onClick={() => {
            try {
              // setValue(new $DateTime("2020-01-02T12:34:56.789Asia/Tokyo"));
              // setValue(new $DateTime("2020-01-02T12:34:56.789+09:00"));
              // setValue(new $DateTime("2020-01-01T12:34:56.789+0900"));
              // setValue(new $DateTime("2020-01-02T12:34:56.789+00:00"));
              setValue(new $DateTime("Thu Apr 16 2026 18:28:52 GMT+0900 (日本標準時)"));
              // setValue(new $DateTime("Thu, 16 Apr 2026 01:20:30 GMT"));
            } catch (e) {
              console.error(e);
            }
          }}
        >
          set string
        </Button>
        <Button
          onClick={() => {
            const d = new Date();
            setValue(new $DateTime(d));
          }}
        >
          set date
        </Button>
        <Button
          onClick={() => {
            setValue(new $DateTime(Date.now()));
          }}
        >
          set number
        </Button>
        <Button
          onClick={() => {
            value?.setNow();
            render();
          }}
        >
          set now
        </Button>
        <Button
          onClick={() => {
            value.setMonth(2);
            render();
          }}
        >
          set month 8
        </Button>
        <Button
          onClick={() => {
            value.setDay(0);
            render();
          }}
        >
          set day 0
        </Button>
        <Button
          onClick={() => {
            value.setDay(1);
            render();
          }}
        >
          set day 1
        </Button>
      </div>
      <div className="flex row gap-2">
        <Button
          onClick={() => {
            value.addYear(1);
            render();
          }}
        >
          add year 1
        </Button>
        <Button
          onClick={() => {
            value.addMonth(1);
            render();
          }}
        >
          add month 1
        </Button>
        <Button
          onClick={() => {
            value.addDay(1);
            render();
          }}
        >
          add day 1
        </Button>
        <Button
          onClick={() => {
            value.addHour(1);
            render();
          }}
        >
          add hour 1
        </Button>
        <Button
          onClick={() => {
            value.addMinute(1);
            render();
          }}
        >
          add minute 1
        </Button>
        <Button
          onClick={() => {
            value.addSecond(1);
            render();
          }}
        >
          add second 1
        </Button>
        <Button
          onClick={() => {
            value.addMillisecond(1);
            render();
          }}
        >
          add millisecond 1
        </Button>
      </div>
      <div className="flex row gap-2">
        <Button
          onClick={() => {
            value.addYear(-1);
            render();
          }}
        >
          minus year 1
        </Button>
        <Button
          onClick={() => {
            value.addMonth(-1);
            render();
          }}
        >
          minus month 1
        </Button>
        <Button
          onClick={() => {
            value.addDay(-1);
            render();
          }}
        >
          minus day 1
        </Button>
        <Button
          onClick={() => {
            value.addHour(-1);
            render();
          }}
        >
          minus hour 1
        </Button>
        <Button
          onClick={() => {
            value.addMinute(-1);
            render();
          }}
        >
          minus minute 1
        </Button>
        <Button
          onClick={() => {
            value.addSecond(-1);
            render();
          }}
        >
          minus second 1
        </Button>
        <Button
          onClick={() => {
            value.addMillisecond(-1);
            render();
          }}
        >
          minus millisecond 1
        </Button>
      </div>
      <div className="flex row gap-2">
        <Button
          onClick={() => {
            value.moveFirstDay();
            render();
          }}
        >
          move first day
        </Button>

        <Button
          onClick={() => {
            value.moveLastDay();
            render();
          }}
        >
          move last day
        </Button>
      </div>
      {
        value &&
        <ul className="px-8 py-4 list-disc">
          <li>年: {value.getYear()}</li>
          <li>月: {value.getMonth()}</li>
          <li>日: {value.getDay()}</li>
          <li>時: {value.getHour()}</li>
          <li>分: {value.getMinute()}</li>
          <li>秒: {value.getSecond()}</li>
          <li>ms: {value.getMillisecond()}</li>
          <li>曜: {value.getWeek()}</li>
          <hr />
          <li>iso: {value.toISOString()}</li>
          <li>json: {value.toJSON()}</li>
          <li>str: {value.toString()}</li>
          <li>date: {value.toDateString()}</li>
          <li>time: {value.toTimeString()}</li>
          <li>offset: {value.getOffset()}</li>
          <li>{value.toString(`yyyy年MM月dd日(W) hh時mm分ss秒`)}</li>
          <li>{JSON.stringify({ value })}</li>
        </ul>
      }
    </div>
  );
};

/** schemas */

type Nullable<T> = T | null | undefined;

type BaseMessage = {
  /**
   * メッセージタイプ
   * - `e`: エラー
   * - `w`: 警告
   * - `i`: 情報
   */
  type: "e" | "w" | "i";
  /** ラベル */
  label: string | undefined;
};

type I18nMessage<K extends I18nTextKey = I18nTextKey> = BaseMessage & {
  /** i18n key */
  code: K;
  /** i18n replace texts */
  params?: Omit<I18nReplaceParams<K>, "label">;
};

type CustomMessage = BaseMessage & {
  /** 識別コード */
  code?: string;
  /** メッセージ */
  message: string;
};

type Message =
  | I18nMessage
  | CustomMessage;

type ArgParams = {
  /** full name */
  name: string;
  /** label */
  label: string | undefined;
  /** values */
  values: Record<string, unknown>;
  /** external data */
  data: Record<string, unknown>;
  /** server side or not */
  isServer: boolean;
};

type Validation<Value = unknown, ValidationValue = unknown, ValidationArgValues = {}> =
  | Nullable<ValidationValue>
  | ((params: ArgParams & { value: Nullable<Value>; }) => Nullable<ValidationValue>)
  | [
    Nullable<ValidationValue> | ((params: ArgParams) => Nullable<ValidationValue>),
    (
      | string
      | Message
      | (
        (params: ArgParams & {
          value: Value;
          validationValues: ValidationArgValues;
        }) => (string | Message)
      )
    )?
  ]
  ;

type Parser<Value> = (params: ArgParams & { value: unknown; }) => {
  value: Nullable<Value>;
  message?: Message | null;
};

type Rule<V> = (params: ArgParams & { value: Nullable<V>; }) => (string | Message);

type Mode = "enabled" | "disabled" | "readonly" | "hidden";

type BaseProps = {
  label?: string;
  refs?: string[];
  mode?: (params: ArgParams) => Mode;
};

function getOverwriteFunc<const P, const BP extends P>(baseProps: BP) {
  return function <const OP extends P>(props: OP) {
    const retProps = {
      ...baseProps,
      ...props,
    } as Omit<BP, keyof OP> & OP;
    return {
      ...retProps,
      overwrite: getOverwriteFunc<P, typeof retProps>(retProps),
    } as const;
  };
};

const strPatternCheck = {
  int: () => true,
  "h-num": () => true,
  num: () => true,
  "h-alpha": () => true,
  alpha: () => true,
  "h-alpha-num": () => true,
  "h-alpha-num-syn": () => true,
  "h-katakana": () => true,
  "f-katakana": () => true,
  katakana: () => true,
  hiragana: () => true,
  half: () => true,
  full: () => true,
  email: () => true,
  tel: () => true,
  url: () => true,
  "post-num": () => true,
} as const;

type StrPattern = keyof typeof strPatternCheck;

type StrProps = {
  parser?: Parser<string>;
  required?: Validation<Nullable<string>, boolean>;
  length?: Validation<string, number, { length: number; currentLength: number; }>;
  minLength?: Validation<string, number, { minLength: number; currentLength: number; }>;
  maxLength?: Validation<string, number, { maxLength: number; currentLength: number; }>;
  pattern?: Validation<string, StrPattern, { pattern: StrPattern; }>;
  rules?: Rule<string>[];
};

function $str<const P extends BaseProps & StrProps>(props: P = {} as P) {
  const retProps = {
    ...props,
    type: "str",
    parse: function () {
      console.log(this);
    },
    validate: function () {
      console.log(this);
    },
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & StrProps, typeof retProps>(retProps),
  } as const;
};

type NumProps = {
  parser?: Parser<number>;
  required?: Validation<Nullable<number>, boolean>;
  min?: Validation<number, number, { min: number; }>;
  max?: Validation<number, number, { max: number; }>;
  float?: Validation<number, number, { float: number; currentFloat: number; }>;
  rules?: Rule<number>[];
};

function $num<P extends BaseProps & NumProps>(props: P = {} as P) {
  const retProps = {
    type: "num",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & NumProps, typeof retProps>(retProps),
  } as const;
};

type SourceItem<V> = Record<string, unknown> & {
  readonly value: V;
  text?: string;
  node?: React.ReactNode;
};

type SourceProps<V> = {
  items: SourceItem<V>[];
  required?: Validation<Nullable<V>, boolean>;
  rules?: Rule<V>[];
};

function $source<
  const V,
  P extends BaseProps & SourceProps<V>
>(props: P) {
  const retProps = {
    type: "src",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & Omit<SourceProps<V>, "items">, typeof retProps>(retProps),
  } as const;
};

type BoolProps<TrueValue, FalseValue> = {
  trueValue?: TrueValue;
  falseValue?: FalseValue;
  parser?: Parser<TrueValue | FalseValue>;
  required?: Validation<Nullable<TrueValue | FalseValue>, boolean | "nonFalse">;
  rules?: Rule<TrueValue | FalseValue>[];
  trueText?: string;
  falseText?: string;
};

function $bool<
  const TrueValue extends boolean | number | string,
  const FalseValue extends boolean | number | string,
  P extends BaseProps & BoolProps<TrueValue, FalseValue>
>(props: P = { trueValue: true, falseValue: false } as P) {
  type TV = P extends undefined ? true :
    P extends { trueValue: infer T; } ? T : true;
  type FV = P extends undefined ? false :
    P extends { falseValue: infer T; } ? T : false;
  const trueValue = (props?.trueValue ?? true) as TV;
  const falseValue = (props?.falseValue ?? false) as FV;

  const retProps = {
    type: "bool",
    ...props,
    trueValue,
    falseValue,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & Omit<BoolProps<TrueValue, FalseValue>, "trueValue" | "falseValue">, typeof retProps>(retProps),
  } as const;
};

type DateProps = {
  parser?: Parser<$Date>;
  required?: Validation<Nullable<$Date>, boolean, { date: $Date; }>;
  minDate?: Validation<$Date, $Date, { minDate: $Date; currentDate: $Date; }>;
  maxDate?: Validation<$Date, $Date, { maxDate: $Date; currentDate: $Date; }>;
  pair?: Validation<
    $Date,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $Date; position: "bafore" | "after"; currentDate: $Date; }
  >;
  rules?: Rule<$Date>[];
};

function $date<P extends BaseProps & DateProps>(props: P = {} as P) {
  const retProps = {
    type: "date",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & DateProps, typeof retProps>(retProps),
  } as const;
};

type MonthProps = {
  parser?: Parser<$Month>;
  required?: Validation<Nullable<$Month>, boolean, { date: $Month; }>;
  minMonth?: Validation<$Month, $Month, { minMonth: $Month; currentDate: $Month; }>;
  maxMonth?: Validation<$Month, $Month, { minMonth: $Month; currentDate: $Month; }>;
  pair?: Validation<
    $Month,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $Month; position: "bafore" | "after"; currentDate: $Month; }
  >;
  rules?: Rule<$Month>[];
};

function $month<P extends BaseProps & MonthProps>(props: P = {} as P) {
  const retProps = {
    type: "month",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & MonthProps, typeof retProps>(retProps),
  };
};

type TimeHMString = `${number}:${number}`;
type TimeHMSString = `${number}:${number}:${number}`;
type TimeString = TimeHMString | TimeHMSString;

type DateTimeProps = {
  parser?: Parser<$DateTime>;
  required?: Validation<Nullable<$DateTime>, boolean, { dateTime: $DateTime; }>;
  minDateTime?: Validation<$DateTime, $DateTime, { minDateTime: $DateTime; currentDateTime: $DateTime; }>;
  maxDateTime?: Validation<$DateTime, $DateTime, { maxDateTime: $DateTime; currentDateTime: $DateTime; }>;
  minDate?: Validation<$DateTime, $Date, { minDate: $Date; currentDateTime: $DateTime; }>;
  maxDate?: Validation<$DateTime, $Date, { maxDate: $Date; currentDateTime: $DateTime; }>;
  minTime?: Validation<TimeString, $Month, { minTime?: number; }>;
  maxTime?: Validation<TimeString, $Month, { mmnTime?: number; }>;
  pair?: Validation<
    $DateTime,
    { name: string; position: "before" | "after"; noSame?: boolean; },
    { pairDate: $DateTime; position: "bafore" | "after"; currentDate: $DateTime; }
  >;
  rules?: Rule<$DateTime>[];
};

function $datetime<P extends BaseProps & DateTimeProps>(props: P = {} as P) {
  const retProps = {
    type: "datetime",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & DateTimeProps, typeof retProps>(retProps),
  };
};

type FileProps = {
  parser?: Parser<File>;
  required?: Validation<Nullable<File>, boolean>;
  accept?: Validation<File, string, { accept: string; currentAccept: string; }>;
  maxSize?: Validation<File, number, { maxSize: number; currentSize: number; }>;
  rules?: Rule<File>[];
};

function $file<P extends BaseProps & FileProps>(props: P = {} as P) {
  const retProps = {
    type: "file",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & FileProps, typeof retProps>(retProps),
  } as const;
};

type ArrayProps<Content> = {
  prop: Content;
  required?: Validation<Nullable<InferValue<Content>[]>, boolean>;
  length?: Validation<InferValue<Content>[], number, { length: number; currentLength: number; }>;
  minLength?: Validation<InferValue<Content>[], number, { minLength: number; currentLength: number; }>;
  maxLength?: Validation<InferValue<Content>[], number, { maxLength: number; currentLength: number; }>;
  rules?: Rule<InferValue<Content>[]>[];
};

function $array<
  const Content,
  const P extends BaseProps & ArrayProps<Content>
>(props: P) {
  const retProps = {
    type: "arr",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & Omit<ArrayProps<Content>, "prop">, typeof retProps>(retProps),
  };
};

type ObjectProps<Contents> = {
  props: Contents;
  required?: Validation<Nullable<InferValue<Contents>>, boolean>;
  rules?: Rule<InferValue<Contents>>[];
};

function $object<
  const Contents,
  P extends BaseProps & ObjectProps<Contents>
>(props: P) {
  const retProps = {
    type: "obj",
    ...props,
  } as const;
  return {
    ...retProps,
    overwrite: getOverwriteFunc<BaseProps & Omit<ObjectProps<Contents>, "props">, typeof retProps>(retProps),
  };
};

const schemaObject = $object({
  props: {
    name: $str({
      // required: false,
      // required: [false, "optional"],
      // required: true,
      // required: [true],
      required: [true, "required"],
      // required: () => true,
      // required: [() => true],
      maxLength: 10,
    }).overwrite({
      required: false,
      minLength: 8,
      maxLength: 16,
    }).overwrite({
      // required: true,
      length: 16,
      minLength: null,
      maxLength: null,
    }),
    age: $num({
      required: true,
    }),
    mailaddr: $str({
      pattern: "email",
    }),
    image: $file({

    }),
    birth: $date({
      required: true,
    }),
    // regDate: $datetime({
    //   required: true,
    // }),
    // month: $month(),
    flag: $bool(),
    bitFlag: $bool({
      trueValue: 1,
      falseValue: 0,
    }),
    codeFlag: $bool({
      trueValue: "on",
      falseValue: "off",
      required: true,
    }).overwrite({
      required: false,
    }),
    agreement: $bool({
      required: "nonFalse",
    }).overwrite({
      required: false,
    }),
    roles: $array({
      prop: $str({ required: true }),
      required: true,
    }),
    obj: $object({
      props: {
        item1: $str(),
        item2: $num({ required: true }),
        item3: $bool(),
      },
    }).overwrite({
      required: true,
    }),
    objs: $array({
      prop: $object({
        props: {
          item1: $str({ required: true }),
          item2: $num(),
          item3: $bool(),
        },
        required: true,
      }),
    }).overwrite({
      required: true,
    }),
    selectStr: $source({
      items: [
        { value: "item1" },
        { value: "item2" },
        { value: "item3" },
      ],
      required: true,
    }),
    selectNum: $source({
      items: [
        { value: 0 },
        { value: 1 },
        { value: 2 },
      ] as const,
    }).overwrite({
      required: true,
    }),
  },
});

type InferRequired<R> = R extends Array<unknown> ? R[0] : R;

type InferValue<P> =
  P extends { type: infer T; required?: infer R; } ? (
    T extends "str" ? InferRequired<R> extends true ? string : Nullable<string> :
    T extends "num" ? InferRequired<R> extends true ? number : Nullable<number> :
    T extends "bool" ? (
      P extends { trueValue: infer TV; falseValue: infer FV; } ?
      InferRequired<R> extends true | "nonFalse" ? (TV | FV) : Nullable<(TV | FV)> :
      InferRequired<R> extends true | "nonFalse" ? boolean : Nullable<boolean>
    ) :
    T extends "src" ? (
      P extends { items: Array<{ value: infer V; }>; } ?
      InferRequired<R> extends true ? V : Nullable<V> :
      never
    ) :
    T extends "date" ? InferRequired<R> extends true ? $Date : Nullable<$Date> :
    T extends "month" ? InferRequired<R> extends true ? $Month : Nullable<$Month> :
    T extends "datetime" ? InferRequired<R> extends true ? $DateTime : Nullable<$DateTime> :
    T extends "file" ? InferRequired<R> extends true ? File : Nullable<File> :
    T extends "arr" ? (
      P extends { prop: infer Prop; } ? (
        InferRequired<R> extends true ? InferValue<Prop>[] : Nullable<InferValue<Prop>[]>
      ) : never
    ) :
    T extends "obj" ? (
      InferRequired<R> extends true ? Infer<P> : Nullable<Infer<P>>
    ) :
    never
  ) : never;

type Infer<P> = P extends ReturnType<typeof $object> ? { [K in keyof P["props"]]: InferValue<P["props"][K]> } : InferValue<P>;

type Hoge = Infer<typeof schemaObject>;
type _Fuga = Hoge["objs"][number]["item3"];

// eslint-disable-next-line no-console
console.log(schemaObject.props.name.parse());
