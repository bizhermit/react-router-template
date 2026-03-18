/** 権限ポリシー キー一覧 */
const PERMISSION_POLICIES = [
  "geolocation",
  "microphone",
  "camera",
  "payment",
  "usb",
  "magnetometer",
  "gyroscope",
  "accelerometer",
  "fullscreen",
  "picture-in-picture",
  "autoplay",
  "encrypted-media",
  "midi",
  "push",
  "speaker-selection",
  "sync-xhr",
  "web-share",
] as const;

/** 権限ポリシー キー型 */
type PermissionPolicyKey = typeof PERMISSION_POLICIES[number];

/**
 * 権限ポリシーを作成する
 * @param params デフォルトを上書きするポリシー
 * @param noDefaut デフォルトを使用しない
 * @returns
 */
export function createPermissionPolicy(
  params: Partial<Record<PermissionPolicyKey, string | false>> = {},
  noDefaut: boolean = false
) {
  return (noDefaut ? [] : PERMISSION_POLICIES).map(key => {
    const v = params[key];
    if (v === false) return "";
    return `${key}=(${params[key] || ""})`;
  }).filter(Boolean).join(", ");
};
