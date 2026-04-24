import type { $ObjSchema } from "./object";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseWithSchema<const S extends $ObjSchema<any, any>>(params: {
  schema: S;
  values: Record<string, unknown> | null | undefined;
  data?: Record<string, unknown> | null | undefined;
  isServer?: boolean;
}) {
  const injectParams = {
    values: params.values ?? {},
    data: params.data ?? {},
    isServer: params.isServer ?? typeof window === "undefined",
  } as const satisfies $Schema.InjectParams;

  const parsed = params.schema.parse(params.values, injectParams);
  const msgs = params.schema.validate(parsed.value, injectParams);
  const hasError = parsed.messages?.some(msg => msg.type === "e") || msgs.some(msg => msg.type === "e");

  if (hasError) {
    return {
      ok: false,
      values: parsed.value as $Schema.Infer<typeof params.schema>,
      messages: [...parsed.messages ?? [], ...msgs],
    } as const;
  }
  return {
    ok: true,
    values: parsed.value as $Schema.Infer<typeof params.schema, true>,
    messages: [...parsed.messages ?? [], ...msgs],
  } as const;
};
