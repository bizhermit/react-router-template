import { DateTime } from "$/shared/objects/date";
import { data } from "react-router";
import type { InternalApiPaths } from "~/api/shared/internal";

type Get = Api.SuccessResponse<InternalApiPaths, "/health", "get">["data"];

export async function loader() {
  // eslint-disable-next-line no-console
  console.log(`healthcheck: ${process.version} / ${process.env.NODE_ENV}`);
  return data({
    now: DateTime.now("UTC").toString(),
  } satisfies Get);
};
