import { Button } from "$/components/elements/button/button";
import { DeleteIcon } from "$/components/elements/icon";
import { SchemaProviderContext, useArraySchema, useHasError, useSchema, type SchemaProviderContextProps } from "$/shared/hooks/$schema";
import { useRender } from "$/shared/hooks/render";
import { $Date, $DateTime } from "$/shared/objects/timestamp";
import { parseWithSchema } from "$/shared/schema/$";
import { $arr } from "$/shared/schema/$/array";
import { $bool } from "$/shared/schema/$/boolean";
import { $date } from "$/shared/schema/$/date";
import { $enum } from "$/shared/schema/$/enum";
import { $num } from "$/shared/schema/$/number";
import { $obj } from "$/shared/schema/$/object";
import { $str } from "$/shared/schema/$/string";
import { use, useEffect, useState, useSyncExternalStore } from "react";
import { data } from "react-router";
import type { Route } from "./+types/form";

const items = [
  { value: 0 },
  { value: 1 },
  { value: 2 },
] as const;

const birth = $date({
  // required: true,
  maxDate: new $Date("2026-12-12"),
}).overwrite({
  required: true,
  // maxDate: new $Date("2026-12-12"),
});
const birth_year = birth.getSplitYear({
  // required: true,
  // required: false,
  // required: "inherit",
});
type _Birth = $Schema.Infer<typeof birth>;
type __BirthYear = typeof birth_year;
type _BirthYear = $Schema.Infer<typeof birth_year, true>;

const str = $str({
  // required: true,
});
const str2 = str.overwrite({
  required: [true],
});
const bool = $bool({
  trueValue: "yes",
  falseValue: "no",
  required: true,
});
const bool2 = $bool({
  trueValue: 1,
  falseValue: 0,
}).overwrite({
  // trueValue: 2,
  // falseValue: 3,
  // required: false,
  // required: [true],
  required: "nonFalse",
});
const arr = $arr({
  prop: $str({}),
  // required: true,
}).overwrite({
  required: true,
});

const date = $date({
  required: true,
});
const year = date.getSplitYear({
  // required: "inherit",
});

const enum1 = $enum({
  items: [
    { value: "item1" },
    { value: "item2" },
    { value: "item3" },
  ],
  required: true,
});
const enum2 = $enum({
  items,
});

const schemaObj = $obj({
  props: {
    str: str,
    str2: str2,
    num: $num({
    }).overwrite({
      // required: true,
    }),
    bool: bool,
    bool2: bool2,
    arr: arr,
    arr2: $arr({
      prop: $obj({
        props: {
          name: $str({ required: true }),
          age: $num({ required: true }),
        },
        required: true,
      }),
      required: true,
    }),
    enum: enum1,
    enum2: enum2,
  },
}).overwrite({
  required: true,
});

type T = typeof bool["trueValue"];
type F = typeof bool["falseValue"];
type T2 = typeof bool2["trueValue"];
type F2 = typeof bool2["falseValue"];

type _Str = $Schema.Infer<typeof str, true>;
type _Str2 = $Schema.Infer<typeof str2, true>;
type _Bool = $Schema.Infer<typeof bool, true>;
type _Bool2 = $Schema.Infer<typeof bool2, true>;
type _Obj = $Schema.Infer<typeof schemaObj, true>;
type _Date = $Schema.Infer<typeof date, true>;
type _Year = $Schema.Infer<typeof year, true>;
type _Enum = $Schema.Infer<typeof enum1, true>;
type _Enum2 = $Schema.Infer<typeof enum2, true>;

type _FormItem = $Schema.InferFormItems<typeof schemaObj>["arr2"]["age"];
type _FormItem2 = $Schema.InferFormItems<typeof schemaObj>["arr"];

// type _Hoge = $Schema.Infer<typeof schemaObject>;
// type _Fuga = $Schema.Infer<typeof schemaObject, true>;
// // type _Fuga = typeof schemaObject["props"]["selectStr"]["items"];
// // type _Piyo = typeof schemaObject["props"]["selectNum"]["items"];
// const parsed1 = birth.parse(3124).value;
// const parsed2 = schemaObject.parse({ hoge: 1 }).value;
// const parsed3 = schemaObject.parse({ hoge: 1 }).value;

const msg: $Schema.I18nMessage = {
  key: "maxStrLength" as const,
  label: "名前",
  type: "e",
  name: "name",
  code: "maxLength",
  params: {
    maxLength: 10,
  },
  actionType: "input",
};

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

function SchemaContent() {
  console.log("** render schema content");

  const render = useRender();

  const { context } = use(SchemaProviderContext) as SchemaProviderContextProps<typeof schemaObj>;
  const formItems = context.getFormItems();

  const str2 = useSyncExternalStore((callback) => {
    const cleanup = context.addValuesSubscribe(formItems.str2.getName(), callback);
    return () => cleanup();
  }, () => {
    return context.getValue(formItems.str2.getName());
  }, () => {
    return context.getValue(formItems.str2.getName());
  });

  const str2Msg = useSyncExternalStore((callback) => {
    const cleanup = context.addMessageSubscribe(formItems.str2.getName(), callback);
    return () => cleanup();
  }, () => {
    return context.getMessage(formItems.str2.getName());
  }, () => {
    return context.getMessage(formItems.str2.getName());
  });

  const arr = useArraySchema(formItems.arr);
  const arr2 = useArraySchema(formItems.arr2);

  console.log("render: ", str2, str2Msg);

  useEffect(() => {
    console.log("mount", formItems);
    return () => {
      console.log("unmount");
    };
  }, []);

  return (
    <section className="flex flex-col gap-2 p-2">
      <h2>Schema Provider</h2>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            console.log(context.getValues());
          }}
        >
          show
        </Button>
        <Button
          onClick={() => {
            context.setValue("str2", "hogefugapiyo");
          }}
        >
          set value
        </Button>
        <Button
          onClick={() => {
            context.setValue("str2", null);
          }}
        >
          clear value
        </Button>
        <Button
          onClick={() => {
            // const map = new Map<string, string>();
            // map.set("hoge", "fuga");
            // console.log(JSON.stringify(map));
            // const struct = { "": "" };
            // const hoge = { hoge: 1, fuga: 2 };
            // const fuga = { fuga: 3, piyo: "4" };
            // const piyo = Object.assign(hoge, fuga);
            // console.log(hoge, fuga, piyo);
            console.log(context.getFormItems());
          }}
        >

        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {
          arr.map(({ key, name, value, formItem }) => {
            formItem.getName();
            return (
              <li key={key}>
                ・
                {name}
                ：
                {JSON.stringify(value)}
              </li>
            );
          })
        }
      </ul>
      <hr />
      <ul className="flex flex-col gap-2">
        {
          arr2.map(({ key, index, name, value, formItems, remove }) => {
            formItems.age.getName();
            return (
              <li key={key}>
                ・
                {name}
                ：
                {JSON.stringify(value)}
                <div className="flex flex-row flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      formItems.name.setValue(key);
                      render();
                    }}
                  >
                    set name
                  </Button>
                  <Button
                    onClick={() => {
                      formItems.age.setValue(index);
                      render();
                    }}
                  >
                    set age
                  </Button>
                  <Button
                    onClick={() => {
                      remove();
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              </li>
            );
          })
        }
      </ul>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            arr2.remove();
          }}
        >
          clear
        </Button>
        <Button
          onClick={() => {
            arr2.add({
              name: "piyo",
            });
          }}
        >
          add
        </Button>
      </div>
      <hr />
    </section>
  );
};

export function DisplayHasError() {
  const hasError = useHasError();
  return (
    <span>
      error: {String(hasError)}
    </span>
  );
};

export default function Page() {
  const [dateValue, setDateValue] = useState<$DateTime>(() => new $DateTime());
  const render = useRender();

  const [values, setValues] = useState(() => {
    return {
      arr: [
        "hoge",
        "fuga",
      ],
      arr2: [
        { name: "hoge", age: 1 },
        { name: "fuga" },
        {},
      ],
    };
  });
  const schema = useSchema({
    schema: schemaObj,
    values,
  });

  return (
    <div>
      form sandbox
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            const dummyValues = {
              // name: null,
              // name: "hogefugapiyo",
              year: "2027",
              // year: null,
              hoge: 132,
            };
            console.log("--------");
            const now = performance.now();
            // const params: $Schema.InjectParams = {
            //   data: {},
            //   isServer: false,
            //   values: dummyValues,
            // };
            // const parsed = schemaObject.parse(
            //   dummyValues,
            //   params
            // );
            // console.log(parsed);
            // const submission = schemaObj.validate(parsed.value, params);
            // console.log(submission.reduce((prev, msg) => {
            //   prev[msg.name || "_root"] = msg;
            //   return prev;
            // }, {} as Record<string, $Schema.Message>));
            // schemaObject.props.name.required = false;
            const submission = parseWithSchema({
              schema: schemaObj,
              values: {
                // name: "ghoe",
                // age: 100,
                // agreement: false,
                arr2: [
                  { name: "hoge", age: 1 },
                  { name: "fuga" },
                  {},
                ],
              } satisfies $Schema.Infer<typeof schemaObj>,
            });
            console.log("-", performance.now() - now);
            if (submission.ok) {
              submission.values.bool;
            } else {
              submission.values?.bool;
            }
            console.log(JSON.stringify(submission, null, 2));
            // console.log("-", validationMessage);
          }}
        >
          validate
        </Button>
      </div>
      <schema.SchemaProvider>
        <DisplayHasError />
        <SchemaContent />
      </schema.SchemaProvider>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            const d = new $DateTime();
            console.log(d);
            setDateValue(d);
          }}
        >
          reset
        </Button>
        <Button
          onClick={() => {
            setDateValue(new $DateTime(new $Date(dateValue)));
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
              setDateValue(new $DateTime("Thu Apr 16 2026 18:28:52 GMT+0900 (日本標準時)"));
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
            setDateValue(new $DateTime(d));
          }}
        >
          set date
        </Button>
        <Button
          onClick={() => {
            setDateValue(new $DateTime(Date.now()));
          }}
        >
          set number
        </Button>
        <Button
          onClick={() => {
            dateValue?.setNow();
            render();
          }}
        >
          set now
        </Button>
        <Button
          onClick={() => {
            dateValue.setMonth(2);
            render();
          }}
        >
          set month 8
        </Button>
        <Button
          onClick={() => {
            dateValue.setDay(0);
            render();
          }}
        >
          set day 0
        </Button>
        <Button
          onClick={() => {
            dateValue.setDay(1);
            render();
          }}
        >
          set day 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.addYear(1);
            render();
          }}
        >
          add year 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMonth(1);
            render();
          }}
        >
          add month 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addDay(1);
            render();
          }}
        >
          add day 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addHour(1);
            render();
          }}
        >
          add hour 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMinute(1);
            render();
          }}
        >
          add minute 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addSecond(1);
            render();
          }}
        >
          add second 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMillisecond(1);
            render();
          }}
        >
          add millisecond 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.addYear(-1);
            render();
          }}
        >
          minus year 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMonth(-1);
            render();
          }}
        >
          minus month 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addDay(-1);
            render();
          }}
        >
          minus day 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addHour(-1);
            render();
          }}
        >
          minus hour 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMinute(-1);
            render();
          }}
        >
          minus minute 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addSecond(-1);
            render();
          }}
        >
          minus second 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMillisecond(-1);
            render();
          }}
        >
          minus millisecond 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.moveFirstDay();
            render();
          }}
        >
          move first day
        </Button>

        <Button
          onClick={() => {
            dateValue.moveLastDay();
            render();
          }}
        >
          move last day
        </Button>
      </div>
      {
        dateValue &&
        <ul className="px-8 py-4 list-disc">
          <li>年: {dateValue.getYear()}</li>
          <li>月: {dateValue.getMonth()}</li>
          <li>日: {dateValue.getDay()}</li>
          <li>時: {dateValue.getHour()}</li>
          <li>分: {dateValue.getMinute()}</li>
          <li>秒: {dateValue.getSecond()}</li>
          <li>ms: {dateValue.getMillisecond()}</li>
          <li>曜: {dateValue.getWeek()}</li>
          <hr />
          <li>iso: {dateValue.toISOString()}</li>
          <li>json: {dateValue.toJSON()}</li>
          <li>str: {dateValue.toString()}</li>
          <li>date: {dateValue.toDateString()}</li>
          <li>time: {dateValue.toTimeString()}</li>
          <li>offset: {dateValue.getOffset()}</li>
          <li>{dateValue.toString(`yyyy年MM月dd日(W) hh時mm分ss秒`)}</li>
          <li>{JSON.stringify({ value: dateValue })}</li>
        </ul>
      }
    </div>
  );
};
