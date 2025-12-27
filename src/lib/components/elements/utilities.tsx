export const ZERO_WIDTH_SPACE = "\u200B";

export function clsx(...cns: Array<string | boolean | number | bigint | null | undefined>) {
  return cns.filter(s => s).join(" ");
};

export function getColorClassName(color?: StyleColor) {
  switch (color) {
    case "primary": return "var-color-primary";
    case "secondary": return "var-color-secondary";
    case "sub": return "var-color-sub";
    case "danger": return "var-color-danger";
    default: return undefined;
  }
};
