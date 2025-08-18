import { fetchAuth } from "./fetch-auth";

export async function getCsrfToken(request: Request) {
  const res = await fetchAuth<{ csrfToken: string; }>({
    request,
    action: "csrf",
  });
  return res?.csrfToken;
};
