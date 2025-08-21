import { Auth } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import { authConfig } from "~/auth/server/config";
import { convertStructToFormData } from "~/components/objects/form-data";

interface FetchAuthParams {
  request: Request;
  action: AuthAction | `callback/${string}`;
  method?: "GET" | "POST";
};

export async function fetchAuth({
  request,
  action,
  method = "GET",
}: FetchAuthParams) {
  try {
    const url = new URL(request.url);
    url.pathname = `/auth/${action}`;

    const origContentType = request.headers.get("Content-Type") || "";
    const lowerCT = origContentType.toLowerCase();
    const isUrlEncoded = lowerCT.startsWith("application/x-www-form-urlencoded");
    const isJson = lowerCT.startsWith("application/json");

    const formData = await (async () => {
      if (method === "GET") return undefined;
      if (isJson) {
        return convertStructToFormData(await request.json());
      }
      return await request.formData();
    })();

    const headers = new Headers(request.headers);
    headers.set("Origin", url.origin);

    // CSRF
    const csrfToken =
      request.headers.get("x-csrf-token")
      || (formData?.get("csrfToken") as string)
      || (formData?.get("csrf-token") as string);
    if (csrfToken && formData) {
      formData.set("csrfToken", csrfToken);
    }

    // Body
    let body: BodyInit | undefined;
    if (method !== "GET") {
      if (formData) {
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
