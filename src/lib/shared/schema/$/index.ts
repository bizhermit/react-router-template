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
  const validated = params.schema.validate(parsed.value, injectParams);
  const messages = mergeRecordMessages(parsed.messages, validated);
  const hasError = getHasError(messages);

  if (hasError) {
    return {
      ok: false,
      values: parsed.value as $Schema.Infer<typeof params.schema>,
      messages,
    } as const;
  }
  return {
    ok: true,
    values: parsed.value as $Schema.Infer<typeof params.schema, true>,
    messages,
  } as const;
};

export function mergeRecordMessages(
  parsedMessages: $Schema.RecordMessages | undefined,
  validatedMessages: $Schema.RecordMessages | undefined
) {
  const messages = parsedMessages ?? {};
  if (validatedMessages) {
    Object.entries(validatedMessages).forEach(([name, msgs]) => {
      if (!msgs || msgs.length === 0) {
        if (!(name in messages)) messages[name] = undefined;
        return;
      }
      if (messages[name] == null) {
        messages[name] = [];
      }
      messages[name].push(...msgs);
    });
  }
  return messages;
};

export function getHasError(messages: $Schema.RecordMessages) {
  return Object.entries(messages).some(([_, msgs]) => msgs && msgs.some(msg => msg.type === "e"));
};
