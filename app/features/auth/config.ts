import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { getPayload } from "~/components/schema/server";
import { authSchema } from "./schema";

export const authConfig = {
  secret: process.env.AUTH_SECRET || "secret",
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
      authorize: async function (_, request) {
        const { hasError, data } = await getPayload(request, authSchema);
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
} satisfies AuthConfig;
