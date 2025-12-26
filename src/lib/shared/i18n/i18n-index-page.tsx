import { Navigate, redirect } from "react-router";
import { findLocaleAsClient } from "../../client/i18n/loader";
import { findBrowserLocaleAsServer } from "../../server/i18n/loader";

export function i18nRedirectIndexloader(args: { request: Request; }) {
  const locale = findBrowserLocaleAsServer(args.request);
  return redirect(`/${locale}`);
};

export function i18nRedirectIndexPage() {
  const locale = findLocaleAsClient();
  return <Navigate to={`/${locale}`} />;
};
