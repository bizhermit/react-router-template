import { $schema } from "~/components/schema";
import { $str } from "~/components/schema/string";

export const signInSchema = $schema({
  userId: $str({
    label: "userId",
    required: true,
  }),
  password: $str({
    label: "password",
    required: true,
  }),
});
