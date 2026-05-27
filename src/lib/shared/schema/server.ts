import { parseWithSchema } from ".";
import type { $ObjSchema } from "./object";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PayloadParams<S extends $ObjSchema<any, any>> {
  request: Request;
  schema: S;
  values?: FormData | Record<string, unknown>;
  data?: Record<string, unknown>;
  preventValidate?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPayload<S extends $ObjSchema<any, any>>({
  request,
  schema,
  values,
  data = {},
  preventValidate,
}: PayloadParams<S>) {
  const method = request.method.toUpperCase();

  const argValues = values ?? (
    method === "GET" ?
      Object.fromEntries(new URL(request.url).searchParams) :
      await request.formData()
  );

  const struct = argValues instanceof FormData ?
    (() => {
      const obj: Record<string, unknown> = {};
      for (const [key, value] of argValues.entries()) {
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
    argValues
    ;

  return parseWithSchema({
    schema,
    values: struct,
    data,
    isServer: true,
    preventValidate: preventValidate ?? method === "GET",
  });
}
