import { fetchAuth } from "./fetch-auth";

export async function getCsrfToken(request: Request, create?: boolean) {
  let req = request;
  if (create) {
    req = new Request(request.url, { method: "get" });
  }
  const res = await fetchAuth({
    request: req,
    action: "csrf",
  });
  if (res?.ok) {
    const data = await res.json();
    const cookie = res.headers.get("set-cookie");
    const csrfTokenWithHash = cookie?.split(";")[0].split("=")[1];

    return {
      csrfToken: data.csrfToken as string,
      cookie,
      csrfTokenWithHash,
    };
  }
  return {
    csrfToken: undefined,
    cookie: undefined,
  };
};
