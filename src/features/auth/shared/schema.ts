import { $obj } from "$/shared/schema/$/object";
import { $str } from "$/shared/schema/$/string";

/** 認証スキーマ */
export const authSchema = $obj({
  props: {
    email: $str({
      label: "MailAddress",
      required: true,
    }),
    password: $str({
      label: "Password",
      required: true,
    }),
  },
});
