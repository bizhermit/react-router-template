import { data } from "react-router";
import type { InternalApiPaths } from "~/features/api/internal";
import type { Route } from "./+types/api-detail";

type Get = Api.SuccessResponse<InternalApiPaths, "/sandbox/api/{id}", "get">["data"];
type Put = Api.SuccessResponse<InternalApiPaths, "/sandbox/api/{id}", "put">["data"];

export async function loader({ request, params }: Route.LoaderArgs) {
  console.log("api-detail loader", request.url, params, Array.from(request.headers.entries()));
  return data({
    id: "1",
    title: "sample",
    body: "sample body",
    updatedAt: "2025-11-11T11:11:11.111",
  } satisfies Get);
};

export async function action({ request, params }: Route.ActionArgs) {
  console.log("api action", request.url, Array.from(request.headers.entries()));
  const body = await request.json();
  console.log(body);
  switch (request.method.toLowerCase()) {
    case "put":
      return data({
        id: "1",
        title: "sample",
        body: "sample body",
        updatedAt: "2025-11-11T11:11:11.111",
      } satisfies Put);
    case "delete":
      return data({}, { status: 204 });
    default:
      return data({}, { status: 404 });
  }
};
