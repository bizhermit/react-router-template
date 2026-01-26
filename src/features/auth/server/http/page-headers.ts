import { createContentSecurityPolicy } from "$/server/http/content-security-policy";
import { createPermissionPolicy } from "$/server/http/permission-policy";

const IS_DEV = process.env.NODE_ENV === "development";
const MODE = import.meta.env.MODE || "production";

const SELF_ORIGIN = process.env.SELF_ORIGIN || `http://localhost:${IS_DEV ? (process.env.DEV_PORT || 5173) : (process.env.PORT || 3000)}`;

const CSP_REPORT_URL = process.env.CSP_REPORT_URL || `${SELF_ORIGIN}/csp-report/`;
const REPORT_TO_CSP_ENDPOINT = JSON.stringify({
  group: "csp-endpoint",
  max_age: 31536000,
  endpoints: [
    {
      url: CSP_REPORT_URL,
      priority: 1,
      method: "POST",
    },
  ],
});

const CONTENT_SECURITY_POLICY = createContentSecurityPolicy({
  isDev: IS_DEV,
  policies: {
    "script-src": IS_DEV ? undefined : false, // NOTE: 本番環境はnonceを使用するためリクエスト内で追加する
    "style-src": IS_DEV ? undefined : false, // NOTE: 本番環境はnonceを使用するためリクエスト内で追加する
  },
});

export const getCspDirectiveNonceable: ((nonce?: string) => string) = IS_DEV
  ? () => ""
  : (nonce) => {
    const val = `'self' '${nonce ? `nonce-${nonce}` : "unsafe-inline"}'`;
    return `; script-src ${val}; style-src ${val}`;
  };

const PERMISSION_POLICY = createPermissionPolicy();

/**
 * キャッシュ無効化ヘッダー設定
 * @param headers - HTTPレスポンスヘッダー
 */
function noCacheHeader(headers: Headers): void {
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("Vary", "Accept-Encoding, Origin, User-Agent");
}

/**
 * 開発時のヘッダー設定
 * @param headers - HTTPレスポンスヘッダー
 */
function devHeader(headers: Headers): void {
  // NOTE: 開発時は常にキャッシュを無効化
  noCacheHeader(headers);
}

/**
 * 本番環境のヘッダー設定
 * @param headers - HTTPレスポンスヘッダー
 */
function prodHeader(headers: Headers): void {
  // HSTS with stronger configuration
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
}

/**
 * テスト環境のヘッダー設定
 * @param headers - HTTPレスポンスヘッダー
 */
function testHeader(headers: Headers): void {
  prodHeader(headers);
  noCacheHeader(headers); // NOTE: テストモード時は常にキャッシュを無効化
}

/**
 * 環境別ヘッダー設定
 */
const setResponseHeadersAsMode =
  IS_DEV ? devHeader : (
    MODE === "test" ? testHeader : prodHeader
  );

/**
 * ページ用レスポンスヘッダー設定
 * セキュリティヘッダー、キャッシュ制御、CORS設定等を包括的に設定する
 * @param headers - HTTPレスポンスヘッダー
 */
export function setPageResponseHeaders(headers: Headers, options?: { nonce?: string; }): void {
  // Content type
  headers.set("Content-Type", "text/html; charset=utf-8");

  // Cross-origin isolation
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Security headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("X-Download-Options", "noopen");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("X-XSS-Protection", "0"); // NOTE: CSPに依存するため無効化

  // Modern security policies
  headers.set("Permission-Policy", PERMISSION_POLICY);
  headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY + getCspDirectiveNonceable(options?.nonce));
  headers.set("Report-To", REPORT_TO_CSP_ENDPOINT);

  // Server information hiding
  headers.set("Server", ""); // NOTE: プロキシ/CDNでの上書き防止のため空文字を設定する

  setResponseHeadersAsMode(headers);
}
