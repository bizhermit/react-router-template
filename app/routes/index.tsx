import { CheckBox } from "~/components/elements/form/check-box";
import { FormItem } from "~/components/elements/form/common";
import { DateBox } from "~/components/elements/form/date-box";
import { FileBox } from "~/components/elements/form/file-box";
import { NumberBox } from "~/components/elements/form/number-box";
import { RadioButtons } from "~/components/elements/form/radio-buttons";
import { SelectBox } from "~/components/elements/form/select-box";
import { TextArea } from "~/components/elements/form/text-area";
import { TextBox } from "~/components/elements/form/text-box";
import { $schema, parseWithSchema } from "~/components/schema";
import { $array } from "~/components/schema/array";
import { $bool } from "~/components/schema/boolean";
import { $date, $datetime, $month } from "~/components/schema/date";
import { $file } from "~/components/schema/file";
import { useSchema, useSchemaArray, useSchemaContext } from "~/components/schema/hooks";
import { $num } from "~/components/schema/number";
import { $str } from "~/components/schema/string";
import { $struct } from "~/components/schema/struct";
import type { Route } from "./+types";
import { data, useFetcher } from "react-router";
import { DateSelectBox } from "~/components/elements/form/date-select-box";
import { useState, type ReactNode } from "react";
import { Text } from "~/i18n/react-component";
import { useLocale, useText } from "~/i18n/hooks";
import { getPayload } from "~/components/schema/server";

const text = $str(
  {
    // required: true,
    // source: [
    //   { value: "hoge", text: "HOGE" },
    //   { value: "fuga", text: "FUGA" },
    //   { value: "piyo", text: "PIYO" },
    // ],
  }
);

const birth = $date({
  // required: true,
});

const schema = $schema({
  text: $str({
    required: true,
    min: 4,
    pattern: "email",
  }),
  requiredText: $str({
    required: true,
  }),
  // dynamicRequiredText: $str({
  //   required: () => true,
  // }),
  customMessageText: $str({
    required: [true, () => "入力しない場合、あなたの命は保証されません。"],
  }),
  // customDynamicRequiredText: $str({
  //   required: [() => true, () => "入力しなくても命だけは獲らないでいてやる。"],
  // }),
  sourceText: $str({
    required: true,
    source: [
      { value: "hoge", text: "HOGE" },
      { value: "fuga", text: "FUGA" },
      { value: "piyo", text: "PIYO" },
    ] as const,
  }),
  count: $num(),
  // age: $num({ required: true }),
  generation: $num({
    source: [
      { value: 0, text: "無印" },
      { value: 1, text: "AG" },
      { value: 2, text: "DP" },
      { value: 3, text: "BW" },
      { value: 4, text: "XY" },
      { value: 5, text: "SM" },
      { value: 6, text: "新無印" },
    ] as const,
  }),
  check: $bool(),
  // agreement: $bool({
  //   required: true,
  //   requiredAsTrue: true,
  // }),
  numFlag: $bool({
    trueValue: 1 as const,
    falseValue: 0 as const,
    required: true,
  }),
  month: $month({
    required: true,
  }),
  date: $date(),
  datetime: $datetime(),
  datetimeHasSecond: $datetime({
    time: "hms",
  }),
  birth_year: birth.splitYear({
    required: true,
  }),
  birth_month: birth.splitMonth({
    required: true,
  }),
  birth_day: birth.splitDay({
  }),
  file: $file({
    required: true,
  }),
  array: $array({
    prop: $num(),
  }),
  struct: $struct({
    props: {
      name: $str({
        required: true,
      }),
      age: $num(),
      birth: $date(),
    },
  }),
  structArray: $array({
    prop: $struct({
      props: {
        name: $str({
          required: true,
        }),
        age: $num(),
        birth: $month(),
      },
    }),
  }),
});

// type SchemaValue = Schema.SchemaValue<typeof schema>;
// type TolerantSchemaValue = Schema.TolerantSchemaValue<typeof schema>;

// const start = performance.now();
// const submittion = parseWithSchema({
//   schema,
//   env: {
//     isServer: true,
//     t: (k) => k,
//   },
//   dep: {},
//   data: {
//     text: "hogefuga",
//     sourceText: "hoge",
//     count: 10,
//     array: [1, 2, 3],
//     structArray: [
//       { name: "hoge" },
//       { age: 2 },
//       { birth: "2025-06-15" },
//     ],
//     struct: {

//     },
//   } satisfies TolerantSchemaValue,
// })
// console.log(submittion);
// console.log(performance.now() - start);

export async function action(args: Route.ActionArgs) {
  console.log("-----------------");
  const start = performance.now();
  const submittion = await getPayload(args.request, schema);
  console.log(submittion);
  console.log(performance.now() - start);
  console.log("-----------------");

  return data({
    data: submittion.data,
    results: submittion.results,
  });
};

export default function Page(props: Route.ComponentProps) {
  const fetcher = useFetcher();

  const { SchemaProvider, getData } = useSchema({
    schema,
    data: fetcher.data ? fetcher.data.data :
      props.actionData ? props.actionData.data :
        // props.loaderData ? props.loaderData.data :
        undefined,
    results: fetcher.data ? fetcher.data.results :
      props.actionData ? props.actionData.results :
        // props.loaderData ? props.loaderData.results :
        undefined,
  });

  // console.log(dataItems);

  return (
    <SchemaProvider>
      <div>
      </div>
      <fetcher.Form
        method="post"
        encType="multipart/form-data"
        noValidate
        onSubmit={e => {
          // e.stopPropagation();
          // e.preventDefault();
          console.log(getData());
        }}
      >
        <Component1 />
        <Component2 />
        <button type="submit">
          submit
        </button>
      </fetcher.Form>
      <LangComponent />
    </SchemaProvider>
  );
}

function Component1() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const array = useSchemaArray(dataItems.structArray);

  return (
    <div>
      <div className="flex flex-row gap-2">
        <button
          type="button"
          onClick={() => {
            array.push({
              name: "hoge"
            });
          }}
        >
          push last
        </button>
        <button
          type="button"
          onClick={() => {
            array.push({
              name: "hogehoge"
            }, { position: "first" });
          }}
        >
          push first
        </button>
        <button
          type="button"
          onClick={() => {
            array.bulkPush([
              { name: "fuga", age: 3 },
              { name: "piyo" }
            ])
          }}
        >
          bulk push
        </button>
      </div>
      <ul>
        {array.map(params => {
          return (
            <li key={params.key}>
              <span>
                {JSON.stringify(params.value)}
              </span>
              <button
                type="button"
                onClick={() => {
                  params.remove();
                }}
              >
                delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function Component2() {
  const { dataItems } = useSchemaContext<typeof schema>();

  return (
    <div className="flex flex-row flex-wrap gap-2">
      <FormItem>
        <TextBox
          $={dataItems.text}
          placeholder="テキスト"
        />
      </FormItem>
      <FormItem>
        <NumberBox
          $={dataItems.count}
          placeholder="数値"
        />
      </FormItem>
      <FormItem>
        <SelectBox
          $={dataItems.generation}
          placeholder="世代"
        />
      </FormItem>
      <DynamicSelectBoxComponent />
      <FormItem>
        <CheckBox
          $={dataItems.check}
        >
          Check
        </CheckBox>
      </FormItem>
      <FormItem>
        <CheckBox
          $={dataItems.numFlag}
        >
          Check(Num)
        </CheckBox>
      </FormItem>
      <FormItem>
        <RadioButtons
          $={dataItems.sourceText}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.date}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.month}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.datetime}
        />
      </FormItem>
      <FormItem>
        <DateSelectBox
          $={dataItems.birth_year}
        />
      </FormItem>
      <FormItem>
        <TextArea
          $={dataItems.customMessageText}
        />
      </FormItem>
      <FormItem>
        <FileBox
          $={dataItems.file}
          placeholder="ファイルを選択してください。"
          viewMode="image"
        />
      </FormItem>
    </div>
  );
};

function DynamicSelectBoxComponent() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const [count, setCount] = useState(0);
  const [source, setSource] = useState<Schema.Source<string>>([
    { value: "hoge", text: "HOGE" },
    { value: "fuga", text: "FUGA" },
    { value: "piyo", text: "PIYO" },
  ]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const c = count + 1;
          setCount(c);
          setSource([
            { value: "hoge", text: `HOGE - ${c}` },
            { value: "fuga", text: `FUGA - ${c}` },
            { value: "piyo", text: `PIYO - ${c}` },
          ]);
        }}
      >
        countup {count}
      </button>
      <FormItem>
        <SelectBox
          $={dataItems.requiredText}
          source={source}
        />
      </FormItem>
    </div>
  );
};

function LangComponent() {
  const t = useText();
  const locale = useLocale();

  return (
    <div>
      <span>{t("halloWorld")}</span>
      <span>{t("replaceText", { hoge: "人民", fuga: 1000 })}</span>
      <div>{t("htmlText")}</div>
      <div>
        <Text
          i18nKey="htmlText"
          replaceMap={{
            "replace1": (props: { children?: ReactNode }) => <span style={{ color: "red" }}>完全に置き換えてもいいよ{props.children}</span>,
          }}
        />
      </div>
      {/* <p>
          <span>dangerouslySetInnerHTML</span>
          <div dangerouslySetInnerHTML={{ __html: t("htmlText") }} />
        </p> */}
      <div className="flex gap-3">
        <button type="button" onClick={() => {
          locale.switch("ja");
        }}>
          ja
        </button>
        /
        <button type="button" onClick={() => {
          locale.switch("en");
        }}>
          en
        </button>
      </div>
    </div>
  );
};