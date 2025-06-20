export function clsx(...cns: Array<string | boolean | null | undefined>) {
  return cns.filter(s => s).join(" ");
};
