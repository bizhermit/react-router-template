import { redirect } from "react-router";
import { SIGN_IN_PATHNAME } from "../consts";
import { getAuth } from "./loader";

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
    headers: Headers;
  }) => ActionResponse
) {
  const {
    csrfTokenCookie,
    session,
    sessionCookie,
  } = await getAuth(args);

  const headers = new Headers();
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  if (csrfTokenCookie) headers.append("Set-Cookie", csrfTokenCookie);

  if (session == null) {
    const url = new URL(args.request.url);
    return redirect(`${SIGN_IN_PATHNAME}?to=${encodeURIComponent(url.pathname + url.search)}`, {
      headers,
    });
  }
  return process({ ...args, session, headers });
};

export function actionWithAuth<Args extends ArgProps>(
  process: (args: Args & {
    session: Session;
    headers: Headers;
  }) => ActionResponse
) {
  return async function action(args: Args) {
    return withAuth(args, process);
  };
}
