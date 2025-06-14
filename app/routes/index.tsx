import { $schema } from "~/components/schema";
import { $str } from "~/components/schema/string";

const text = $str({
  required: true,
  source: [
    { value: "hoge", text: "HOGE" },
    { value: "fuga", text: "FUGA" },
    { value: "piyo", text: "PIYO" },
  ],
});

const schema = $schema({
  text: $str(),
  requiredText: $str({ required: true }),
  sourceText: $str({
    required: true,
    source: [
      { value: "hoge", text: "HOGE" },
      { value: "fuga", text: "FUGA" },
      { value: "piyo", text: "PIYO" },
    ] as const,
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
