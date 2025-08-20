import serialize from "serialize-javascript";
import en from "../../../public/locales/en.json";
import ja from "../../../public/locales/ja.json";
import { DEFAULT_LOCALE, I18N_PROP_NAME, LOCALE_KEY, SUPPORTED_LOCALES } from "../consts";

const i18nResources = {
  [DEFAULT_LOCALE]: ja,
  en,
} satisfies Record<string, I18nResource>;

const cookiePattern = `${encodeURIComponent(LOCALE_KEY)}=`;
const isDev = process.env.NODE_ENV === "development";
const serializedCache = new Map<string, string>();

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
  if (cookie) {
    const cookieStart = cookie.indexOf(cookiePattern);
    if (cookieStart !== -1) {
      const valueStart = cookieStart + cookiePattern.length;
      const valueEnd = cookie.indexOf(";", valueStart);
      const cookieValue = cookie.slice(valueStart, valueEnd === -1 ? undefined : valueEnd);
      const decodedLocale = decodeURIComponent(cookieValue);
      locale = SUPPORTED_LOCALES.find(k => k === decodedLocale) || locale;
    } else {
      locale = findBrowserLocaleAsServer(request);
    }
  } else {
    locale = findBrowserLocaleAsServer(request);
  }

  const resource = i18nResources[locale];
  const cacheKey = `${locale}-${Object.keys(resource).length}`;

  return {
    locale,
    resource,
    Payload: function () {
      let serializedData: string;

      if (!isDev && serializedCache.has(cacheKey)) {
        serializedData = serializedCache.get(cacheKey)!;
      } else {
        serializedData = serialize({ locale, resource }, {
          isJSON: true,
        });
        if (!isDev) {
          serializedCache.set(cacheKey, serializedData);
        }
      }

      return (
        <script
          id={I18N_PROP_NAME}
          dangerouslySetInnerHTML={{
            __html: `window.${I18N_PROP_NAME}=${serializedData}`,
          }}
        />
      );
    },
  };
};

export function findBrowserLocaleAsServer(request: Request): Locales {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Optimized Accept-Language parsing
  const preferredLocale = acceptLanguage
    .split(",", 10)
    .map((lang) => {
      const [locale, quality] = lang.split(";");
      return {
        locale: locale.trim().toLowerCase() as Locales,
        q: quality ? Number(quality.trim().match(/q=(.+)/)?.[1]) || 0 : 1,
      };
    })
    .sort((a, b) => b.q - a.q)
    .find(({ locale }) => SUPPORTED_LOCALES.includes(locale))?.locale;

  return preferredLocale || DEFAULT_LOCALE;
}

const regexCache = new Map<string, RegExp>();

function getOrCreateRegex(key: string): RegExp {
  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(`{{${key}}}`, "g"));
  }
  return regexCache.get(key)!;
}

export function getI18n(request: Request) {
  const { locale, resource } = loadI18nAsServer(request);
  const t: I18nGetter = <K extends I18nTextKey>(key: K, params?: I18nReplaceParams<K>) => {
    if (!key) return key;
    let text = (resource as Record<string, string>)[key];
    if (text == null) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) {
          text = text!.replace(getOrCreateRegex(k), String(v));
        }
      });
    }
    return text;
  };
  t.locale = locale;
  return { locale, t };
}
