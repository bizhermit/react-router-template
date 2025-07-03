import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { I18nProvider } from "./i18n/provider";
import { loadI18nAsClient } from "./i18n/client";
import { ValidScriptsProvider } from "./components/providers/valid-scripts";

async function hydrate() {
  const i18n = await loadI18nAsClient();
  const isValidScripts = document.cookie.includes("js=t");

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nProvider
        locale={i18n.locale}
        resource={i18n.resource}
      >
        <ValidScriptsProvider
          initValid={isValidScripts}
        >
          <StrictMode>
            <HydratedRouter />
          </StrictMode>
        </ValidScriptsProvider>
      </I18nProvider>
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
