export const ZERO_WIDTH_SPACE = "\u200B";

export function clsx(...cns: Array<string | boolean | number | bigint | null | undefined>) {
  return cns.filter(s => s).join(" ");
};
