import { authAction, authLoader } from "~/components/auth/server/fetch-auth";
import type { Route } from "./+types/auth";

export async function loader({ request }: Route.LoaderArgs) {
  return authLoader(request);
}

export async function action({ request }: Route.ActionArgs) {
  return authAction(request);
}
