import { removeCsrfTokenCookie } from "./config";
import { getCsrfToken } from "./csrf-token";
import { fetchAuth } from "./fetch-auth";
import { getSession, updateSession } from "./session";

export async function signIn_credentials(request: Request) {
  const { session } = await getSession(request);
  const res = await fetchAuth({
    request,
    action: "callback/credentials",
    method: "POST",
    csrfTokenWithHash: session?.csrfTokenWithHash,
  });
  let sessionCookie = res?.headers.get("Set-Cookie");
  const location = res?.headers.get("Location");

  if (sessionCookie) {
    const [currentCsrf, newCsrf] = await Promise.all([
      getCsrfToken(request),
      getCsrfToken(request, true), // NOTE: サインイン成功時、CSRFTokenを再発行
    ]);

    const req = new Request(request.url, {
      method: "post",
      headers: (() => {
        const headers = new Headers(request.headers);
        headers.append("cookie", sessionCookie.split(";")[0]);
        return headers;
      })(),
      body: (() => {
        const fd = new FormData();
        if (currentCsrf.csrfToken)
          fd.set("csrfToken", currentCsrf.csrfToken);
        return fd;
      })(),
    });

    const updateRes = await updateSession({
      request: req,
      csrfToken: currentCsrf.csrfToken,
      data: {
        action: "refreshCsrfToken",
        csrfToken: newCsrf.csrfToken,
        csrfTokenWithHash: newCsrf.csrfTokenWithHash,
      },
    });

    let csrfTokenCookie = newCsrf.csrfTokenCookie;
    if (updateRes.ok) {
      sessionCookie = updateRes.cookie;
      csrfTokenCookie = removeCsrfTokenCookie; // NOTE: cookieからcsrfTokenは削除し、セッション内で管理する
    }

    return {
      ok: true as const,
      cookies: [sessionCookie, csrfTokenCookie],
      location,
      csrfToken: newCsrf.csrfToken,
      csrfTokenWithHash: newCsrf.csrfTokenWithHash,
      getSession: function () {
        return getSession(req);
      },
    } as const;
  }
  return {
    ok: false as const,
    location,
  } as const;
}
