import { clone } from "../objects";

export function getArrayIndex(name: string) {
  return name.match(/^\[(\d*)\]$/);
};

export function getArrayIndexOrName(name: string) {
  const r = getArrayIndex(name);
  return r ? Number(r[1] || "NaN") : name;
};

export function splitName(name: string) {
  return name.split(/\.|(\[\d*\])/).filter(s => s);
};

export function getRelativeName(baseName: string, relativeName: string) {
  const relative = relativeName.match(/^(\.+)(.*)/);
  if (!relative) return relativeName;
  const name = relative[2];
  if (!name) return relativeName;
  const level = relative[1].length;
  const splittedName = splitName(baseName);
  let relativeBaseName = "";
  for (let i = 0, il = splittedName.length - level; i < il; i++) {
    if (relativeBaseName) relativeBaseName += ".";
    relativeBaseName += splittedName[i];
  };
  return `${relativeBaseName}.${name}`.replace(/^\.|\.(?=\[)/g, "");
};

type Item = {
  name: string;
  value: unknown;
};

export class SchemaData {

  private data: Record<string, unknown>;
  private callback: (params: { items: Array<Item>; }) => void;
  private bulkQueue: Array<Item> | null;

  constructor(
    data: typeof this.data | FormData | null | undefined,
    callback: typeof this.callback
  ) {
    if (data instanceof FormData) {
      this.data = {};
      for (const [k, v] of data.entries()) {
        const [exist, has] = this._get(k);
        if (!has) {
          this._set(k, v);
          continue;
        }
        if (Array.isArray(exist)) {
          exist.push(v);
        } else {
          this._set(k, [exist, v]);
        }
      }
    } else {
      this.data = clone(data) ?? {};
    }
    this.callback = callback;
    this.bulkQueue = null;
  };

  public _get<V>(
    name: string,
    relativeName?: string
  ): [vlaue: V | null | undefined, hasProperty: boolean] {
    let has = false;
    const names = splitName(relativeName ? getRelativeName(name, relativeName) : name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let v: any = this.data;
    for (const n of names) {
      if (v == null) return [undefined, false];
      const r = getArrayIndex(n);
      if (r) {
        let i = Number(r[1]);
        if (isNaN(i)) i = 0;
        has = i in v;
        v = v[i];
        continue;
      }
      has = n in v;
      v = v[n];
    }
    return [v, has];
  };

  public get<V>(name: string, relativeName?: string): V | null | undefined {
    return this._get<V>(name, relativeName)[0];
  };

  public hasValue(name: string, relativeName?: string): boolean {
    return this.get(name, relativeName) != null;
  }

  public hasProperty(name: string, relativeName?: string): boolean {
    return this._get(name, relativeName)[1];
  };

  public _set(name: string, value: unknown): boolean {
    let d = this.data, change = false;
    const names = splitName(name);
    for (let i = 0, il = names.length - 1; i < il; i++) {
      let n: string | number = names[i];
      const r = getArrayIndex(n);
      if (r) n = Number(r[1] || "NaN");
      if (d[n] == null) {
        d[n] = getArrayIndex(names[i + 1]) ? [] : {};
        change = true;
      }
      d = d[n] as Record<string | number, unknown>;
    }
    const n = names[names.length - 1];
    const r = getArrayIndex(n);
    if (r) {
      if (!Array.isArray(d)) throw new Error(`set value failed. object is no array. "${name}"`);
      const i = Number(r[1]);
      if (isNaN(i)) {
        d.push(value);
        return true;
      }
      change = !Object.is(d[i], value);
      d[i] = value;
    } else {
      change = !Object.is(d[n], value);
      d[n] = value;
    }
    return change;
  };

  public set(name: string, value: unknown): boolean {
    const change = this._set(name, value);
    if (change) this.effect([{ name, value }]);
    return change;
  };

  public bulkSet(items: Array<{ name: string; value: unknown; }>) {
    let change = false;
    const changeItems: typeof items = [];
    items.forEach(item => {
      const c = this._set(item.name, item.value);
      if (c) {
        changeItems.push(item);
        change = true;
      }
    });
    if (change) this.effect(changeItems);
    return change;
  };

  public bulkPush(name: string, value: unknown) {
    if (!this.bulkQueue) this.bulkQueue = [];
    this.bulkQueue.push({ name, value });
    return this;
  };

  public bulkExec() {
    if (!this.bulkQueue) return false;
    const ret = this.bulkSet(this.bulkQueue);
    this.bulkQueue = null;
    return ret;
  };

  public getBulkQueueLength() {
    return this.bulkQueue?.length ?? 0;
  };

  public hasBulkQueue() {
    return this.getBulkQueueLength() > 0;
  };

  private effect(items: Array<{ name: string; value: unknown; }>) {
    this.callback({ items });
  };

  public getData<T = Record<string, unknown>>() {
    return this.data as T;
  };

};
