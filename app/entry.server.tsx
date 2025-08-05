import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type AppLoadContext, type EntryContext } from "react-router";
import { PassThrough } from "stream";
import { cookieStore } from "./components/cookie/server";
import { I18nProvider } from "./components/react/providers/i18n";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { loadI18nAsServer } from "./i18n/server";

const ABORT_DELAY = 5000;
const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
const appMode = import.meta.env.VITE_APP_MODE || "prod";
const defaultOrigin = `http://localhost:${isDev ? (process.env.DEV_PORT || 5173) : (process.env.PORT || 3000)}`;

const cspReportOrigin = process.env.CSP_REPORT_ORIGIN || defaultOrigin;
const reportToCspEndpoint = JSON.stringify({
  group: "csp-endpoint",
  max_age: 31536000,
  endpoints: [
    {
      url: `${cspReportOrigin}/csp-report`,
      priority: 1,
      method: "POST",
    },
  ],
});

const allowOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(o => o.length > 0);

if (allowOrigins.length === 0) {
  allowOrigins.push(defaultOrigin);
}

function prodHeader(headers: Headers) {
  headers.set("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // TODO: nonce-${nonce}の検討
    "style-src 'self' 'unsafe-inline'", // TODO: nonce-${nonce}の検討
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: ws: wss: blob: data:",
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "child-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "report-uri /csp-report",
    "report-to csp-endpoint",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join("; "));
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
};

function noCacheHeader(headers: Headers) {
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("Vary", "Accept-Encoding, Origin, User-Agent");
};

const generateResponseHeadersAsMode = isDev ?
  (headers: Headers) => {
    headers.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https: http:",
      "connect-src 'self' http: https: ws: wss: blob: data:",
      "media-src 'self' blob: data:",
      "worker-src 'self' blob:",
      "child-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "manifest-src 'self'",
      "report-uri /csp-report",
      "report-to csp-endpoint",
    ].join("; "));
    // NOTE: 開発時は常にキャッシュを無効化
    noCacheHeader(headers);
  } : (
    appMode === "test" ?
      (headers: Headers) => {
        prodHeader(headers);
        // NOTE: テストモード時は常にキャッシュを無効化
        noCacheHeader(headers);
      } :
      (headers: Headers) => {
        prodHeader(headers);
      }
  );

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
          const url = new URL(request.url);
          if (url.pathname.startsWith("/api/")) {
            headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
            headers.set("Pragma", "no-cache");
            headers.set("Expires", "0");
            const origin = request.headers.get("origin");
            if (origin && allowOrigins.some(allowed => allowed === origin)) {
              headers.set("Access-Control-Allow-Origin", origin);
              headers.set("Access-Control-Allow-Credentials", "true");
            } else if (allowOrigins.includes("*")) {
              headers.set("Access-Control-Allow-Origin", "*");
            }
            headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            if (request.method === "OPTIONS") {
              headers.set("Access-Control-Max-Age", "86400"); // 24時間のプリフライトキャッシュ
            }
          } else if (url.pathname.startsWith("/static/")) {
            headers.set("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            headers.set("Content-Type", "text/html");
            headers.set("Permission-Policy", [
              "geolocation=()",
              "microphone=()",
              "camera=()",
              "payment=()",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
              "accelerometer=()",
              "fullscreen=()",
              "picture-in-picture=()",
              "autoplay=()",
              "encrypted-media=()",
              "midi=()",
              "push=()",
              "speaker-selection=()",
              "sync-xhr=()",
              "web-share=()",
            ].join(", "));
          }
          if (!url.pathname.startsWith("/api/")) {
            headers.set("Cross-Origin-Embedder-Policy", "require-corp");
            headers.set("Cross-Origin-Opener-Policy", "same-origin");
          }
          headers.set("X-Content-Type-Options", "nosniff");
          headers.set("X-Frame-Options", "DENY");
          headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          headers.set("X-DNS-Prefetch-Control", "off");
          headers.set("X-Download-Options", "noopen");
          headers.set("Report-To", reportToCspEndpoint);
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
