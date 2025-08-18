import { Auth } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import { authConfig } from "~/features/auth/config";

interface FetchAuthParams {
  request: Request;
  action: AuthAction;
  method?: "GET" | "POST";
};

export async function fetchAuth<T>({
  request,
  action,
  method,
}: FetchAuthParams): Promise<T | null> {
  try {
    const url = new URL(request.url);
    url.pathname = `/auth/${action}`;

    const req = new Request(url.toString(), {
      method: method || request.method,
      headers: request.headers,
      body: method === "POST" && request.body ? request.body : undefined,
      // @ts-expect-error: duplex is required for Node.js 18+ when sending a body
      duplex: "half",
    });

    const res = await (method === "POST" ? authAction : authLoader)(req);
    // console.log("-------------", action);
    // console.log(res);
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
