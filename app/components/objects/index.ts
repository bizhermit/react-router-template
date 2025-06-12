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

export function getObjectType(o: any) {
  return toString.call(o).slice(8, -1) as ObjectType;
};

export function clone<T = any,>(o: T): T {
  if (o == null || typeof o !== "object") return o;
  switch (getObjectType(o)) {
    case "Array":
      return (o as Array<any>).map(v => clone(v)) as T;
    case "Object":
      const r: { [v: string | number | symbol]: any } = {};
      Object.entries(o).forEach(([k, v]) => r[k] = clone(v));
      return r as T;
    case "Date":
      return new Date((o as unknown as Date).getTime()) as T;
    case "Map":
      return new Map([...o as any].map(v => [clone(v[0]), clone(v[1])])) as T;
    case "Set":
      return new Set([...o as any].map(v => clone(v))) as T;
    case "RegExp":
      return RegExp((o as unknown as RegExp).source, (o as unknown as RegExp).flags) as T;
    default: return o;
  }
};

export function isEmpty(o: any | null | undefined) {
  if (o == null) return true;
  const t = typeof o;
  if (t === "string") return o === "";
  if (t !== "object") return false;
  switch (getObjectType(o)) {
    case "Array":
      return (o as Array<any>).length === 0;
    case "Object":
      return Object.keys(o as { [v: string | number | symbol]: any }).length === 0;
    case "Map":
      return (o as unknown as Map<any, any>).size === 0;
    case "Set":
      return (o as unknown as Set<any>).size === 0;
    default: return false;
  }
};

export function equals(v1: unknown, v2: unknown) {
  if (v1 == null && v2 == null) return true;
  return v1 === v2;
};
