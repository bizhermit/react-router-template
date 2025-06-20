import { TextBox } from "~/components/elements/form/text-box";
import { $schema, parseWithSchema } from "~/components/schema";
import { $array } from "~/components/schema/array";
import { $bool } from "~/components/schema/boolean";
import { $date, $datetime, $month } from "~/components/schema/date";
import { $file } from "~/components/schema/file";
import { useSchema, useSchemaArray, useSchemaContext } from "~/components/schema/hooks";
import { $num } from "~/components/schema/numeric";
import { $str } from "~/components/schema/string";
import { $struct } from "~/components/schema/struct";

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

const birth = $date();

const schema = $schema({
  text: $str({
    pattern: "email",
  }),
  // requiredText: $str({
  //   required: true,
  // }),
  // dynamicRequiredText: $str({
  //   required: () => true,
  // }),
  // customMessageText: $str({
  //   required: [true, () => "入力しない場合、あなたの命は保証されません。"],
  // }),
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
  birth_day: birth.splitDay(),
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

type SchemaValue = Schema.SchemaValue<typeof schema>;
type TolerantSchemaValue = Schema.TolerantSchemaValue<typeof schema>;

const start = performance.now();
const submittion = parseWithSchema({
  schema,
  env: {
    isServer: true,
    t: (k) => k,
  },
  dep: {},
  data: {
    text: "hogefuga",
    sourceText: "hoge",
    count: 10,
    array: [1, 2, 3],
    structArray: [
      { name: "hoge" },
      { age: 2 },
      { birth: "2025-06-15" },
    ],
    struct: {

    },
  } satisfies TolerantSchemaValue,
})
// console.log(submittion);
console.log(performance.now() - start);

export default function Page() {
  const { SchemaProvider, dataItems, getData } = useSchema({
    schema,
  });

  // console.log(dataItems);

  return (
    <SchemaProvider>
      <div>
      </div>
      <form
        noValidate
        onSubmit={e => {
          e.stopPropagation();
          e.preventDefault();
          console.log(getData());
        }}
      >
        <Component1 />
        <Component2 />
        <button type="submit">
          submit
        </button>
      </form>
    </SchemaProvider>
  );
}

function Component1() {
  const { dataItems } = useSchemaContext<typeof schema>();
  console.log(dataItems);

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
    <div>
      <TextBox $={dataItems.text} />
    </div>
  );
}