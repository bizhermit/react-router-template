/* eslint-disable @typescript-eslint/no-explicit-any */

interface IndexedDBProps {
  name: string;
  version?: number;
  upgrade: (params: {
    db: IDBDatabase;
    oldVersin: number;
    newVersion: number | null;
  }) => Promise<void>;
};

type AnyStore = {
  key: string;
  columns: { [C: string]: unknown; };
};

type AnyStores = { [Store: string]: AnyStore; };

interface IndexedDBController<S extends AnyStores> {
  db: IDBDatabase;
  trans: <Store extends keyof S, R>(
    parmas: {
      storeNames: Store | Iterable<Store>;
      mode?: IDBTransactionMode;
      options?: IDBTransactionOptions;
    },
    process: (params: {
      stores: { [K in Store]: IndexedDBStoreController<S[K]>; };
    }) => Promise<R>
  ) => Promise<R>;
};

type StoreKeyType<S extends AnyStore> = S["columns"][S["key"]];

interface IndexedDBStoreController<S extends AnyStore> {
  getByKey: (key: StoreKeyType<S>) => Promise<(S["columns"] | null)>;
  deleteByKey: (key: StoreKeyType<S>) => Promise<boolean>;
  select: (query: any, direction?: IDBCursorDirection) => Promise<Array<S["columns"]> | null>;
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
        oldVersin: event.oldVersion,
        newVersion: event.newVersion,
      });
      ready(db);
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

      const trans = db.transaction(["hoge", "fuga"], "readwrite", {});
      trans.objectStore("hoge");

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
            stores[storeName as keyof T] = {
              getByKey: (key) => {
                return new Promise<any>((resolve) => {
                  const req = store.get(key);
                  req.onerror = () => resolve(null);
                  req.onsuccess = () => {
                    resolve(req.result);
                  };
                });
              },
              deleteByKey: (key) => {
                return new Promise<boolean>((resolve) => {
                  const req = store.delete(key);
                  req.onerror = () => resolve(false);
                  req.onsuccess = () => resolve(true);
                });
              },
              select: (query, dir) => {
                return new Promise<any[] | null>((resolve) => {
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
            };
          });

          return process({
            stores,
          });
        },
      });
    };
  });
};
