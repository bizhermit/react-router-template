import { getI18n } from "~/i18n/server";
import { parseWithSchema } from ".";

export async function getPayload<$Schema extends Record<string, any>>(request: Request, schema: $Schema, dep?: Record<string, any>) {
  const i18n = getI18n(request);
  const formData = await request.formData();
  return parseWithSchema({
    data: formData,
    env: {
      isServer: true,
      t: i18n.t,
    },
    schema,
    dep,
  });
};
