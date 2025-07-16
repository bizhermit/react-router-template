import { getCookieImpl, getCookiesImpl } from "./core";

export function getCookies() {
  if (typeof window === "undefined") {
    console.warn(`faild to get cookies, not client side.`);
    return {};
  }
  return getCookiesImpl(document.cookie);
};

export function getCookie(name: string) {
  if (typeof window === "undefined") {
    console.warn(`faild to get cookie, not client side. get: [${name}]`);
    return undefined;
  }
  return getCookieImpl(document.cookie, name);
};

interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
  samesite?: "Strict" | "Lax" | "None";
};

export function setCookie(name: string, value: string, opts?: CookieOptions) {
  if (typeof window === "undefined") {
    console.warn(`faild to get cookie, not client side. set: [${name}]`);
    return undefined;
  }
  const strs: Array<string> = [
    `SameSite=${opts?.samesite || "Lax"}`,
  ];
  if (!(opts && "path" in opts && opts.path == null)) strs.push(`Path=${opts?.path || "/"}`);
  if (opts?.domain) strs.push(`Domain=${opts.domain}`);
  if (opts?.expires) strs.push(`Expires=${opts.expires}`);
  if (opts?.maxAge != null) strs.push(`Max-Age=${opts.maxAge}`);
  if (opts?.secure) strs.push("Secure");
  if (opts?.httpOnly) strs.push("HttpOnly");
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${strs.join(";")}`;
};

export function deleteCookie(name: string, opts?: Pick<CookieOptions, "path" | "domain">) {
  setCookie(name, "", { ...opts, maxAge: 0 });
};
