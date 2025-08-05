# セキュリティミドルウェア使用ガイド

## 📋 概要

`middleware.ts` はReact Routerアプリケーション用のセキュリティミドルウェアです。IP制限、レート制限、CSRF保護などの機能を提供します。

## 🚀 基本的な使用方法

### 1. 全てのセキュリティチェックを実行（推奨）

```typescript
import { securityMiddleware } from "~/components/security/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  // すべてのセキュリティチェックを一度に実行
  securityMiddleware(request, context);
  
  // 正常処理
  return Response.json({ data: "success" });
}
```

### 2. 個別のセキュリティチェック

```typescript
import { 
  checkIPRestriction, 
  checkRateLimit, 
  checkCSRFProtection 
} from "~/components/security/middleware";

export async function action({ request, context }: Route.ActionArgs) {
  // IP制限のみチェック
  if (!checkIPRestriction(request)) {
    throw new Response("Forbidden", { status: 403 });
  }
  
  // レート制限のみチェック
  if (!checkRateLimit(request)) {
    throw new Response("Too Many Requests", { status: 429 });
  }
  
  // 処理続行
  return Response.json({ success: true });
}
```

## 🔧 設定

設定は `~/config/security.ts` で管理されています：

```typescript
export const RATE_LIMIT_CONFIG = {
  API_CALLS_PER_MINUTE: 100,
  LOGIN_ATTEMPTS_LIMIT: 5,
  LOGIN_LOCK_DURATION_MINUTES: 15,
};

export const IP_RESTRICTION_CONFIG = {
  ADMIN_ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS?.split(",") || [],
  BLOCKED_IPS: process.env.BLOCKED_IPS?.split(",") || [],
};

export const CSRF_CONFIG = {
  ENABLED: true,
  COOKIE_NAME: "_csrf",
  HEADER_NAME: "x-csrf-token",
  EXCLUDE_PATHS: ["/health", "/csp-report"],
};
```

## 📊 使用パターン

### APIエンドポイント
```typescript
export async function apiAction({ request, context }: Route.ActionArgs) {
  try {
    securityMiddleware(request, context);
    
    const body = await request.json();
    // API処理...
    
    return Response.json(result);
  } catch (error) {
    if (error instanceof Response) {
      return error; // セキュリティエラーをそのまま返す
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

### 管理者専用エンドポイント
```typescript
export async function adminLoader({ request, context }: Route.LoaderArgs) {
  securityMiddleware(request, context);
  
  // 追加の管理者権限チェック
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    logSecurityEvent("ADMIN_ACCESS_DENIED", request);
    throw new Response("Admin access required", { status: 403 });
  }
  
  return Response.json(adminData);
}
```

### ファイルアップロード
```typescript
export async function uploadAction({ request, context }: Route.ActionArgs) {
  securityMiddleware(request, context);
  
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  // ファイルサイズ・タイプチェック
  if (file.size > 10 * 1024 * 1024) {
    logSecurityEvent("FILE_SIZE_EXCEEDED", request, { size: file.size });
    throw new Response("File too large", { status: 413 });
  }
  
  return Response.json({ success: true });
}
```

## 📝 ログ機能

セキュリティイベントは自動的にログに記録されます：

```typescript
import { logSecurityEvent } from "~/components/security/middleware";

// カスタムセキュリティログ
logSecurityEvent("CUSTOM_EVENT", request, {
  userId: user.id,
  action: "sensitive_operation"
});
```

## 🔐 CSRF保護

CSRFトークンの生成と検証：

```typescript
import { generateCSRFToken } from "~/components/security/middleware";

// CSRFトークン生成エンドポイント
export async function csrfTokenLoader({ request, context }: Route.LoaderArgs) {
  const token = generateCSRFToken();
  return Response.json({ csrfToken: token });
}
```

フロントエンドでの使用：
```typescript
// CSRFトークンを取得
const response = await fetch("/api/csrf-token");
const { csrfToken } = await response.json();

// リクエストヘッダーに追加
fetch("/api/protected", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": csrfToken,
  },
  body: JSON.stringify(data),
});
```

## ⚙️ 環境変数設定

```bash
# IP制限設定
ADMIN_ALLOWED_IPS=192.168.1.100,192.168.1.101
BLOCKED_IPS=192.168.1.200,192.168.1.201

# その他のセキュリティ設定
SESSION_SECRET=your-secret-key-here
LOG_LEVEL=info
```

## 🚨 エラーハンドリング

セキュリティミドルウェアは以下のHTTPステータスコードを返します：

- `403 Forbidden`: IP制限違反、CSRF保護違反
- `429 Too Many Requests`: レート制限超過

```typescript
try {
  securityMiddleware(request, context);
} catch (error) {
  if (error instanceof Response) {
    // セキュリティエラーの詳細ログ
    logSecurityEvent("SECURITY_VIOLATION", request, {
      status: error.status,
      statusText: error.statusText,
    });
    return error;
  }
}
```

## 🔍 カスタマイズ

独自のセキュリティチェックを追加：

```typescript
function customSecurityCheck(request: Request): boolean {
  // カスタムロジック
  return true;
}

export async function protectedLoader({ request, context }: Route.LoaderArgs) {
  securityMiddleware(request, context);
  
  if (!customSecurityCheck(request)) {
    logSecurityEvent("CUSTOM_SECURITY_VIOLATION", request);
    throw new Response("Custom security check failed", { status: 403 });
  }
  
  return Response.json({ data: "protected" });
}
```
