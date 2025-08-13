import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { cookieStore } from "./components/cookie/server";
import { I18nProvider } from "./components/react/providers/i18n";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { setPageResponseHeaders } from "./features/middleware/page-headers";
import { loadI18nAsServer } from "./i18n/server";

const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
const appMode = import.meta.env.VITE_APP_MODE || "prod";
const selfOrigin = `http://localhost:${isDev ? (process.env.DEV_PORT || 5173) : (process.env.PORT || 3000)}`;

const ABORT_DELAY = 5000;

const allowOrigins = (process.env.CORS_ALLOW_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(o => o.length > 0);

if (allowOrigins.length === 0) {
  allowOrigins.push(selfOrigin);
}
const allowOriginsSet = new Set(allowOrigins);
const isAllowOriginAll = allowOriginsSet.has("*");

const SUSPICIOUS_PATH_PATTERN = /(\.\.|\/\/|%[0-9a-fA-F]{2})/;

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

  return new Promise((resolve, reject) => {
    let didError = false;
    const cookie = cookieStore(request);
    const isValidScripts = cookie.getCookie("js") === "t";
    const theme = cookie.getCookie("theme");

    const { pipe, abort } = renderToPipeableStream(
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
      </I18nProvider>,
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
          if (isDev) {
            console.error("Render error:", error);
          } else {
            console.error("Render error occurred");
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
};
