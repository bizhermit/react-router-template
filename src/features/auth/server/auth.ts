import { db } from "$/server/database/connection";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        defaultValue: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60, // 1hour
    freshAge: 60 * 10, // 10min
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5min
      strategy: "compact",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
