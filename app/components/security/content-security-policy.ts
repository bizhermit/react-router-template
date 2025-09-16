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
  "worker-src": string | boolean;
  "child-src": string | boolean;
  "object-src": string | boolean;
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

// 自動省略禁止ディレクティブ（default-srcと同値でも省略しない）
const NO_OMIT_KEYS = new Set<ContentSecurityPolicyKey>([
  "script-src",
  "connect-src",
]);

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
  const defaultSrcRaw = params?.policies?.["default-src"] || "'self'";
  const defaultSrcTokens = normalizeCspTokens(defaultSrcRaw);

  function isOmit(key: ContentSecurityPolicyKey, raw: string) {
    if (NO_OMIT_KEYS.has(key)) return false;
    const tokens = normalizeCspTokens(raw);
    if (tokens.length !== defaultSrcTokens.length) return false;
    return tokens.every((t, i) => t === defaultSrcTokens[i]);
  };

  function getCspDirective(key: ContentSecurityPolicyKey, fallback?: string | boolean | null | undefined) {
    const raw = params?.policies?.[key];
    if (raw == null) {
      if (fallback == null || fallback === false) return null;
      if (fallback === true) return key;
      if (isOmit(key, fallback)) return null;
      return `${key} ${fallback}`;
    }
    if (raw === false) return null;
    if (raw === true) return key;
    if (isOmit(key, raw)) return null;
    return `${key} ${raw}`;
  };

  const csp = [
    `default-src ${defaultSrcRaw}`,
    getCspDirective("script-src",
      params?.isDev ?
        "'self' 'unsafe-inline' 'unsafe-eval'" :
        "'self' 'unsafe-inline'"
    ),
    getCspDirective("style-src", "'self' 'unsafe-inline'"),
    getCspDirective("img-src", "'self' data:"),
    getCspDirective("font-src"),
    getCspDirective("connect-src",
      params?.isDev ?
        "'self' ws: wss:" :
        null
    ),
    getCspDirective("media-src"),
    getCspDirective("worker-src"),
    getCspDirective("object-src", "'none'"),
    // getCspDirective("child-src"), // NOTE: CSP Level 3では非推奨。frame-srcに統一
    getCspDirective("frame-src"),
    getCspDirective("frame-ancestors", "'none'"),
    getCspDirective("base-uri"),
    getCspDirective("form-action"),
    getCspDirective("manifest-src"),
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
