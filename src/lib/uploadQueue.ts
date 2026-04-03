const DB_NAME = "bi-upload-queue";
const STORE_NAME = "uploads";

interface QueuedUpload {
  id?: number;
  url: string;
  formData: FormData;
}

function toPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueUpload(payload: QueuedUpload) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add(payload);
  await txDone(tx);
}

export async function processQueue() {
  const db = await openDB();
  const readTx = db.transaction(STORE_NAME, "readonly");
  const store = readTx.objectStore(STORE_NAME);
  const all = await toPromise(store.getAll() as IDBRequest<QueuedUpload[]>);
  await txDone(readTx);

  for (const item of all) {
    try {
      const response = await fetch(item.url, {
        method: "POST",
        body: item.formData,
        credentials: "include"
      });

      if (!response.ok) {
        continue;
      }

      if (item.id == null) {
        continue;
      }

      const deleteTx = db.transaction(STORE_NAME, "readwrite");
      deleteTx.objectStore(STORE_NAME).delete(item.id);
      await txDone(deleteTx);
    } catch {
      // keep queued
    }
  }
}
