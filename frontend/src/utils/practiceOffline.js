const DB_NAME = "pozospharma-practice-offline";
const DB_VERSION = 1;
const QUEUE_STORE = "interventionQueue";

function openPracticeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "clientRequestId" });
        store.createIndex("queuedAt", "queuedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runRequest(mode, operation) {
  return openPracticeDB().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, mode);
    const store = transaction.objectStore(QUEUE_STORE);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  }));
}

export function queueIntervention(intervention) {
  return runRequest("readwrite", (store) => store.put({
    ...intervention,
    queuedAt: Date.now(),
  }));
}

export function getQueuedInterventions() {
  return runRequest("readonly", (store) => store.getAll());
}

export function removeQueuedIntervention(clientRequestId) {
  return runRequest("readwrite", (store) => store.delete(clientRequestId));
}

export async function countQueuedInterventions() {
  return runRequest("readonly", (store) => store.count());
}
