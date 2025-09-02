import { AUTH_COOKIE_NAMES, SIGN_IN_PATHNAME } from "../consts";
import { getCsrfToken } from "./csrf-token";
import { fetchAuth } from "./fetch-auth";
import { getSession } from "./session";

export async function signOut(request: Request) {
  const { session } = await getSession(request);
  if (session == null) {
    // NOTE: セッションが無い場合は成功で返却
    return {
      ok: true,
      cookies: [`${AUTH_COOKIE_NAMES.session}=; Max-Age=0`],
      location: SIGN_IN_PATHNAME,
    } as const;
  }

  const res = await fetchAuth({
    request,
    action: "signout",
    method: "POST",
    csrfTokenWithHash: session?.csrfTokenWithHash,
  });
  const removeSessionCookie = res?.headers.get("Set-Cookie");
  const location = res?.headers.get("Location");
  if (!removeSessionCookie) {
    return {
      ok: false as const,
      cookies: [],
      location,
    } as const;
  }

  const csrfRes = await getCsrfToken(request, true); // NOTE: サインアウト時、csrfTokenを再発行

  return {
    ok: true as const,
    cookies: [removeSessionCookie, csrfRes.csrfTokenCookie],
    location,
  } as const;
};
