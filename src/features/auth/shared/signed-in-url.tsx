/**
 * サインインへリダイレクトするURLを取得する
 * - クエリパラメータにリダイレクト先のURLを設定する
 * @param url
 * @returns
 */
export function getSignedInUrl(url: string) {
  const redirectTo = new URL(url).searchParams.get("to");
  if (redirectTo) return decodeURIComponent(redirectTo);
  return "/home";
};
