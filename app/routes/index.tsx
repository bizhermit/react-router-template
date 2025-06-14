import { $schema } from "~/components/schema";
import { $array } from "~/components/schema/array";
import { $bool } from "~/components/schema/boolean";
import { $month } from "~/components/schema/date";
import { $file } from "~/components/schema/file";
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

const schema = $schema({
  text: $str(),
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
    // required: true,
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
    },
  }),
  structArray: $array({
    prop: $struct({
      props: {
        name: $str({
          required: true,
        }),
        age: $num(),
      },
    }),
  }),
});

type SchemaValue = Schema.SchemaValue<typeof schema>;
type TolerantSchemaValue = Schema.TolerantSchemaValue<typeof schema>;

export default function Page() {
  return (
    <div>
      hoge
    </div>
  );
}
