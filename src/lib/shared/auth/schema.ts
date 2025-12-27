import { $schema } from "../schema";
import { $str } from "../schema/string";

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
