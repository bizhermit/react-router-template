import { fetchAuth } from "./fetch-auth";

export async function signIn(request: Request) {
  return fetchAuth({
    request,
    action: "signin",
    method: "POST",
  });
}
