import { data, Outlet } from "react-router";
import { AuthProvider } from "~/auth/client/provider";
import { getAuth } from "~/auth/server/loader";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = await getAuth({ request, context });
  return data({
    auth,
  }, {
    headers: {
      "Set-Cookie": auth.cookie || "",
    },
  });
};

export default function Layout({ loaderData: { auth } }: Route.ComponentProps) {
  return (
    <AuthProvider
      csrfToken={auth.csrfToken}
      session={auth.session}
    >
      <Outlet />
    </AuthProvider>
  );
};
