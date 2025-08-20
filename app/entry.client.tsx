import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { AuthProvider } from "./auth/client/provider";
import { getCookie } from "./components/cookie/client";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { loadI18nAsClient } from "./i18n/client/loader";
import { I18nProvider } from "./i18n/client/provider";

async function hydrate() {
  const i18n = await loadI18nAsClient();
  const isValidScripts = document.cookie.includes("js=t");
  const theme = getCookie("theme");
  const csrfToken = (() => {
    const elem = document.querySelector("meta[name='csrf-token']");
    if (!elem) return undefined;
    const token = elem.getAttribute("content") || undefined;
    elem.remove();
    return token;
  })();

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nProvider
        locale={i18n.locale}
        resource={i18n.resource}
      >
        <AuthProvider csrfToken={csrfToken}>
          <ThemeProvider defaultTheme={theme}>
            <ValidScriptsProvider
              initValid={isValidScripts}
            >
              <StrictMode>
                <HydratedRouter />
              </StrictMode>
            </ValidScriptsProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nProvider>
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
