import { cookieStore } from "$/server/cookie";
import { getI18nPayload } from "$/server/i18n/loader";
import { I18nProvider } from "$/shared/providers/i18n";
import { ThemeProvider } from "$/shared/providers/theme";
import { ValidScriptsProvider } from "$/shared/providers/valid-scripts";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { setPageResponseHeaders } from "~/auth/server/http/page-headers";

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

  return new Promise((resolve, reject) => {
    let didError = false;
    const cookie = cookieStore(request);
    const isValidScripts = cookie.getCookie("js") === "t";
    const theme = cookie.getCookie("theme");
    const nonce = "";

    const { pipe, abort } = renderToPipeableStream(
      <I18nProvider
        locale={i18n.locale}
        resource={i18n.resource}
      >
        <ThemeProvider
          defaultTheme={theme}
        >
          <ValidScriptsProvider
            initValid={isValidScripts}
          >
            <i18n.Payload />
            <ServerRouter
              context={reactRouterContext}
              url={request.url}
              nonce={nonce}
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
          showRenderError(error);
        },
        nonce,
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
};
