import { redirect } from "react-router";
import { SIGN_IN_PATHNAME } from "../consts";
import { getAuthSession } from "./loader";

type ArgProps = {
  request: Request;
  context: import("react-router").AppLoadContext;
};

type Session = import("@auth/core/types").Session;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionResponse = Promise<Response> | Promise<any> | Response | any;

export async function withAuth<Args extends ArgProps>(
  args: Args,
  process: (args: Args & {
    session: Session;
  }) => ActionResponse
) {
  const session = await getAuthSession(args);
  if (session == null) {
    const url = new URL(args.request.url);
    return redirect(`${SIGN_IN_PATHNAME}?to=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return process({ ...args, session });
};

export function actionWithAuth<Args extends ArgProps>(
  process: (args: Args & {
    session: Session;
  }) => ActionResponse
) {
  return async function action(args: Args) {
    return withAuth(args, process);
  };
}
