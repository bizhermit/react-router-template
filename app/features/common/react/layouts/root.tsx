import { data, Outlet } from "react-router";
import { AuthProvider } from "~/auth/client/provider";
import { auth } from "~/auth/server/auth";
import type { Route } from "./+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { headers, response } = await auth.api.getSession({
      headers: request.headers,
      returnHeaders: true,
    });

    if (response) {
      return data({
        user: response?.user,
      }, { headers });
    }
  } catch {
    // fallback
  }
  return data({
    user: undefined,
  });
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <AuthProvider
      user={loaderData.user}
    >
      <Outlet />
    </AuthProvider>
  );
};
