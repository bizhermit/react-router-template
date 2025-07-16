import { getCookieImpl, getCookiesImpl } from "./core";

export function cookieStore(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return {
    getCookies: () => getCookiesImpl(cookie),
    getCookie: (name: string) => getCookieImpl(cookie, name),
  } as const;
};
