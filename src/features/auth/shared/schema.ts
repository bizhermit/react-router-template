import { $schema } from "$/shared/schema";
import { $str } from "$/shared/schema/string";

export const authSchema = $schema({
  email: $str({
    label: "MailAddress",
    required: true,
  }),
  password: $str({
    label: "Password",
    required: true,
  }),
});
