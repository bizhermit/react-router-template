import { getI18n } from "~/i18n/server/loader";
import { parseWithSchema } from ".";
import { cookieStore } from "../cookie/server";

interface Params<$Schema extends Record<string, Schema.$Any>> {
  request: Request;
  schema: $Schema;
  data?: FormData | Record<string, unknown>;
  dep?: Record<string, unknown>;
  skipCsrfCheck?: boolean;
}

export async function getPayload<$Schema extends Record<string, Schema.$Any>>({
  request,
  schema,
  data,
  dep,
  skipCsrfCheck = false,
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
    const csrfToken = submission.data.csrfToken;
    const cookieCsrfToken = cookieStore(request).getCookie("csrf-token");
    if (!csrfToken || csrfToken !== cookieCsrfToken) {
      return {
        hasError: true,
        data: {},
        results: {
          csrfToken: {
            error: "Invalid CSRF token",
          },
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
