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
