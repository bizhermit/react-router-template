import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { ValidScriptsProvider } from "./components/providers/valid-scripts";
import { I18nProvider } from "./i18n/provider";
import { loadI18nAsServer } from "./i18n/server";

const ABORT_DELAY = 5000;
const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const generateResponseHeadersAsMode = isDev ?
  (headers: Headers) => {
    headers.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https: http:",
      "connect-src 'self' http: https: ws: wss: blob: data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "report-uri /csp-violation-report-endpoint",
      "report-to csp-endpoint",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join("; "));
    // 開発時は常にキャッシュを無効化
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Vary", "Accept-Encoding, Origin, User-Agent");
  } :
  (headers: Headers) => {
    headers.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https: ws: wss: blob: data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "report-uri /csp-violation-report-endpoint",
      "report-to csp-endpoint",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join("; "));
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  };

let reportToCspEndpoint = "";

function getCspReportEndpoint(url: URL) {
  if (!reportToCspEndpoint) {
    reportToCspEndpoint = JSON.stringify({
      group: "csp-endpoint",
      max_age: 31536000,
      endpoints: [
        {
          url: `${url.origin}/csp-endpoint`,
          priority: 1,
          method: "POST",
        },
      ],
    });
  }
  return reportToCspEndpoint;
}

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
    const isValidScripts = request.headers.get("cookie")?.includes("js=t");

    const { pipe, abort } = renderToPipeableStream(
      <I18nProvider
        locale={i18n.locale}
        resource={i18n.resource}
      >
        <ValidScriptsProvider
          initValid={isValidScripts}
        >
          <i18n.Payload />
          <ServerRouter
            context={reactRouterContext}
            url={request.url}
          />
        </ValidScriptsProvider>
      </I18nProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          const url = new URL(request.url);
          if (url.pathname.startsWith("/api/")) {
            headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
            headers.set("Pragma", "no-cache");
            headers.set("Expires", "0");
          } else if (url.pathname.startsWith("/static/")) {
            headers.set("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            headers.set("Content-Type", "text/html");
          }
          headers.set("X-content-type-options", "nosniff");
          headers.set("Access-Control-Allow-Origin", "*");
          headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          headers.set("Access-Control-Allow-Headers", "Content-Type");
          headers.set("X-Frame-Options", "DENY");
          headers.set("X-XSS-Protection", "1; mode=block");
          headers.set("Referrer-Policy", "no-referrer");
          headers.set("Report-To", getCspReportEndpoint(url));
          generateResponseHeadersAsMode(headers);

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
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
};
