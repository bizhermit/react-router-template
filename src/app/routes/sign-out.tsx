import { auth } from "$/server/auth/auth";
import { SIGN_IN_PATHNAME } from "$/shared/auth/consts";
import { redirect, useFetcher } from "react-router";
import { Button$ } from "~/elements/button";
import type { Route } from "./+types/sign-out";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (session) {
      return null;
    }
  } catch {
    // ignore
  }
  return redirect(SIGN_IN_PATHNAME);
};

export async function action({ request }: Route.ActionArgs) {
  try {
    const { headers } = await auth.api.signOut({
      headers: request.headers,
      returnHeaders: true,
    });
    return redirect(SIGN_IN_PATHNAME, { headers });
  } catch {
    return null;
  }
};

export default function Page() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      method="post"
      className="grow min-h-0 grid place-items-center"
    >
      <Button$
        type="submit"
        color="primary"
      >
        Sign Out
      </Button$>
    </fetcher.Form>
  );
};
