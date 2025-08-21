import { data, useFetcher } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { actionWithAuth } from "~/auth/server/action";
import { Button } from "~/components/react/elements/button";
import { Link } from "~/components/react/elements/link";
import type { Route } from "./+types/home";

// export async function action(args: Route.ActionArgs) {
//   return withAuth(args, async function ({ request, session }) {
//     console.log("User Home action", session);
//     console.log(await request.formData());
//   });
// };

export const action = actionWithAuth<Route.ActionArgs>(async ({ request, session }) => {
  console.log("User Home action", session);
  console.log(await request.formData());
  return data({});
});

export default function Page() {
  const fetcher = useFetcher();
  const auth = useAuthContext();

  return (
    <div>
      <h1>User Home</h1>
      <ul>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
      </ul>
      <fetcher.Form
        method="post"
      >
        <auth.CsrfTokenHidden />
        <Button
          type="submit"
        >
          submit
        </Button>
      </fetcher.Form>
    </div>
  );
};
