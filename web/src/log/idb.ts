// Минимальное key-value хранилище в IndexedDB: FileSystemFileHandle
// нельзя положить в localStorage, а в IndexedDB он сохраняется.

const DB_NAME = "exile-focus";
const STORE = "kv";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const idbGet = <T>(key: string) =>
  run<T | undefined>("readonly", (s) => s.get(key));
export const idbSet = (key: string, value: unknown) =>
  run<void>("readwrite", (s) => s.put(value, key));
export const idbDelete = (key: string) =>
  run<void>("readwrite", (s) => s.delete(key));
