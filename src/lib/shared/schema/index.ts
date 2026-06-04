import type { $ObjSchema } from "./object";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseWithSchema<const S extends $ObjSchema<any, any>>(params: {
  schema: S;
  values: Record<string, unknown> | null | undefined;
  data?: Record<string, unknown> | null | undefined;
  isServer?: boolean;
}) {
  const injectParams = {
    values: params.values ?? {},
    data: params.data ?? {},
    isServer: params.isServer ?? typeof window === "undefined",
  } as const satisfies Schema.InjectParams;

  params.schema.initialize(injectParams);

  const parsed = params.schema.parse(injectParams.values, injectParams);
  let messages = parsed.messages ?? {};
  const validated = params.schema.validate(parsed.value, injectParams);
  messages = mergeRecordMessages(parsed.messages, validated);
  const hasError = getHasError(messages);

  if (hasError) {
    return {
      ok: false,
      values: parsed.value as Exclude<Schema.Infer<typeof params.schema>, null | undefined>,
      messages,
    } as const;
  }
  return {
    ok: true,
    values: parsed.value as Exclude<Schema.Infer<typeof params.schema, true>, null | undefined>,
    messages,
  } as const;
};

export function mergeRecordMessages(
  parsedMessages: Schema.RecordMessages | undefined,
  validatedMessages: Schema.RecordMessages | undefined
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

export function getHasError(messages: Schema.RecordMessages | null | undefined) {
  if (messages == null) return false;
  return Object.entries(messages).some(([_, msgs]) => msgs && msgs.some(msg => msg.type === "e"));
};
