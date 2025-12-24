import { auth } from "~/auth/server/auth";

export async function seedAdmin() {
  // 管理ユーザー登録
  await auth.api.signUpEmail({
    body: {
      email: "admin@example.com",
      password: "password",
      name: "Administrator",
      role: "admin",
    },
  });
};

await seedAdmin();
