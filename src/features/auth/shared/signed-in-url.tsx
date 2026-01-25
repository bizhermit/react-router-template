export function getSignedInUrl(url: string) {
  const redirectTo = new URL(url).searchParams.get("to");
  if (redirectTo) return decodeURIComponent(redirectTo);
  return "/home";
};
