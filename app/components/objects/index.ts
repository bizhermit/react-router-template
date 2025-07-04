type ObjectType =
  | "Null"
  | "Undefined"
  | "String"
  | "Number"
  | "BigInt"
  | "Boolean"
  | "Date"
  | "Array"
  | "Object"
  | "Map"
  | "Set"
  | "RegExp";

export function getObjectType(o: unknown) {
  return toString.call(o).slice(8, -1) as ObjectType;
};

export function clone<T>(o: T): T {
  if (o == null || typeof o !== "object") return o;
  switch (getObjectType(o)) {
    case "Array":
      return (o as Array<unknown>).map(v => clone(v)) as T;
    case "Object": {
      const r: Record<string | number | symbol, unknown> = {};
      Object.entries(o).forEach(([k, v]) => r[k] = clone(v));
      return r as T;
    }
    case "Date":
      return new Date((o as unknown as Date).getTime()) as T;
    case "Map":
      return new Map([...o as unknown as Map<unknown, unknown>].map(v => [clone(v[0]), clone(v[1])])) as T;
    case "Set":
      return new Set([...o as unknown as Set<unknown>].map(v => clone(v))) as T;
    case "RegExp":
      return RegExp((o as unknown as RegExp).source, (o as unknown as RegExp).flags) as T;
    default: return o;
  }
};

export function isEmpty(o: unknown | null | undefined) {
  if (o == null) return true;
  const t = typeof o;
  if (t === "string") return o === "";
  if (t !== "object") return false;
  switch (getObjectType(o)) {
    case "Array":
      return (o as Array<unknown>).length === 0;
    case "Object":
      return Object.keys(o as Record<string | number | symbol, unknown>).length === 0;
    case "Map":
      return (o as unknown as Map<unknown, unknown>).size === 0;
    case "Set":
      return (o as unknown as Set<unknown>).size === 0;
    default: return false;
  }
};

export function equals(v1: unknown, v2: unknown) {
  if (v1 == null && v2 == null) return true;
  return v1 === v2;
};
