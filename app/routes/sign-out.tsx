import { redirect, useFetcher } from "react-router";
import { useAuthContext } from "~/components/auth/client/context";
import { signOut } from "~/components/auth/server/sign-out";
import { Button } from "~/components/react/elements/button";
import type { Route } from "./+types/sign-out";

export async function action({ request }: Route.ActionArgs) {
  const res = await signOut(request);
  if (!res.ok) return null;
  return redirect("/sign-in", {
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
