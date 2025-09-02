import type { AuthLoaderContext } from "../types";
import { removeCsrfTokenCookie } from "./config";
import { getCsrfToken } from "./csrf-token";
import { getSession } from "./session";

export async function getAuthPayload(request: Request) {
  const { session, sessionCookie } = await getSession(request);
  if (session) {
    return {
      csrfToken: session.csrfToken,
      csrfTokenCookie: removeCsrfTokenCookie,
      session,
      sessionCookie,
    } as const satisfies AuthLoaderContext;
  }

  const { csrfToken, csrfTokenCookie } = await getCsrfToken(request);
  return {
    csrfToken,
    csrfTokenCookie,
    session,
    sessionCookie: null,
  } as const satisfies AuthLoaderContext;
};

export async function getAuth(props: {
  request: Request;
  context: import("react-router").AppLoadContext;
}) {
  if (props.context.auth == null) {
    props.context.auth = new Promise((resolve) => {
      getAuthPayload(props.request).then(resolve);
    });
  }
  return props.context.auth;
};

export async function getAuthSession(props: {
  request: Request;
  context?: import("react-router").AppLoadContext;
}) {
  if (props.context?.auth) {
    const { session } = await props.context.auth;
    return session;
  }
  const { session } = await getSession(props.request);
  return session;
}
