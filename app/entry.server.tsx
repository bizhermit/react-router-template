import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { AuthProvider } from "./auth/client/provider";
import { getAuthPayload } from "./auth/server/loader";
import { cookieStore } from "./components/cookie/server";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { setPageResponseHeaders } from "./features/middleware/page-headers";
import { I18nProvider } from "./i18n/client/provider";
import { getI18nPayload } from "./i18n/server/loader";

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

  const i18n = getI18nPayload(request);
  const auth = await getAuthPayload(request);
  if (auth.cookie) {
    headers.append("Set-Cookie", auth.cookie);
  }

  return new Promise((resolve, reject) => {
    let didError = false;
    const cookie = cookieStore(request);
    const isValidScripts = cookie.getCookie("js") === "t";
    const theme = cookie.getCookie("theme");

    const { pipe, abort } = renderToPipeableStream(
      <AuthProvider
        csrfToken={auth.csrfToken}
        session={auth.session}
      >
        <I18nProvider
          locale={i18n.locale}
          resource={i18n.resource}
        >
          <ThemeProvider defaultTheme={theme}>
            <ValidScriptsProvider
              initValid={isValidScripts}
            >
              <auth.Payload />
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
