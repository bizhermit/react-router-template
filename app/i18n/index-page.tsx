import { Navigate, redirect } from "react-router";
import { findLocaleAsClient } from "./client";
import { findBrowserLocaleAsServer } from "./server";

export function i18nRedirectIndexloader(args: { request: Request; }) {
  const locale = findBrowserLocaleAsServer(args.request);
  return redirect(`/${locale}`);
};

export function i18nRedirectIndexPage() {
  const locale = findLocaleAsClient();
  return <Navigate to={`/${locale}`} />;
};
