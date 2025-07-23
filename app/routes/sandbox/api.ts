import { data } from "react-router";
import type { InternalApiPaths } from "~/features/api/internal";

type Get = Api.SuccessResponse<InternalApiPaths, "/sandbox/api", "get">["data"];
type Post = Api.SuccessResponse<InternalApiPaths, "/sandbox/api", "post">["data"];

export async function loader() {
  return data({
    items: [],
    page: 1,
    total: 0,
  } satisfies Get);
};

export async function action() {
  return data({
    id: 1,
    title: "sample",
    body: "sample body",
    updated_at: "2025-11-11T11:11:11.111",
  } satisfies Post);
};
