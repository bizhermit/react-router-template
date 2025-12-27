import { DEFAULT_LOCALE, I18N_PATHNAME, I18N_PROP_NAME, LOCALE_KEY, SUPPORTED_LOCALES } from "../../shared/i18n/consts";

declare global {
  interface Window {
    [I18N_PROP_NAME]?: {
      locale: Locales;
      resource: I18nResource;
    };
  }
};

export async function loadI18nAsClient(): Promise<{
  locale: Locales;
  resource: I18nResource;
}> {
  const i18n = window[I18N_PROP_NAME];
  if (i18n) {
    document.getElementById(I18N_PROP_NAME)?.remove();
    delete window[I18N_PROP_NAME];
    return i18n;
  }
  const locale = await findLocaleAsClient();
  const resource = await (await (() => {
    switch (locale) {
      case "en": return fetch(`${I18N_PATHNAME}/en.json`);
      default: return fetch(`${I18N_PATHNAME}/ja.json`);
    }
  })()).json();
  return {
    locale,
    resource,
  };
};

const i18nCookieRegExp = new RegExp(`^${encodeURIComponent(LOCALE_KEY)}=(.+)`);

export async function findLocaleAsClient() {
  let locale: Locales = DEFAULT_LOCALE;
  /* URL */
  // const lng = window.location.pathname.match(/^\/([^/]+)/);
  // if (lng) {
  //   locale = SUPPORTED_LOCALES.find(k => k === lng[1]) || locale;
  // } else {
  //   locale = (navigator.languages.find(l => SUPPORTED_LOCALES.find(L => L === l)) as Locales | undefined) || locale;
  // }
  /* Cookie */
  const v = document.cookie.split(/;\s?/g).find(c => c.match(i18nCookieRegExp))?.split("=")[1];
  if (v) {
    const l = decodeURIComponent(v);
    locale = SUPPORTED_LOCALES.find(k => k === l) || locale;
  } else {
    locale = findBrowserLocaleAsClient() || locale;
  }
  return locale;
};

export function findBrowserLocaleAsClient() {
  return navigator.languages.find(l => SUPPORTED_LOCALES.find(L => L === l)) as Locales | undefined;
};
