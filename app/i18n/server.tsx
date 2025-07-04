import serialize from "serialize-javascript";
import en from "../../public/locales/en.json";
import ja from "../../public/locales/ja.json";
import { DEFAULT_LOCALE, I18N_PROP_NAME, LOCALE_KEY, SUPPORTED_LOCALES } from "./config";

const i18nResources = {
  [DEFAULT_LOCALE]: ja,
  en,
} satisfies Record<string, I18nResource>;

const i18nCookieRegExp = new RegExp(`^${encodeURIComponent(LOCALE_KEY)}=(.+)`);

export function loadI18nAsServer(request: Request) {
  let locale: Locales = DEFAULT_LOCALE;
  /* URL */
  // const url = new URL(request.url);
  // const lng = url.pathname.match(/^\/([^/]+)/);
  // if (lng) {
  //   locale = SUPPORTED_LOCALES.find(k => k === lng[1]) || locale;
  // } else {
  //   locale = findBrowserLocaleAsServer(request);
  // }
  /* Cookie */
  const cookie = request.headers.get("cookie");
  const v = cookie?.split(/;\s?/g).find(c => c.match(i18nCookieRegExp))?.split("=")[1];
  if (v) {
    const l = decodeURIComponent(v);
    locale = SUPPORTED_LOCALES.find(k => k === l) || locale;
  } else {
    locale = findBrowserLocaleAsServer(request);
  }

  const resource = i18nResources[locale];
  return {
    locale,
    resource,
    Payload: function () {
      return (
        <script
          id={I18N_PROP_NAME}
          dangerouslySetInnerHTML={{
            __html: `window.${I18N_PROP_NAME}=${serialize({ locale, resource })}`,
          }}
        />
      );
    },
  };
};

export function findBrowserLocaleAsServer(request: Request) {
  const al = request.headers.get("accept-language");
  const locales = al?.split(",")
    .map((lang) => {
      const [l, q] = lang.split(";");
      return {
        l: l.trim().toLowerCase() as Locales,
        q: (() => {
          if (!q) return 1;
          const num = Number(q.trim().match(/q=(.+)/)?.[1]);
          if (num == null || isNaN(num)) return 0;
          return num;
        })(),
      };
    })
    .sort((l1, l2) => l2.q - l1.q)
    .filter(({ l }) => SUPPORTED_LOCALES.find(L => L === l))
    .map(({ l }) => l) ?? [];
  if (locales.length === 0) return DEFAULT_LOCALE;
  return locales[0];
};

export function getI18n(request: Request) {
  const { locale, resource } = loadI18nAsServer(request);
  return {
    locale,
    t: <K extends I18nTextKey>(key: K, params?: I18nReplaceParams<K>) => {
      if (!key) return key;
      let text = (resource as Record<string, string>)[key];
      if (text == null) return key;
      if (params) {
        Object.keys(params).forEach(k => {
          const v = (params as Record<string, I18nReplaceValue>)[k];
          if (v == null) return;
          text = text!.replace(new RegExp(`{{${k}}}`, "g"), String(v));
        });
      }
      return text;
    },
  };
};
