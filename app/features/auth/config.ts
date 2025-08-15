import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { getPayload } from "~/components/schema/server";
import { signInSchema } from "./schema";

export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  secret: process.env.AUTH_SECRET || "secret",
  session: {
    strategy: "jwt",
    updateAge: 60 * 60 * 1, // 1 hour
    maxAge: 60 * 60 * 24 * 1, // 1 day
  },
  providers: [
    Credentials({
      credentials: {
        userId: {
          label: signInSchema.userId.label,
          required: signInSchema.userId.required,
        },
        password: {
          label: signInSchema.password.label,
          required: signInSchema.password.required,
        },
      },
      async authorize(_, request) {
        const {
          hasError,
          data,
          results,
        } = await getPayload(request, signInSchema);

        if (hasError) {
          console.log("sign-in error:", results);
          // throw new Error(JSON.stringify(results));
          return null;
        }

        // TODO: user check
        if (data.password !== "pass") {
          console.log("sign-in error:", "invalid password");
          // throw new Error("Invalid password");
          return null;
        }

        // TODO: user params
        return {
          id: data.userId,
          email: "hoge@example.com",
          name: "Hoge",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async function ({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async function ({ session, token }) {
      if (session.user) {
        // session.user.name = token.name;
        console.log("--0----------------0--");
        console.log(JSON.stringify(session.user, null, 2));
        console.log(JSON.stringify(token, null, 2));
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies AuthConfig;
