import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import "$/components/global.css";
import { useLocale } from "$/shared/hooks/i18n";
import { I18nCookieLocator } from "$/shared/providers/i18n";
import { useTheme } from "$/shared/providers/theme";
import type { ReactNode } from "react";
import { auth } from "~/auth/server/auth";
import { AuthProvider } from "~/auth/shared/providers/auth";
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
  // {
  //   rel: "preconnect",
  //   href: "https://fonts.gstatic.com",
  //   crossOrigin: "anonymous",
  // },
  // {
  //   rel: "stylesheet",
  //   href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  // },
];

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { headers, response } = await auth.api.getSession({
      headers: request.headers,
      returnHeaders: true,
    });

    if (response) {
      return data({
        user: response?.user,
      }, { headers });
    }
  } catch {
    // fallback
  }
  return data({
    user: undefined,
  });
};

export function Layout({ children }: { children: ReactNode; }) {
  const data = useRouteLoaderData<Route.ComponentProps["loaderData"]>("root");

  const { lang } = useLocale();
  const { theme } = useTheme();

  return (
    <I18nCookieLocator>
      <AuthProvider
        user={data?.user}
      >
        <html
          lang={lang}
          data-theme={theme}
        >
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content" />
            <Meta />
            <Links />
          </head>
          <body>
            {children}
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </AuthProvider>
    </I18nCookieLocator>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404
      ? "The requested page could not be found."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
