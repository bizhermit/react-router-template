import { AUTH_PROP_NAME } from "../consts";
import type { AuthPayloadProps } from "../types";

declare global {
  interface Window {
    [AUTH_PROP_NAME]?: AuthPayloadProps;
  }
}

export async function loadAuthAsClient() {
  const auth = window[AUTH_PROP_NAME];
  if (auth) {
    document.getElementById(AUTH_PROP_NAME)?.remove();
    delete window[AUTH_PROP_NAME];
    return auth;
  }
  return await getAuthPayloadAsClient();
};

export async function getAuthPayloadAsClient(): Promise<AuthPayloadProps> {
  try {
    const res = await fetch("/auth/session");
    if (!res.ok) {
      throw new Error(`Failed to fetch auth session: ${res.status}|${res.statusText}`);
    }
    const auth = await res.json();
    return auth;
  } catch (e) {
    console.error(e);
    return {
      csrfToken: undefined,
      session: null,
    };
  }
};
