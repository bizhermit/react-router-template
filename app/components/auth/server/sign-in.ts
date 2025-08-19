import { fetchAuth } from "./fetch-auth";

export async function signIn_credentials(request: Request) {
  const res = await fetchAuth({
    request,
    action: "callback/credentials",
    method: "POST",
  });
  if (res?.ok) {
    return {
      ok: true,
    };
  }
  return {
    ok: false,
  };
}
