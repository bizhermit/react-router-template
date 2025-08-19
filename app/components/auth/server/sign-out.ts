import { fetchAuth } from "./fetch-auth";

export async function signOut(request: Request) {
  const res = await fetchAuth({
    request,
    action: "signout",
    method: "POST",
  });
  const cookie = res?.headers.get("Set-Cookie");
  const location = res?.headers.get("Location");
  if (!cookie) {
    return {
      ok: false,
      location,
    };
  }
  return {
    ok: true,
    cookie,
    location,
  };
};
