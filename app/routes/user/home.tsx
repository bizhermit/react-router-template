import { data, useFetcher } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { actionWithAuth } from "~/auth/server/action";
import { Button } from "~/components/react/elements/button";
import { Link } from "~/components/react/elements/link";
import { $schema } from "~/components/schema";
import { getPayload } from "~/components/schema/server";
import type { Route } from "./+types/home";

// export async function action(args: Route.ActionArgs) {
//   return withAuth(args, async function ({ request, session }) {
//     console.log("- User Home action", session);
//     console.log(await request.formData());
//   });
// };

const schema = $schema({});

export const action = actionWithAuth<Route.ActionArgs>(async ({ request, session, headers }) => {
  // console.log("- User Home action", session);
  const submission = await getPayload({
    request,
    schema,
    session,
  });
  // console.log(submission.results);
  return data({}, {
    // headers,
  });
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
