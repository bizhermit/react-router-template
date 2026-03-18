/**
 * Cookie文字列をオブジェクトに変換する
 * @param cookie
 * @returns
 */
export function getCookiesImpl(cookie: string) {
  const ret: Record<string, string> = {};
  cookie.split(/;\s?/g).forEach(c => {
    const [n, v] = c.split("=");
    if (n && v) { // null/undefined チェック追加
      ret[decodeURIComponent(n)] = decodeURIComponent(v);
    }
  });
  return ret;
};

/**
 * Cookie文字列から値を取得する
 * @param cookie
 * @param name
 * @returns
 */
export function getCookieImpl(cookie: string, name: string) {
  const safeName = encodeURIComponent(name);
  const re = new RegExp(`(^|;\\s?)${safeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`);
  const match = cookie.match(re);
  return match ? decodeURIComponent(match[2]) : undefined;
};
