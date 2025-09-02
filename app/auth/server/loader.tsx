import { removeCsrfTokenCookie } from "./config";
import { getCsrfToken } from "./csrf-token";
import { getSession } from "./session";

export async function getAuthPayload(request: Request) {
  const session = await getSession(request);
  if (session) {
    return {
      csrfToken: session.csrfToken,
      cookie: removeCsrfTokenCookie,
      session,
    } as const;
  }

  const csrfToken = await getCsrfToken(request);
  return {
    csrfToken: csrfToken.csrfToken,
    cookie: csrfToken.cookie,
    session,
  } as const;
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
  return await getSession(props.request);
}
