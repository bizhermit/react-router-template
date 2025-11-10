import { data, Outlet } from "react-router";
import { AuthProvider } from "~/auth/client/provider";
import { getAuth } from "~/auth/server/loader";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const {
    csrfToken,
    csrfTokenCookie,
    session,
    sessionCookie,
  } = await getAuth({ request, context });

  const headers = new Headers();
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  if (csrfTokenCookie) headers.append("Set-Cookie", csrfTokenCookie);

  return data({
    auth: {
      csrfToken: csrfToken,
      session: session?.data ?? null,
    },
  }, {
    headers,
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
