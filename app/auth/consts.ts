export const SIGN_IN_PATHNAME = "/sign-in";
export const SIGN_OUT_PATHNAME = "/sign-out";

export const AUTH_PROP_NAME = "__AUTH__";

export const AUTH_COOKIE_NAMES = {
  callbackUrl: "_auth.callback",
  session: "_auth.session",
  csrfToken: "_auth.csrf",
} as const;
