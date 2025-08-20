import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { AuthProvider } from "./auth/client/provider";
import { getCsrfToken } from "./auth/server/csrf-token";
import { getSession } from "./auth/server/session";
import { cookieStore } from "./components/cookie/server";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { setPageResponseHeaders } from "./features/middleware/page-headers";
import { I18nProvider } from "./i18n/client/provider";
import { loadI18nAsServer } from "./i18n/server/loader";

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const ABORT_DELAY = 5000;

const showRenderError = (error: unknown) => {
  if (isDev || isTest) {
    console.error("Render error:", error);
  } else {
    console.error("Render error occurred");
  }
};

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  reactRouterContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  let callbackName = "onShellReady";
  if (isbot(request.headers.get("user-agent"))) {
    callbackName = "onAllReady";
  }

  const i18n = loadI18nAsServer(request);
  const [csrfToken, session] = await Promise.all([
    getCsrfToken(request).then(({ csrfToken, cookie }) => {
      if (cookie) {
        headers.append("Set-Cookie", cookie);
      }
      return csrfToken;
    }),
    getSession(request),
  ]);

  return new Promise((resolve, reject) => {
    let didError = false;
    const cookie = cookieStore(request);
    const isValidScripts = cookie.getCookie("js") === "t";
    const theme = cookie.getCookie("theme");

    const { pipe, abort } = renderToPipeableStream(
      <AuthProvider
        csrfToken={csrfToken}
        session={session}
      >
        <I18nProvider
          locale={i18n.locale}
          resource={i18n.resource}
        >
          <ThemeProvider defaultTheme={theme}>
            <ValidScriptsProvider
              initValid={isValidScripts}
            >
              <i18n.Payload />
              <ServerRouter
                context={reactRouterContext}
                url={request.url}
              />
            </ValidScriptsProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          setPageResponseHeaders(headers);

          resolve(
            new Response(stream, {
              headers: headers,
              status: didError ? 500 : statusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;
          showRenderError(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
};
