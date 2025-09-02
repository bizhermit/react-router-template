import { Auth } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import { authConfig } from "~/auth/server/config";
import { AUTH_COOKIE_NAMES } from "../consts";

interface FetchAuthParams {
  request: Request;
  action: AuthAction | `callback/${string}`;
  method?: "GET" | "POST";
  csrfToken?: string | undefined;
  csrfTokenWithHash?: string | undefined;
};

const csrfTokenRegExp = new RegExp(`(;\\s)?${AUTH_COOKIE_NAMES.csrfToken}=[^;]*`);

export async function fetchAuth({
  request,
  action,
  method = "GET",
  csrfToken,
  csrfTokenWithHash,
}: FetchAuthParams) {
  try {
    const url = new URL(request.url);
    url.pathname = `/auth/${action}`;

    const originContentType = request.headers.get("Content-Type") || "";
    const lowerCT = originContentType.toLowerCase();
    const isUrlEncoded = lowerCT.startsWith("application/x-www-form-urlencoded");
    const isJson = lowerCT.startsWith("application/json");

    const headers = new Headers(request.headers);
    headers.set("Origin", url.origin);

    if (csrfTokenWithHash) {
      // セッション管理のcsrfTokenを使用する
      let cookie = headers.get("cookie") || "";
      cookie = cookie.replace(csrfTokenRegExp, "");
      if (cookie) cookie += "; ";
      cookie += `${AUTH_COOKIE_NAMES.csrfToken}=${csrfTokenWithHash}`;
      headers.set("cookie", cookie);
    }

    const formData = await (async () => {
      if (method === "GET") return undefined;
      if (isJson) {
        const jsonData = await request.json();
        if (csrfToken) jsonData.csrfToken = csrfToken;
        return jsonData;
      }
      const formData = await request.formData();
      if (csrfToken) formData.set("csrfToken", csrfToken);
      return formData;
    })();

    // Body
    let body: BodyInit | undefined;
    if (method !== "GET") {
      if (formData instanceof FormData) {
        if (isUrlEncoded) {
          const usp = new URLSearchParams();
          for (const [k, v] of formData.entries()) {
            if (typeof v === "string") usp.append(k, v);
            else usp.append(k, v.name);
          }
          body = usp.toString();
          headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        } else {
          body = formData;
          if (isUrlEncoded) headers.delete("Content-Type"); // NOTE: fetchに判定させる
        }
      } else {
        if (formData) {
          headers.set("Content-Type", "application/json;charset=UTF-8");
          body = JSON.stringify(formData);
        }
      }
      headers.delete("Content-Length"); // NOTE: 再計算させる
    }

    const req = new Request(url.toString(), {
      method,
      headers,
      body: body,
    });

    return (method === "POST" ? authAction : authLoader)(req);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export async function authLoader(request: Request) {
  return Auth(request, authConfig);
};

export async function authAction(request: Request) {
  return Auth(request, authConfig);
};
