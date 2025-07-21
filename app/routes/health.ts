import { data } from "react-router";

type Get = Api.SuccessResponse<"/health", "get">["data"];

export async function loader() {
  return data({
    now: Date.now(),
  } satisfies Get);
};
