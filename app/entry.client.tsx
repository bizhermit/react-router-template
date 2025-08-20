import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { getCookie } from "./components/cookie/client";
import { ThemeProvider } from "./components/react/providers/theme";
import { ValidScriptsProvider } from "./components/react/providers/valid-scripts";
import { loadI18nAsClient } from "./i18n/client/loader";
import { I18nProvider } from "./i18n/client/provider";

async function hydrate() {
  const isValidScripts = document.cookie.includes("js=t");
  const theme = getCookie("theme");
  const i18n = await loadI18nAsClient();

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nProvider
        locale={i18n.locale}
        resource={i18n.resource}
      >
        <ThemeProvider defaultTheme={theme}>
          <ValidScriptsProvider
            initValid={isValidScripts}
          >
            <StrictMode>
              <HydratedRouter />
            </StrictMode>
          </ValidScriptsProvider>
        </ThemeProvider>
      </I18nProvider>
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
