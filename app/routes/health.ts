import { data } from "react-router";
import type { InternalApiPaths } from "~/features/api/internal";

type Get = Api.SuccessResponse<InternalApiPaths, "/health", "get">["data"];

export async function loader() {
  return data({
    now: Date.now(),
  } satisfies Get);
};
