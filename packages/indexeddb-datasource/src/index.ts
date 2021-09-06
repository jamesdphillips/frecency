import { visit, init } from "@frecency/core";

const dbversion = 1;
const dbstore = "frecency";
const scoreidx = "scores";

const defaultHalflife = 2.592e9; // 7 days

interface Datasource<T extends string> {
  list(path: string): Promise<T[]>;
  clear(path: string): Promise<void>;
  visit(path: string, key: T, hl?: number): Promise<void>;
}

interface Record {
  hl: number;
  score: number;
  key: string;
  path: string;
}

//
// TODO:
//
// - [ ] should we validate the keys? should we only allow lowercase?
// - [ ] max list size?
//

export const initDB = (dbname: string): Datasource<string> => {
  const open = async () => {
    let db: IDBDatabase;
    if (db === undefined) {
      db = await openDB(dbname);
    }
    return db;
  };

  return Object.freeze({
    list: async (path) => {
      const db = await open();
      const store = db.transaction(dbstore).objectStore(dbstore);
      const range = IDBKeyRange.bound(
        [path, Number.MIN_SAFE_INTEGER],
        [path, Number.MAX_SAFE_INTEGER],
      );

      return new Promise((resolve, reject) => {
        const request = store.index(scoreidx).openKeyCursor(range, "prev");
        const results: string[] = [];
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            results.push(cursor.primaryKey[0]);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    },
    clear: async (path) => {
      const db = await open();
      const store = db.transaction(dbstore, "readwrite").objectStore(dbstore);
      const range = (upper = false) => {
        const [min, max] = ["a", "z"].map((v) =>
          upper ? v.toUpperCase() : v.toLowerCase(),
        );
        return IDBKeyRange.bound([min, path], [max, path]);
      };

      // TODO: parallel?
      return clear(store, range()).then(() => clear(store, range(true)));
    },
    visit: async (path, key, hl = defaultHalflife) => {
      const db = await open();
      const store = db.transaction(dbstore, "readwrite").objectStore(dbstore);

      let record = await getItem<Record>(store, path, key);
      if (record === undefined) {
        record = {
          key,
          path,
          ...init(now(), hl),
        };
      } else {
        record = {
          ...record,
          ...visit(now(), record),
        };
      }

      return putItem(store, record);
    },
  });
};

const now = () => new Date().getTime();

const clear = <T>(
  store: IDBObjectStore,
  key: IDBValidKey | IDBKeyRange,
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const getItem = <T>(
  store: IDBObjectStore,
  path: string,
  key: string,
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    const request = store.get([key, path]);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const putItem = (store: IDBObjectStore, record: Record): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = store.put(record);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const openDB = (dbname: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbname, dbversion);
    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      reject(req.error);
    };
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      if (ev.oldVersion === 0) {
        const objStore = db.createObjectStore(dbstore, {
          keyPath: ["key", "path"],
          autoIncrement: false,
        });
        objStore.createIndex("scores", ["path", "score"], { unique: false });
      }
    };
  });
};
