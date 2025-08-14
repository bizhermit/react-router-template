type ContentSecurityPolicy = {
  "default-src": string | boolean;
  "script-src": string | boolean;
  "style-src": string | boolean;
  "img-src": string | boolean;
  "font-src": string | boolean;
  "connect-src": string | boolean;
  "media-src": string | boolean;
  "worker-src": string | boolean;
  "child-src": string | boolean;
  "object-src": string | boolean;
  "frame-src": string | boolean;
  "frame-ancestors": string | boolean;
  "base-uri": string | boolean;
  "form-action": string | boolean;
  "manifest-src": string | boolean;
  "report-uri": string | boolean;
  "report-to": string | boolean;
  "upgrade-insecure-requests": boolean;
  "block-all-mixed-content": boolean;
};

type ContentSecurityPolicyKey = keyof ContentSecurityPolicy;

export function createContentSecurityPolicy(params?: {
  policies?: Partial<Record<ContentSecurityPolicyKey, string | boolean>>;
  isDev?: boolean;
}) {
  function getCspDirective(key: ContentSecurityPolicyKey, defaultValue: string | boolean) {
    const value = params?.policies?.[key];
    if (value == null) {
      if (defaultValue === false) return "";
      if (defaultValue === true) return key;
      return `${key} ${defaultValue}`;
    }
    if (value === false) return "";
    if (value === true) return key;
    return `${key} ${value}`;
  };

  const csp = [
    getCspDirective("default-src", "'self'"),
    getCspDirective("script-src", params?.isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"),
    getCspDirective("style-src", params?.isDev ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline'"),
    getCspDirective("img-src", params?.isDev ? "'self' data: blob: https: http:" : "'self' data: blob: https:"),
    getCspDirective("font-src", params?.isDev ? "'self' data: https: http:" : "'self' data: https:"),
    getCspDirective("connect-src", params?.isDev ? "'self' http: https: ws: wss: blob: data:" : "'self' https: ws: wss: blob: data:"),
    getCspDirective("media-src", "'self' blob: data:"),
    getCspDirective("worker-src", "'self' blob:"),
    getCspDirective("child-src", "'self'"),
    getCspDirective("object-src", "'none'"),
    getCspDirective("frame-src", "'self'"),
    getCspDirective("frame-ancestors", "'none'"),
    getCspDirective("base-uri", "'self'"),
    getCspDirective("form-action", "'self'"),
    getCspDirective("manifest-src", "'self'"),
  ];
  if (!params?.isDev) {
    csp.push(
      getCspDirective("report-uri", "/csp-report"),
      getCspDirective("report-to", "csp-endpoint"),
      getCspDirective("upgrade-insecure-requests", true),
      getCspDirective("block-all-mixed-content", true),
    );
  }
  return csp.filter(Boolean).join("; ");
};
