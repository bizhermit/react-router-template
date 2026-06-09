import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import serialize from "serialize-javascript";
import { DEFAULT_LOCALE, I18N_PROP_NAME, LOCALE_KEY, SUPPORTED_LOCALES } from "../../shared/i18n/consts";

const COOKIE_PATTERN = `${encodeURIComponent(LOCALE_KEY)}=`; // Cookie取得キーワード
const IS_DEV = process.env.NODE_ENV === "development"; // 開発モード
const RESOURCE_CACHE = new Map<string, Map<string, I18nResource>>();
const SERIALIZED_CACHE = new Map<string, string>(); // シリアライズキャッシュ

async function getI18nResource(locale: Locales, addon: string = "") {
  if (!RESOURCE_CACHE.has(locale)) {
    RESOURCE_CACHE.set(locale, new Map());
  }
  const cache = RESOURCE_CACHE.get(locale)!;
  if (cache.has(addon)) {
    return cache.get(addon)!;
  }

  const langPath = path.join(
    process.cwd(),
    "public/locales",
    !addon ? `${locale}.json` : `${locale}.${addon}.json`
  );
  if (!existsSync(langPath)) {
    process.stderr.write(`\n[warning] not found lang file: ${langPath}\n`);
    cache.set(addon, {});
    return {} as I18nResource;
  }

  const langBuf = await readFile(langPath);
  const langStr = langBuf.toString();
  const langJson = JSON.parse(langStr) as I18nResource;

  cache.set(addon, langJson);
  return langJson;
};

/**
 * 追加言語リソースを取得する
 * @param request
 * @param addons
 * @returns
 */
export async function getI18nAddonResource(
  request: Request,
  addons: string[]
) {
  const locale = getLocale(request);
  const ret: I18nAddonResources = {};
  await Promise.all(
    addons.map(async (addon) => {
      const res = await getI18nResource(locale, addon);
      ret[addon] = res;
    }),
  );
  return ret;
};

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

export function getLocale(request: Request) {
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
  return locale;
};

/**
 * クライアントに送信する言語リソースオブジェクトを取得する
 * @param request {@link Request}
 * @returns
 */
export async function getI18nPayload(request: Request) {
  const locale = getLocale(request);

  const resource = await getI18nResource(locale);

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
};
