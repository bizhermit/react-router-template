import { data } from "react-router";

type Get = Api.SuccessResponse<"/sandbox/api/{id}", "get">["data"];
type Put = Api.SuccessResponse<"/sandbox/api/{id}", "put">["data"];

export async function loader() {
  return data({
    id: 1,
    title: "sample",
    body: "sample body",
  } satisfies Get);
};

export async function action() {
  return data({
    id: 1,
    title: "sample",
    body: "sample body",
    updated_at: "2025-11-11T11:11:11.111",
  } satisfies Put);
};
