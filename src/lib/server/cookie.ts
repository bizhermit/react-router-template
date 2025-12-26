import { getCookieImpl, getCookiesImpl } from "../shared/cookie";

export function cookieStore(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const cache = new Map<string, string | undefined>();
  return {
    getCookies: () => {
      const struct = getCookiesImpl(cookie);
      Object.entries(struct).forEach(([key, value]) => {
        cache.set(key, value);
      });
      return struct;
    },
    getCookie: (name: string) => {
      if (cache.has(name)) {
        return cache.get(name);
      }
      const v = getCookieImpl(cookie, name);
      cache.set(name, v);
      return v;
    },
  } as const;
};
