export function getCookiesImpl(cookie: string) {
  const ret: Record<string, string> = {};
  cookie.split(/;\s?/g).forEach(c => {
    const [n, v] = c.split("=");
    ret[n] = v;
  });
  return ret;
};

export function getCookieImpl(cookie: string, name: string) {
  const re = new RegExp(`^${encodeURIComponent(name)}=(.+)`);
  const v = cookie.split(/;\s?/g).find(c => c.match(re))?.split("=")[1];
  return v ? decodeURIComponent(v) : v;
};
