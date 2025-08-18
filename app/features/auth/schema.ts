import { $schema } from "~/components/schema";
import { $str } from "~/components/schema/string";

export const authSchema = $schema({
  userId: $str({
    label: "User ID",
    required: true,
  }),
  password: $str({
    label: "Password",
    required: true,
  }),
});
