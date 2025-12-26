import { getCookie } from "$/client/cookie";
import { loadI18nAsClient } from "$/client/i18n/loader";
import { I18nProvider } from "$/shared/providers/i18n";
import { ThemeProvider } from "$/shared/providers/theme";
import { ValidScriptsProvider } from "$/shared/providers/valid-scripts";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

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
        <ThemeProvider
          defaultTheme={theme}
        >
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
