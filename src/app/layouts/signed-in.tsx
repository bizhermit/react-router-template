import { Button$ } from "$/components/elements/button";
import { Details } from "$/components/elements/details";
import { useState } from "react";
import { data, Outlet, redirect } from "react-router";
import { auth } from "~/auth/server/auth";
import { SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "~/auth/shared/consts";
import { useAuthContext } from "~/auth/shared/providers/auth";
import type { Route } from "./+types/signed-in";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const response = await auth.api.getSession({
      headers: request.headers,
    });
    if (response?.user != null) {
      return data({});
    }
  } catch {
    // fallback
  }
  const url = new URL(request.url);
  return redirect(`${SIGN_IN_PATHNAME}?to=${encodeURIComponent(url.pathname + url.search)}`);
};

export default function Layout() {
  const auth = useAuthContext();

  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>User Layout</h1>
      <Details
        summary="auth context"
      >
        <pre>{JSON.stringify(auth, null, 2)}</pre>
      </Details>
      <form
        method="post"
        action={SIGN_OUT_PATHNAME}
      >
        <Button$
          type="submit"
          color="sub"
        >
          Sign Out
        </Button$>
      </form>
      <Button$
        onClick={() => {
          setCount(c => c + 1);
        }}
      >
        count: {count}
      </Button$>
      <Outlet />
    </div>
  );
};
