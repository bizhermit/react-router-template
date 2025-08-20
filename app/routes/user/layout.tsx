import { data, Outlet, redirect } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "~/auth/consts";
import { getSession } from "~/auth/server/session";
import { Button } from "~/components/react/elements/button";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);

  // console.log("session", session);

  if (session == null) {
    const url = new URL(request.url);
    return redirect(`${SIGN_IN_PATHNAME}?to=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return data({
    session,
  });
};

export default function Layout() {
  // console.log("user layout render");
  const auth = useAuthContext();

  return (
    <div>
      <h1>User Layout</h1>
      <form
        method="post"
        action={SIGN_OUT_PATHNAME}
      >
        <input
          type="hidden"
          name="csrfToken"
          value={auth.csrfToken}
        />
        <Button
          type="submit"
          color="sub"
        >
          Sign Out
        </Button>
      </form>
      <Outlet />
    </div>
  );
};
