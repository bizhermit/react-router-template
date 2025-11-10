import { authAction, authLoader } from "~/auth/server/fetch-auth";
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  return authLoader(request);
}

export async function action({ request }: Route.ActionArgs) {
  return authAction(request);
}
