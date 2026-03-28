import { eq } from "drizzle-orm";
import { auth } from "../src/features/auth/server/auth";
import { user } from "../src/features/auth/server/schema";
import { db } from "../src/lib/server/database/connection";

export async function seedAdmin() {
  const adminEmail = "admin@example.com";

  // 管理ユーザーが既に存在するかチェック
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, adminEmail))
    .limit(1);

  if (existingUser.length > 0) {
    // eslint-disable-next-line no-console
    console.log("初回管理ユーザーは既に存在しています");
    return;
  }

  // 管理ユーザー登録
  await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: "password",
      name: "Administrator",
      role: "admin",
    },
  });
};

await seedAdmin();
