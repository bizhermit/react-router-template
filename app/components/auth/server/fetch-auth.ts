import { Auth } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import { authConfig } from "~/features/auth/config";

interface FetchAuthParams {
  request: Request;
  action: AuthAction;
  method?: "GET" | "POST";
};

const isDev = process.env.NODE_ENV === "development";
const selfOrigin = process.env.AUTH_URL || `http://localhost:${isDev ? (process.env.DEV_PORT || 5173) : (process.env.PORT || 3000)}`;

export async function fetchAuth<T>({
  request,
  action,
  method,
}: FetchAuthParams): Promise<T | null> {
  try {
    // const url = new URL(`/auth/${action}`, selfOrigin).toString();
    // const cookie = request.headers.get("cookie") || "";
    // // const res = await fetch(url, {
    // //   method: method || "GET",
    // //   headers: { cookie },
    // // });
    // console.log(cookie);
    // const req = new Request(url, {
    //   method: method || "GET",
    //   headers: { cookie },
    // });
    // const res = await (method === "POST" ? authAction : authLoader)(req);
    // if (!res.ok) return null;
    // return res.json().catch(() => null) as T | null;
    // 元のリクエストのURLを/auth/{action}に変更
    const url = new URL(request.url);
    url.pathname = `/auth/${action}`;

    const req = new Request(url.toString(), {
      method: method || request.method,
      headers: request.headers,
      body: method === "POST" && request.body ? request.body : undefined,
    });

    const res = await (method === "POST" ? authAction : authLoader)(req);
    console.log(res);
    if (!res.ok) return null;
    return res.json().catch(() => null) as T | null;
  } catch {
    return null;
  }
};

export async function authLoader(request: Request) {
  return Auth(request, authConfig);
};

export async function authAction(request: Request) {
  console.warn("//////////////////// action", {
    url: request.url,
    method: request.method,
    pathname: new URL(request.url).pathname,
    hasBody: request.body !== null,
    contentType: request.headers.get("content-type"),
  });
  return Auth(request, authConfig);
};
