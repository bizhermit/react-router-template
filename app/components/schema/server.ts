import { AUTH_COOKIE_NAMES } from "~/auth/consts";
import { getI18n } from "~/i18n/server/loader";
import { parseWithSchema } from ".";
import { cookieStore } from "../cookie/server";

interface Params<$Schema extends Record<string, Schema.$Any>> {
  request: Request;
  schema: $Schema;
  data?: FormData | Record<string, unknown>;
  dep?: Record<string, unknown>;
  skipCsrfCheck?: boolean;
  session?: import("@auth/core/types").Session | null;
}

export async function getPayload<$Schema extends Record<string, Schema.$Any>>({
  request,
  schema,
  data,
  dep,
  skipCsrfCheck = false,
  session,
}: Params<$Schema>) {
  const i18n = getI18n(request);
  const formData = data ?? await request.formData();
  const submission = parseWithSchema({
    data: formData,
    env: {
      isServer: true,
      t: i18n.t,
    },
    schema,
    dep,
  });
  delete (submission as Partial<typeof submission>).dataItems;
  if (!skipCsrfCheck) {
    const sessionCsrfToken = session?.csrfToken;
    const cookieCsrfToken = cookieStore(request).getCookie(AUTH_COOKIE_NAMES.csrfToken)?.split("|")?.[0];
    const csrfToken = submission.data.csrfToken;

    if (
      (sessionCsrfToken && sessionCsrfToken !== csrfToken) ||
      (!sessionCsrfToken && cookieCsrfToken && cookieCsrfToken !== csrfToken)
    ) {
      return {
        hasError: true as const,
        data: {},
        results: {
          csrfToken: {
            code: "csrf",
            type: "e",
            message: "Invalid CSRF token",
          } satisfies Schema.Result,
        },
      };
    }
  }

  return submission as ({
    hasError: true;
    data: Schema.SchemaValue<$Schema, true>;
    results: Record<string, Schema.Result>;
  } | {
    hasError: false;
    data: Schema.SchemaValue<$Schema>;
    results: Record<string, Schema.Result>;
  });
};
