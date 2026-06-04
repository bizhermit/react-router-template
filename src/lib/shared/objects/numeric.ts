/**
 * 数値変換
 * @param value
 * @returns
 */
export function parseNumber(value: unknown): [number: number | null | undefined, succeeded: boolean] {
  if (value == null) return [value, true];
  if (value === "") return [null, true];
  if (typeof value === "number") {
    if (isNaN(value)) return [undefined, false];
    return [value, true];
  }
  const str = String(value).trim();
  if (str === "") return [undefined, false];
  const num = Number(str.replace(/[０-９，．＋－ー]/g, s => {
    switch (s) {
      case "，": return ",";
      case "．": return ".";
      case "＋": return "+";
      case "ー":
      case "－":
        return "-";
      default:
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }
  }).replace(/,/g, ""));
  if (num == null || isNaN(num)) return [undefined, false];
  return [num, true];
};
