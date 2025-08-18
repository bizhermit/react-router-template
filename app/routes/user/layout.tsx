import { data, Outlet } from "react-router";
import { getSession } from "~/components/auth/server/session";
import { LinkButton } from "~/components/react/elements/link-button";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = getSession(request);

  return data({
    session,
  });
};

export default function Layout() {
  console.log("user layout render");
  return (
    <div>
      <h1>User Layout</h1>
      <p>
        <LinkButton
          to="/sign-out"
          color="sub"
        >
          Sign Out
        </LinkButton>
      </p>
      <Outlet />
    </div>
  );
};
