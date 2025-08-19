import { type AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { getPayload } from "~/components/schema/server";
import { authSchema } from "./schema";

const isDev = process.env.NODE_ENV === "development";

// https://authjs.dev/reference/core
export const authConfig = {
  secret: process.env.AUTH_SECRET || undefined,
  trustHost: true,
  session: {
    strategy: "jwt",
    updateAge: 60 * 60 * 1, // 1 hours
    maxAge: 60 * 60 * 24 * 1, // 1 day
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
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
          type: "text",
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
        return {
          id: data.userId,
          name: "dummy user",
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    session: async function ({ session }) {
      return session;
    },
  },
  cookies: {
    callbackUrl: {
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
    csrfToken: {
      name: "csrf-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
    sessionToken: {
      name: "session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: !isDev,
      },
    },
  },
} satisfies AuthConfig;
