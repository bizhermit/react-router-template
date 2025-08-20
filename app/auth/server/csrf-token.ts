import { fetchAuth } from "./fetch-auth";

export async function getCsrfToken(request: Request) {
  const res = await fetchAuth({
    request,
    action: "csrf",
  });
  if (res?.ok) {
    const { csrfToken } = await res.json();
    return {
      csrfToken: csrfToken as string,
      cookie: res.headers.get("set-cookie") || undefined,
    };
  }
  return {
    csrfToken: undefined,
    cookie: undefined,
  };
};
