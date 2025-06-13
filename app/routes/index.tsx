import { $schema } from "~/components/schema";
import { $str } from "~/components/schema/string";

const schema = $schema({
  text: $str({}),
  requiredText: $str({ required: true }),
});

type Hoge = Schema.SchemaValue<typeof schema>;

export default function Page() {
  return (
    <div>
      hoge
    </div>
  );
}
