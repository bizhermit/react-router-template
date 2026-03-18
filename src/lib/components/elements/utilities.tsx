export const ZERO_WIDTH_SPACE = "\u200B";

/**
 * クラス名結合
 * - Falsyを除去して文字列結合する
 * @param cns クラス名配列
 * @returns
 */
export function clsx(...cns: Array<string | boolean | number | bigint | null | undefined>) {
  return cns.filter(s => s).join(" ");
};

/**
 * 配色クラス名取得
 * @param color {@link StyleColor}
 * @returns
 */
export function getColorClassName(color?: StyleColor) {
  switch (color) {
    case "primary": return "var-color-primary";
    case "secondary": return "var-color-secondary";
    case "mute": return "var-color-mute";
    case "danger": return "var-color-danger";
    default: return undefined;
  }
};
