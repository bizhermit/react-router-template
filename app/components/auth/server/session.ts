import { fetchAuth } from "./fetch-auth";

export async function getSession(request: Request) {
  return fetchAuth<import("@auth/core/types").Session>({
    request,
    action: "session",
  });
};
