import { data } from "react-router";
import type { InternalApiPaths } from "~/features/api/internal";
import type { Route } from "./+types/api";

type Get = Api.SuccessResponse<InternalApiPaths, "/sandbox/api", "get">["data"];
type Post = Api.SuccessResponse<InternalApiPaths, "/sandbox/api", "post">["data"];

export async function loader({ request }: Route.LoaderArgs) {
  console.log("api loader", request.url, Array.from(request.headers.entries()));
  return data({
    items: [],
    page: 1,
    total: 0,
  } satisfies Get);
};

export async function action({ request }: Route.ActionArgs) {
  console.log("api action", request.url, Array.from(request.headers.entries()));
  const body = await request.json();
  console.log(body);
  return data({
    id: 1,
    title: "sample",
    body: "sample body",
    updated_at: "2025-11-11T11:11:11.111",
  } satisfies Post);
};
