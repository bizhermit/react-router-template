import { Button } from "$/components/elements/button/button";
import { useRender } from "$/shared/hooks/render";
import { $Date, $DateTime } from "$/shared/objects/timestamp";
import { parseWithSchema } from "$/shared/schema/$";
import { $array } from "$/shared/schema/$/array";
import { $bool } from "$/shared/schema/$/boolean";
import { $date } from "$/shared/schema/$/date";
import { $enum } from "$/shared/schema/$/enum";
import { $file } from "$/shared/schema/$/file";
import { $num } from "$/shared/schema/$/number";
import { $object } from "$/shared/schema/$/object";
import { $str } from "$/shared/schema/$/string";
import { useState } from "react";
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

const schemaObject = $object({
  props: {
    name: $str({
      // label: "名前",
      // // required: false,
      // // required: [false, "optional"],
      // // required: true,
      // // required: [true],
      // required: [true, "required"],
      // // required: () => true,
      // // required: [() => true],
      // maxLength: 10,
      label: "名前",
      // required: [true, "input required"],
      required: [true, () => "input required"],
      maxLength: 10,
    }).overwrite({
      // required: false,
      minLength: 8,
      maxLength: 16,
    }).overwrite({
      // required: false,
      required: true,
      length: [10, ({ value, params: { currentLength, length } }) => {
        return null;
      }],
      // length: 16,
      // minLength: null,
      // maxLength: null,
    }),
    age: $num({
      required: true,
    }),
    // mailaddr: $str({
    //   pattern: "email",
    // }),
    image: $file({

    }),
    birth: $date({
      required: true,
    }),
    year: birth.getSplitYear({
      // required: true,
      // required: "inherit",
      // required: false,
    }),
    // regDate: $datetime({
    //   required: true,
    // }),
    // month: $month(),
    // flag: $bool(),
    // bitFlag: $bool({
    //   trueValue: 1,
    //   falseValue: 0,
    // }),
    // codeFlag: $bool({
    //   trueValue: "on",
    //   falseValue: "off",
    //   // required: true,
    // }).overwrite({
    //   // required: false,
    //   required: "nonFalse",
    //   // trueValue: "ononon",
    // }),
    agreement: $bool({
      required: "nonFalse",
    }).overwrite({
      required: false,
    }),
    roles: $array({
      prop: $str({
        required: true,
      }),
      required: true,
    }),
    // obj: $object({
    //   props: {
    //     item1: $str(),
    //     item2: $num({ required: true }),
    //     item3: $bool(),
    //   },
    // }).overwrite({
    //   required: true,
    // }),
    objs: $array({
      prop: $object({
        props: {
          item1: $str({ required: true }),
          item2: $num(),
          item3: $bool(),
        },
        // required: true,
      }),
    }).overwrite({
      required: true,
    }),
    selectStr: $enum({
      items: [
        { value: "item1" },
        { value: "item2" },
        { value: "item3" },
      ],
      required: true,
    }),
    selectNum: $enum({
      items: items,
    }).overwrite({
      required: true,
    }),
  },
});

type _Hoge = $Schema.Infer<typeof schemaObject>;
type _Fuga = $Schema.Infer<typeof schemaObject, true>;
// type _Fuga = typeof schemaObject["props"]["selectStr"]["items"];
// type _Piyo = typeof schemaObject["props"]["selectNum"]["items"];
const parsed1 = birth.parse(3124).value;
const parsed2 = schemaObject.parse({ hoge: 1 }).value;
const parsed3 = schemaObject.parse({ hoge: 1 }).value;

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

export default function Page() {
  const [value, setValue] = useState<$DateTime>(() => new $DateTime());
  const render = useRender();
  return (
    <div>
      form sandbox
      <div className="flex row gap-2">
        <Button
          onClick={() => {
            const dummyValues = {
              name: null,
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
            // const submission = schemaObject.validate(parsed.value, params);
            // console.log(submission.reduce((prev, msg) => {
            //   prev[msg.name || "_root"] = msg;
            //   return prev;
            // }, {} as Record<string, $Schema.Message>));
            const submission = parseWithSchema({
              schema: schemaObject,
              values: {
                name: "",
                age: 100,
              },
            });
            if (submission.ok) {
              submission.values.name;
            } else {
              submission.values.name;
            }
            console.log();
            console.log("-", performance.now() - now);
            // console.log("-", validationMessage);
          }}
        >
          validate
        </Button>
      </div>
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
