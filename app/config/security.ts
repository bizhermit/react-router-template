/**
 * セキュリティ設定モジュール
 */

// レート制限設定
export const RATE_LIMIT_CONFIG = {
  // API呼び出し制限（分あたり）
  API_CALLS_PER_MINUTE: 100,
  // ログイン試行制限
  LOGIN_ATTEMPTS_LIMIT: 5,
  // ログイン試行ロック時間（分）
  LOGIN_LOCK_DURATION_MINUTES: 15,
  // パスワードリセット試行制限
  PASSWORD_RESET_LIMIT: 3,
} as const;

// パスワード強度設定
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  FORBIDDEN_PATTERNS: [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
  ],
} as const;

// セッション設定
export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60 * 1000, // 24時間
  SECURE: process.env.NODE_ENV === "production",
  HTTP_ONLY: true,
  SAME_SITE: "strict" as const,
  SECRET: process.env.SESSION_SECRET || "change-this-in-production",
} as const;

// CSRF設定
export const CSRF_CONFIG = {
  ENABLED: true,
  COOKIE_NAME: "_csrf",
  HEADER_NAME: "x-csrf-token",
  EXCLUDE_PATHS: [
    "/health",
    "/csp-report",
  ],
} as const;

// IP制限設定
export const IP_RESTRICTION_CONFIG = {
  // 管理者ページへのアクセス制限IP
  ADMIN_ALLOWED_IPS: process.env.ADMIN_IPS?.split(",") || [],
  // 完全ブロックIP
  BLOCKED_IPS: process.env.BLOCKED_IPS?.split(",") || [],
} as const;

// ファイルアップロード制限
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
  SCAN_FOR_MALWARE: process.env.NODE_ENV === "production",
} as const;

// ログ設定
export const LOGGING_CONFIG = {
  SENSITIVE_FIELDS: [
    "password",
    "token",
    "secret",
    "authorization",
    "x-api-key",
  ],
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  AUDIT_LOG_ENABLED: process.env.NODE_ENV === "production",
} as const;
