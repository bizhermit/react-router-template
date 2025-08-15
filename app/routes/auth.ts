import { Auth } from "@auth/core";
import { authConfig } from "~/features/auth/config";

export async function loader({ request }: { request: Request; }) {
  return Auth(request, authConfig);
}

export async function action({ request }: { request: Request; }) {
  return Auth(request, authConfig);
}
