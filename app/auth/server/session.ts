import { fetchAuth } from "./fetch-auth";

export async function getSession(request: Request) {
  const res = await fetchAuth({
    request,
    action: "session",
  });

  if (res?.ok) {
    const session = await res.json();
    return session as import("@auth/core/types").Session;
  }
  return null;
};

export async function updateSession(params: {
  request: Request;
  csrfToken: string | undefined;
  data: { action: string; } & Record<string, unknown>;
}) {
  const req = new Request(params.request.url, {
    method: "post",
    headers: (() => {
      const headers = new Headers(params.request.headers);
      headers.set("Content-Type", "application/json;charset=UTF-8");
      return headers;
    })(),
    body: JSON.stringify({
      data: params.data,
    }),
  });
  const res = await fetchAuth({
    action: "session",
    method: "POST",
    request: req,
    csrfToken: params.csrfToken,
  });

  if (res?.ok) {
    return {
      ok: true as const,
      cookie: res.headers.get("set-cookie"),
    } as const;
  }
  return {
    ok: false as const,
    cookie: null,
  } as const;
};
