import { redirect, useFetcher } from "react-router";
import { useAuthContext } from "~/components/auth/client/context";
import { getSession } from "~/components/auth/server/session";
import { signOut } from "~/components/auth/server/sign-out";
import { Button } from "~/components/react/elements/button";
import { SIGN_IN_PATHNAME } from "~/features/auth/consts";
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
  return redirect(SIGN_IN_PATHNAME, {
    headers: {
      "Set-Cookie": res.cookie || "",
    },
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
