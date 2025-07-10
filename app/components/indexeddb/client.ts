/* eslint-disable @typescript-eslint/no-explicit-any */

interface IndexedDBProps {
  name: string;
  version?: number;
  upgrade: (params: {
    db: IDBDatabase;
    oldVersion: number;
    newVersion: number | null;
  }) => Promise<void>;
};

type AnyStore = {
  key?: string | string[];
  data: { [C: string]: unknown; };
};

type AnyStores = { [Store: string]: AnyStore; };

export type IndexedDBStores<S extends AnyStores> = S;

export interface IndexedDBController<S extends AnyStores> {
  db: IDBDatabase;
  trans: <Store extends keyof S, R>(
    parmas: {
      storeNames: Store | Iterable<Store>;
      mode?: IDBTransactionMode;
      options?: IDBTransactionOptions;
    },
    process: (stores: { [K in Store]: IndexedDBStoreController<S[K]>; }) => Promise<R>
  ) => Promise<R>;
};

type AutoIncrementKey = number;
type StoreKeyType<S extends AnyStore> = S extends { key: infer K; } ? (
  K extends string[] ? { [PK in keyof K]: K[PK] extends string ? S["data"][K[PK]] : never } :
  K extends string ? S["data"][K] :
  never
) : AutoIncrementKey;

export interface IndexedDBStoreController<S extends AnyStore> {
  existKey: (key: StoreKeyType<S>) => Promise<boolean>;
  getByKey: (key: StoreKeyType<S>) => Promise<(S["data"] | null)>;
  deleteByKey: (key: StoreKeyType<S>) => Promise<boolean>;
  select: (query: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection) => Promise<Array<S["data"]> | null>;
  insert: (value: S["data"]) => Promise<StoreKeyType<S>>;
  update: (value: S["data"]) => Promise<StoreKeyType<S>>;
  upsert: (value: S["data"]) => Promise<{ action: "insert" | "update"; key: StoreKeyType<S>; }>;
};

export default async function getIndexedDB<
  T extends AnyStores = AnyStores
>(props: IndexedDBProps) {
  return await new Promise<IndexedDBController<T>>((resolve, reject) => {
    const request = indexedDB.open(props.name, props.version ?? 1);

    request.onerror = (event) => {
      reject(event);
    };

    request.onblocked = () => {
      alert("DataBase has new version. Please close all tabs.");
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      props.upgrade({
        db,
        oldVersion: event.oldVersion,
        newVersion: event.newVersion,
      }).then(() => {
        ready(db);
      }).catch((e) => {
        reject(e);
      });
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      ready(db);
    };

    request.onblocked = () => {
      console.warn(`IndexedDB blocked.`);
    };

    function ready(db: IDBDatabase) {
      db.onversionchange = () => {
        db.close();
        alert("Update DataBase.");
        window.location.reload();
      };

      resolve({
        db,
        trans: async (params, process) => {
          const storeNames = typeof params.storeNames === "string" ? [params.storeNames] : (params.storeNames as string[]);
          const trans = db.transaction(
            storeNames,
            params.mode,
            params.options
          );

          const stores = {} as Record<keyof T, IndexedDBStoreController<any>>;
          storeNames.forEach(storeName => {
            const store = trans.objectStore(storeName);
            type KeyType = StoreKeyType<T[keyof T]>;

            function getByKey(key: number) {
              return new Promise<any>((resolve) => {
                const req = store.get(key);
                req.onerror = () => resolve(null);
                req.onsuccess = () => {
                  resolve(req.result);
                };
              });
            };

            async function existKey(key: number) {
              const value = await getByKey(key);
              return value != null;
            };

            stores[storeName as keyof T] = {
              existKey,
              getByKey,
              deleteByKey: (key) => {
                return new Promise((resolve) => {
                  const req = store.delete(key);
                  req.onerror = () => resolve(false);
                  req.onsuccess = () => resolve(true);
                });
              },
              select: (query, dir) => {
                return new Promise((resolve) => {
                  const ret: any[] = [];
                  const req = store.openCursor(query, dir);
                  req.onerror = () => resolve(null);
                  req.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                      ret.push(cursor.value);
                      cursor.continue();
                    } else {
                      resolve(ret);
                    }
                  };
                });
              },
              insert: (value) => {
                return new Promise((resolve, reject) => {
                  const req = store.add(value);
                  req.onerror = (event) => reject(event);
                  req.onsuccess = (event) => {
                    const key = (event.target as IDBRequest<KeyType>).result;
                    resolve(key);
                  };
                });
              },
              update: (value) => {
                return new Promise((resolve, reject) => {
                  const req = store.put(value);
                  req.onerror = (event) => reject(event);
                  req.onsuccess = (event) => {
                    const key = (event.target as IDBRequest<KeyType>).result;
                    resolve(key);
                  };
                });
              },
              upsert: (value) => {
                return new Promise((resolve, reject) => {
                  if (!store.keyPath) {
                    reject(`${storeName} has no keyPath`);
                    return;
                  }
                  const keyValue = (() => {
                    if (!store.keyPath) return null;
                    if (Array.isArray(store.keyPath)) {
                      return store.keyPath.map(key => {
                        return value[key];
                      });
                    }
                    return value[store.keyPath];
                  })();
                  if (keyValue == null) {
                    reject(`Cannot extract key from value using keyPath: ${store.keyPath}`);
                    return;
                  }
                  existKey(keyValue).then((isExist) => {
                    const upsertReq = isExist ? store.put(value) : store.add(value);
                    upsertReq.onerror = (event) => reject(event);
                    upsertReq.onsuccess = (event) => {
                      const key = (event.target as IDBRequest<KeyType>).result;
                      resolve({
                        action: isExist ? "update" : "insert",
                        key,
                      });
                    };
                  });
                });
              },
            };
          });

          return process(stores);
        },
      });
    };
  });
};
