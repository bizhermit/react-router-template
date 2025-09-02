import { redirect, useFetcher } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { SIGN_IN_PATHNAME } from "~/auth/consts";
import { getSession } from "~/auth/server/session";
import { signOut } from "~/auth/server/sign-out";
import { Button } from "~/components/react/elements/button";
import type { Route } from "./+types/sign-out";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  if (session == null) {
    return redirect(SIGN_IN_PATHNAME);
  }
};

export async function action({ request }: Route.ActionArgs) {
  const res = await signOut(request);
  if (!res.ok) return null;

  const headers = new Headers();
  res.cookies.forEach(cookie => {
    if (cookie) headers.append("Set-Cookie", cookie);
  });
  return redirect(SIGN_IN_PATHNAME, {
    headers,
  });
};

export default function Page() {
  const fetcher = useFetcher();
  const auth = useAuthContext();

  return (
    <fetcher.Form
      method="post"
      className="grow min-h-0 grid place-items-center"
    >
      <auth.CsrfTokenHidden />
      <Button
        type="submit"
        color="primary"
      >
        Sign Out
      </Button>
    </fetcher.Form>
  );
};
