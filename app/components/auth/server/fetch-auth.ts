import { Auth } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import { convertStructToFormData } from "~/components/objects/form-data";
import { authConfig } from "~/features/auth/config";

interface FetchAuthParams {
  request: Request;
  action: AuthAction;
  method?: "GET" | "POST";
};

export async function fetchAuth<T>({
  request,
  action,
  method = "GET",
}: FetchAuthParams): Promise<T | null> {
  try {
    const url = new URL(request.url);
    url.pathname = `/auth/${action}`;

    const formData = await (async () => {
      if (method === "GET") return undefined;
      const contentType = request.headers.get("Content-Type") || "";
      return /application\/json/.test(contentType)
        ? convertStructToFormData(await request.json())
        : await request.formData();
    })();

    const headers = new Headers(request.headers);
    headers.set("Origin", url.origin);

    const req = new Request(url.toString(), {
      method,
      headers,
      body: formData,
    });

    const res = await (method === "POST" ? authAction : authLoader)(req);
    if (!res.ok) return null;
    return res.json().catch(() => null) as T | null;
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
