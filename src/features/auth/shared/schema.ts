import { $schema } from "$/shared/schema";
import { $str } from "$/shared/schema/string";

/** 認証スキーマ */
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
