import { useFetcher } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { auth } from "~/auth/server/auth";
import { Button$ } from "~/components/react/elements/button";
import { Link } from "~/components/react/elements/link";
import { $schema } from "~/components/schema";
import { getPayload } from "~/components/schema/server";
import type { Route } from "./+types/home";

const schema = $schema({});

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    console.log(session);
    const submission = await getPayload({
      request,
      schema,
    });
    console.log(submission);
  } catch {
    // ignore
  }
};

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
        <Button$
          type="submit"
        >
          submit
        </Button$>
      </fetcher.Form>
    </div>
  );
};
