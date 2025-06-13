export function getLength(str: string | null | undefined) {
  return str == null ? 0 : Array.from(str).length;
};
