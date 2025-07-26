import { data } from "react-router";
import { DateTime } from "~/components/objects/date";
import type { InternalApiPaths } from "~/features/api/internal";

type Get = Api.SuccessResponse<InternalApiPaths, "/health", "get">["data"];

export async function loader() {
  return data({
    now: DateTime.now("UTC").toString(),
  } satisfies Get);
};
