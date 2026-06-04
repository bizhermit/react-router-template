import { getPayload } from "$/shared/schema/server";
import { APIError } from "better-auth";
import { authSchema } from "../shared/schema";
import { getSignedInUrl } from "../shared/signed-in-url";
import { auth } from "./auth";

const SIGN_IN_MESSAGE_KEYS = {
  failed: "signIn_failed",
  fatal: "signIn_fatal",
} as const satisfies Record<string, I18nTextKey>;

export type SignInByEmailResult =
  | {
    ok: true;
    headers: Headers;
    redirectTo: string;
  }
  | {
    ok: false;
    messageKey: I18nTextKey;
  };

export async function signInByEmail(request: Request): Promise<SignInByEmailResult> {
  try {
    const submission = await getPayload({
      request,
      schema: authSchema,
    });
    if (!submission.ok) {
      // 入力不正はユーザー向け失敗メッセージへ寄せる
      return {
        ok: false,
        messageKey: SIGN_IN_MESSAGE_KEYS.failed,
      };
    }

    const { headers } = await auth.api.signInEmail({
      body: {
        email: submission.values.email,
        password: submission.values.password,
      },
      returnHeaders: true,
    });

    return {
      ok: true,
      headers,
      redirectTo: getSignedInUrl(request.url),
    };
  } catch (err) {
    if (err instanceof APIError) {
      // 認証API由来の例外は詳細を出さず失敗メッセージに統一
      return {
        ok: false,
        messageKey: SIGN_IN_MESSAGE_KEYS.failed,
      };
    }
    return {
      ok: false,
      messageKey: SIGN_IN_MESSAGE_KEYS.fatal,
    };
  }
};
