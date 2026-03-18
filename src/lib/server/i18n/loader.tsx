import serialize from "serialize-javascript";
import en from "../../../../public/locales/en.json";
import ja from "../../../../public/locales/ja.json";
import { DEFAULT_LOCALE, I18N_PROP_NAME, LOCALE_KEY, SUPPORTED_LOCALES } from "../../shared/i18n/consts";

/** 言語リソース */
const I18N_RESOURCES = {
  [DEFAULT_LOCALE]: ja,
  en,
} satisfies Record<string, I18nResource>;

const COOKIE_PATTERN = `${encodeURIComponent(LOCALE_KEY)}=`; // Cookie取得キーワード
const IS_DEV = process.env.NODE_ENV === "development"; // 開発モード
const SERIALIZED_CACHE = new Map<string, string>(); // シリアライズキャッシュ

/**
 * 言語リソースをシリアライズ化する
 * - 本番時はキャッシュがあればそちらを使用する
 */
const getSerializedData: ((locale: Locales, resource: Record<string, unknown>) => string) =
  IS_DEV ?
    (locale, resource) => {
      return serialize({ locale, resource }, {
        isJSON: true,
      });
    } :
    (locale, resource) => {
      const cacheKey = `${locale}-${Object.keys(resource).length}`;
      if (SERIALIZED_CACHE.has(cacheKey)) {
        return SERIALIZED_CACHE.get(cacheKey)!;
      }
      const data = serialize({ locale, resource }, {
        isJSON: true,
      });
      SERIALIZED_CACHE.set(cacheKey, data);
      return data;
    };

/**
 * クライアントに送信する言語リソースオブジェクトを取得する
 * @param request {@link Request}
 * @returns
 */
export function getI18nPayload(request: Request) {
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
    const cookieStart = cookie.indexOf(COOKIE_PATTERN);
    if (cookieStart !== -1) {
      const valueStart = cookieStart + COOKIE_PATTERN.length;
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

  const resource = I18N_RESOURCES[locale];

  return {
    locale,
    resource,
    Payload: function ({ nonce }: { nonce?: string; }) {
      return (
        <script
          id={I18N_PROP_NAME}
          dangerouslySetInnerHTML={{
            __html: `window.${I18N_PROP_NAME}=${getSerializedData(locale, resource)}`,
          }}
          nonce={nonce}
        />
      );
    },
  };
};

/**
 * リクエストからブラウザのロケールを特定する
 * @param request {@link Request}
 * @returns
 */
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

/** i18nテキスト置換用正規表現キャッシュ */
const regexCache = new Map<string, RegExp>();

/**
 * i18nテキストのキーから置換用正規表現を取得する
 * @param key
 * @returns
 */
function getOrCreateRegex(key: string): RegExp {
  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(`{{${key}}}`, "g"));
  }
  return regexCache.get(key)!;
}

/**
 * i18nアクセサーを取得する
 * @param request {@link Request}
 * @returns
 */
export function getI18n(request: Request) {
  const { locale, resource } = getI18nPayload(request);
  const t: I18nGetter = <K extends I18nTextKey>(
    /** i18nキー */
    key: K,
    /** 置換値 */
    params?: I18nReplaceParams<K>
  ) => {
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
