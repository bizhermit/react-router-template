import serialize from "serialize-javascript";
import { AUTH_PROP_NAME } from "../consts";
import { getCsrfToken } from "./csrf-token";
import { getSession } from "./session";

export async function getAuthPayload(request: Request) {
  const [csrfToken, session] = await Promise.all([
    getCsrfToken(request),
    getSession(request),
  ]);

  return {
    csrfToken: csrfToken.csrfToken,
    cookie: csrfToken.cookie,
    session,
    Payload: function () {
      const serializedData = serialize({
        csrfToken: csrfToken.csrfToken,
        session,
      });

      return (
        <script
          id={AUTH_PROP_NAME}
          dangerouslySetInnerHTML={{
            __html: `window.${AUTH_PROP_NAME}=${serializedData}`,
          }}
        />
      );
    },
  } as const;
};
