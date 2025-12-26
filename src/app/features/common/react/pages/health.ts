import { data } from "react-router";
import { DateTime } from "../../../../components/objects/date";
import type { InternalApiPaths } from "../../api/internal";

type Get = Api.SuccessResponse<InternalApiPaths, "/health", "get">["data"];

export async function loader() {
  // eslint-disable-next-line no-console
  console.log("healthcheck:", process.version);
  return data({
    now: DateTime.now("UTC").toString(),
  } satisfies Get);
};
