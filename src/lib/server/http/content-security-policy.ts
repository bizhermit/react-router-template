/**
 * string: ディレクティブ値
 * true: ディレクティブ名のみ出力
 * false: ディレクティブ省略
 */
type ContentSecurityPolicy = {
  "default-src": string;
  "script-src": string | boolean;
  "style-src": string | boolean;
  "img-src": string | boolean;
  "font-src": string | boolean;
  "connect-src": string | boolean;
  "media-src": string | boolean;
  "object-src": string | boolean;
  "worker-src": string | boolean;
  "child-src": string | boolean;
  "frame-src": string | boolean;
  "frame-ancestors": string | boolean;
  "base-uri": string | boolean;
  "form-action": string | boolean;
  "manifest-src": string | boolean;
  "report-uri": string | boolean; // NOTE: 将来的に非推奨 (Report-To 優先)
  "report-to": string | boolean;
  "upgrade-insecure-requests": boolean;
  "block-all-mixed-content": boolean;
};

type ContentSecurityPolicyKey = keyof ContentSecurityPolicy;

// default-srcにfallback可能なディレクティブ
const FALLBACKABLE_DIRECTIVES = new Set<ContentSecurityPolicyKey>([
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "object-src",
  "worker-src",
]);

// 自動省略禁止ディレクティブ（default-srcと同値でも省略しない）
const NO_FALLBACK_DIRECTIVES = new Set<ContentSecurityPolicyKey>([
  "script-src",
  "connect-src",
]);

const SELF = "'self'";

function normalizeCspTokens(v: string) {
  return Array.from(new Set(v.trim().split(/\s+/))).sort();
};

/**
 * CSP生成
 * @param params
 * @returns
 */
export function createContentSecurityPolicy(params?: {
  policies?: Partial<ContentSecurityPolicy>;
  isDev?: boolean;
}) {
  const defaultSrcRaw = params?.policies?.["default-src"] || SELF;
  const defaultSrcTokens = normalizeCspTokens(defaultSrcRaw);

  function isFallback(key: ContentSecurityPolicyKey, raw: string) {
    if (!FALLBACKABLE_DIRECTIVES.has(key)) return false;
    if (NO_FALLBACK_DIRECTIVES.has(key)) return false;
    const tokens = normalizeCspTokens(raw);
    if (tokens.length !== defaultSrcTokens.length) return false;
    return tokens.every((t, i) => t === defaultSrcTokens[i]);
  };

  function getCspDirective(key: ContentSecurityPolicyKey, defaultRaw?: string | boolean | null | undefined) {
    const raw = params?.policies?.[key];
    if (raw == null) {
      if (defaultRaw == null || defaultRaw === false) return null;
      if (defaultRaw === true) return key;
      if (isFallback(key, defaultRaw)) return null;
      return `${key} ${defaultRaw}`;
    }
    if (raw === false) return null;
    if (raw === true) return key;
    if (isFallback(key, raw)) return null;
    return `${key} ${raw}`;
  };

  const csp = [
    `default-src ${defaultSrcRaw}`,
    getCspDirective("script-src",
      params?.isDev ?
        `${SELF} 'unsafe-inline' 'unsafe-eval'` :
        `${SELF} 'unsafe-inline'`
    ),
    getCspDirective("style-src", `${SELF} 'unsafe-inline'`),
    getCspDirective("img-src", `${SELF} data:`),
    getCspDirective("font-src"),
    getCspDirective("connect-src",
      params?.isDev ?
        `${SELF} ws: wss:` :
        null
    ),
    getCspDirective("media-src"),
    getCspDirective("object-src", "'none'"),
    getCspDirective("worker-src"),
    // getCspDirective("child-src", SELF), // NOTE: CSP Level 3では非推奨。frame-srcに統一
    getCspDirective("frame-src", SELF),
    getCspDirective("frame-ancestors", "'none'"),
    getCspDirective("base-uri", SELF),
    getCspDirective("form-action", SELF),
    getCspDirective("manifest-src", SELF),
  ];
  if (!params?.isDev) {
    csp.push(
      getCspDirective("report-uri", "/csp-report"),
      getCspDirective("report-to", "csp-endpoint"),
      getCspDirective("upgrade-insecure-requests", true),
      getCspDirective("block-all-mixed-content", true),
    );
  }
  return csp.filter(Boolean).join("; ");
};
