import { fetchAuth } from "./fetch-auth";

export async function signIn_credentials(request: Request) {
  const res = await fetchAuth({
    request,
    action: "callback/credentials",
    method: "POST",
  });
  const cookie = res?.headers.get("Set-Cookie");
  const location = res?.headers.get("Location");
  if (cookie) {
    return {
      ok: true as const,
      cookie,
      location,
    };
  }
  return {
    ok: false as const,
    location,
  };
}
