import { Button$ } from "$/components/elements/button";
import { Link } from "$/components/elements/link";
import { auth } from "$/server/auth/auth";
import { $schema } from "$/shared/schema";
import { getPayload } from "$/shared/schema/server";
import { useFetcher } from "react-router";
import type { Route } from "./+types/home";

const schema = $schema({});

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    // eslint-disable-next-line no-console
    console.log(session);
    const submission = await getPayload({
      request,
      schema,
    });
    // eslint-disable-next-line no-console
    console.log(submission);
  } catch {
    // ignore
  }
};

export default function Page() {
  const fetcher = useFetcher();

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
