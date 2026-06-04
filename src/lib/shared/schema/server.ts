import { parseWithSchema } from ".";
import { convertEntriesToStruct, convertFormDataToStruct } from "../objects/form-data";
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

  return parseWithSchema({
    schema,
    values: await (async () => {
      if (values) {
        if (values instanceof FormData) {
          return convertFormDataToStruct(values);
        }
        return values;
      }
      if (method === "GET") {
        return convertEntriesToStruct(
          Object.entries(
            Object.fromEntries(
              new URL(request.url).searchParams
            )
          )
        );
      }
      return convertFormDataToStruct(
        await request.formData()
      );
    })(),
    data,
    isServer: true,
    preventValidate: preventValidate ?? method === "GET", // TODO: バリデーションを禁止ではなく、存在するプロパティのみバリデーションするモードを用意
  });
}
