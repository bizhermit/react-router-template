import { getI18n } from "~/i18n/server";
import { parseWithSchema } from ".";

export async function getPayload<$Schema extends Record<string, Schema.$Any>>(
  request: Request,
  schema: $Schema,
  dep?: Record<string, unknown>
) {
  const i18n = getI18n(request);
  const formData = await request.formData();
  const { hasError, data, results } = parseWithSchema({
    data: formData,
    env: {
      isServer: true,
      t: i18n.t,
    },
    schema,
    dep,
  });
  return { hasError, data, results };
};
