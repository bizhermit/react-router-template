// import type { AppLoadContext } from "react-router";
// import { CSRF_CONFIG, IP_RESTRICTION_CONFIG, RATE_LIMIT_CONFIG } from "~/config/security";

// // レート制限管理
// const rateLimitStore = new Map<string, { count: number; resetTime: number; }>();

// // CSRF トークン管理（独自生成トークン用）
// // Auth.js の CSRF トークンはクッキー ("csrf-token") に保存されるため、
// // セット未登録でもクッキーとヘッダのダブルサブミット検証を行う。
// const csrfTokens = new Set<string>();

// // クッキー解析（軽量パーサ）
// function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
//   if (!cookieHeader) return {};
//   return Object.fromEntries(
//     cookieHeader.split(/; */).filter(Boolean).map(part => {
//       const i = part.indexOf("=");
//       if (i === -1) return [part.trim(), ""];
//       const k = part.slice(0, i).trim();
//       const v = decodeURIComponent(part.slice(i + 1));
//       return [k, v];
//     })
//   );
// }

// // 外部で Auth.js 由来のトークンを明示登録したい場合用
// export function registerCSRFToken(token: string) {
//   if (token) csrfTokens.add(token);
// }

// /**
//  * IP制限チェック
//  */
// export function checkIPRestriction(request: Request): boolean {
//   const clientIP = getClientIP(request);

//   // ブロックリストチェック
//   if (IP_RESTRICTION_CONFIG.BLOCKED_IPS.includes(clientIP)) {
//     return false;
//   }

//   // 管理者ページの場合、許可IPチェック
//   const url = new URL(request.url);
//   if (url.pathname.startsWith("/admin")) {
//     return IP_RESTRICTION_CONFIG.ADMIN_ALLOWED_IPS.length === 0 ||
//       IP_RESTRICTION_CONFIG.ADMIN_ALLOWED_IPS.includes(clientIP);
//   }

//   return true;
// }

// /**
//  * レート制限チェック
//  */
// export function checkRateLimit(request: Request): boolean {
//   const clientIP = getClientIP(request);
//   const now = Date.now();
//   const windowMs = 60 * 1000; // 1分

//   const key = `${clientIP}:${Math.floor(now / windowMs)}`;
//   const current = rateLimitStore.get(key);

//   if (!current) {
//     rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
//     return true;
//   }

//   if (current.count >= RATE_LIMIT_CONFIG.API_CALLS_PER_MINUTE) {
//     return false;
//   }

//   current.count++;
//   return true;
// }

// /**
//  * CSRF保護チェック
//  */
// export function checkCSRFProtection(request: Request): boolean {
//   if (!CSRF_CONFIG.ENABLED) return true;

//   const url = new URL(request.url);

//   // 除外パスチェック
//   if (CSRF_CONFIG.EXCLUDE_PATHS.some(path => url.pathname.startsWith(path))) {
//     return true;
//   }

//   // 安全メソッドは除外
//   if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
//     return true;
//   }

//   const headerToken = request.headers.get(CSRF_CONFIG.HEADER_NAME);
//   if (!headerToken) return false; // ヘッダ必須

//   // 1) ダブルサブミットクッキー方式 (Auth.js の cookie 名 "csrf-token" と設定値の両方を許容)
//   const cookies = parseCookies(request.headers.get("cookie"));
//   const cookieToken = cookies[CSRF_CONFIG.COOKIE_NAME] || cookies["csrf-token"]; // 後方互換
//   if (cookieToken && cookieToken === headerToken) return true;

//   // 2) 旧実装: セット登録トークン（generateCSRFToken / registerCSRFToken 経由）
//   if (csrfTokens.has(headerToken)) return true;

//   return false;
// }

// /**
//  * CSRFトークン生成
//  */
// export function generateCSRFToken(): string {
//   const token = crypto.randomUUID();
//   csrfTokens.add(token);

//   // 古いトークンのクリーンアップ（簡易実装）
//   if (csrfTokens.size > 1000) {
//     const tokens = Array.from(csrfTokens);
//     tokens.slice(0, 500).forEach(t => csrfTokens.delete(t));
//   }

//   return token;
// }

// /**
//  * クライアントIP取得
//  */
// function getClientIP(request: Request): string {
//   return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
//     request.headers.get("x-real-ip") ||
//     request.headers.get("cf-connecting-ip") ||
//     "unknown";
// }

// /**
//  * セキュリティミドルウェア
//  */
// export function securityMiddleware(request: Request, context: AppLoadContext) {
//   // IP制限チェック
//   if (!checkIPRestriction(request)) {
//     throw new Response("Forbidden", { status: 403 });
//   }

//   // レート制限チェック
//   if (!checkRateLimit(request)) {
//     throw new Response("Too Many Requests", {
//       status: 429,
//       headers: {
//         "Retry-After": "60",
//       },
//     });
//   }

//   // CSRF保護チェック
//   if (!checkCSRFProtection(request)) {
//     throw new Response("CSRF Token Invalid", { status: 403 });
//   }

//   return { request, context };
// }

// /**
//  * セキュリティログ出力
//  */
// export function logSecurityEvent(
//   event: string,
//   request: Request,
//   details?: Record<string, unknown>
// ) {
//   const logData = {
//     timestamp: new Date().toISOString(),
//     event,
//     ip: getClientIP(request),
//     userAgent: request.headers.get("user-agent"),
//     url: request.url,
//     method: request.method,
//     ...details,
//   };

//   if (process.env.NODE_ENV === "production") {
//     process.stderr.write(`SECURITY-EVENT: ${JSON.stringify(logData)}\n`);
//   } else {
//     console.warn("Security Event:", logData);
//   }
// }

// // //
// // const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
// // const appMode = import.meta.env.VITE_APP_MODE || "prod";
// // const selfOrigin = `http://localhost:${isDev ? (process.env.DEV_PORT || 5173) : (process.env.PORT || 3000)}`;

// // const allowOrigins = (process.env.CORS_ALLOW_ORIGINS || "")
// //   .split(",")
// //   .map(o => o.trim())
// //   .filter(o => o.length > 0);

// // if (allowOrigins.length === 0) {
// //   allowOrigins.push(selfOrigin);
// // }
// // const allowOriginsSet = new Set(allowOrigins);
// // const isAllowOriginAll = allowOriginsSet.has("*");

// // const SUSPICIOUS_PATH_PATTERN = /(\.\.|\/\/|%[0-9a-fA-F]{2})/;
