// import { parseWithSchema } from ".";
import { parseWithSchema } from "./$";
import type { $ObjSchema } from "./$/object";

interface PayloadParams<S extends $ObjSchema<any, any>> {
  request: Request;
  schema: S;
  values?: FormData | Record<string, unknown>;
  data?: Record<string, unknown>;
};

export async function getPayload<S extends $ObjSchema<any, any>>({
  request,
  schema,
  values,
  data = {},
}: PayloadParams<S>) {
  const formData = values ?? await request.formData();
  const struct = formData instanceof FormData ?
    (() => {
      const obj: Record<string, unknown> = {};
      for (const [key, value] of formData.entries()) {
        if (obj[key]) {
          obj[key] = Array.isArray(obj[key])
            ? [...obj[key], value]
            : [obj[key], value];
        } else {
          obj[key] = value;
        }
      }
      return obj;
    })() :
    formData
    ;

  return parseWithSchema({
    schema,
    values: struct,
    data,
    isServer: true,
  });
}
