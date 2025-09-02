import { type AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import type { SerializeOptions } from "node_modules/@auth/core/lib/vendored/cookie";
import { getPayload } from "~/components/schema/server";
import { AUTH_COOKIE_NAMES, SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "../consts";
import { authSchema } from "../schema";

const isDev = process.env.NODE_ENV === "development";

// https://authjs.dev/reference/core
export const authConfig = {
  secret: process.env.AUTH_SECRET || "auth-secret",
  trustHost: true,
  session: {
    strategy: "jwt",
    updateAge: 60 * 60 * 1, // 1 hours
    maxAge: 60 * 60 * 24 * 1, // 1 day
  },
  pages: {
    signIn: SIGN_IN_PATHNAME,
    signOut: SIGN_OUT_PATHNAME,
  },
  providers: [
    Credentials({
      credentials: {
        userId: {
          type: "text",
          label: authSchema.userId.label,
          required: authSchema.userId.required,
        },
        password: {
          type: "password",
          label: authSchema.password.label,
          required: authSchema.password.required,
        },
      },
      authorize: async function (credentials, request) {
        const { hasError, data } = await getPayload({
          request,
          schema: authSchema,
          data: credentials,
        });
        if (hasError) return null;
        if (data.password !== "pass") return null;
        // TODO: sign-in check
        return {
          data: {
            id: data.userId,
            name: "dummy user",
            role: "admin",
          },
        };
      },
    }),
  ],
  callbacks: {
    jwt: async function ({ token, user, trigger, session }) {
      switch (trigger) {
        case "signIn":
          if (user) {
            token.data = user.data;
          }
          break;
        case "update":
          if (session) {
            switch (session.action as string) {
              case "refreshCsrfToken":
                token.csrfToken = session.csrfToken;
                token.csrfTokenWithHash = session.csrfTokenWithHash;
                break;
              default:
                break;
            }
          }
          break;
        default:
          break;
      }
      return token;
    },
    session: async function ({ session, token }) {
      session.data = token.data;
      session.csrfToken = token.csrfToken;
      session.csrfTokenWithHash = token.csrfTokenWithHash;
      return session;
    },
  },
  cookies: {
    callbackUrl: {
      name: AUTH_COOKIE_NAMES.callbackUrl,
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
    csrfToken: {
      name: AUTH_COOKIE_NAMES.csrfToken,
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
    sessionToken: {
      name: AUTH_COOKIE_NAMES.session,
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
  },
} satisfies AuthConfig;

const csrfTokenCookieOptions = authConfig.cookies.sessionToken.options as SerializeOptions;
export const removeCsrfTokenCookie = (() => {
  const options = [
    `Max-Age=0`,
    `Path=${csrfTokenCookieOptions.path || "/"}`,
    `SameSite=${csrfTokenCookieOptions.sameSite || "strict"}`,
    csrfTokenCookieOptions.httpOnly ? "HttpOnly" : "",
    csrfTokenCookieOptions.secure ? "Secure" : "",
    csrfTokenCookieOptions.priority ? `Priority=${csrfTokenCookieOptions.priority}` : "",
  ].filter(s => !!s).join("; ");
  return `${AUTH_COOKIE_NAMES.csrfToken}=; ${options}`;
})();
