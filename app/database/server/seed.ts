import { eq } from "drizzle-orm";
import { auth } from "~/auth/server/auth";
import { db } from "./connection";
import { user } from "./schema";

export async function seedAdmin() {
  // 管理ユーザー登録
  const result = await auth.api.signUpEmail({
    body: {
      email: "admin@example.com",
      password: "password",
      name: "Administrator",
    },
  });
  if (!result?.user?.id) {
    throw new Error("Failed to create admin user");
  }
  // 管理ユーザーのロールをadminに昇格
  await db.update(user)
    .set({ role: "admin" })
    .where(eq(user.id, result.user.id));
};

await seedAdmin();
