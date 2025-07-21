import { data } from "react-router";
import type { Route } from "./+types/api-detail";

type Get = Api.SuccessResponse<"/sandbox/api/{id}", "get">["data"];
type Put = Api.SuccessResponse<"/sandbox/api/{id}", "put">["data"];

export async function loader() {
  return data({
    id: 1,
    title: "sample",
    body: "sample body",
  } satisfies Get);
};

export async function action({ request }: Route.ActionArgs) {
  switch (request.method.toLowerCase()) {
    case "put":
      return data({
        id: 1,
        title: "sample",
        body: "sample body",
        updated_at: "2025-11-11T11:11:11.111",
      } satisfies Put);
    case "delete":
      return data({}, { status: 204 });
    default:
      return data({}, { status: 404 });
  }
};
