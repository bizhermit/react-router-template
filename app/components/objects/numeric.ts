export function parseNumber(value: unknown): [number: number | undefined, succeeded: boolean] {
  if (value == null || value === "") return [undefined, true];
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
  }));
  if (num == null || isNaN(num)) return [undefined, false];
  return [num, true];
};
