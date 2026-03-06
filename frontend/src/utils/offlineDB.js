const DB_NAME = 'pozospharma-offline';
const DB_VERSION = 1;
const STORE_NAME = 'drugs';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('generic_name', 'generic_name', { unique: false });
        store.createIndex('brand_names', 'brand_names', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheDrugs(drugs) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  for (const drug of drugs) {
    store.put(drug);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

export async function searchOfflineDrugs(query) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const q = query.toLowerCase();
  return all.filter(d =>
    d.generic_name.toLowerCase().includes(q) ||
    (d.brand_names || '').toLowerCase().includes(q) ||
    (d.drug_class || '').toLowerCase().includes(q) ||
    (d.uses || '').toLowerCase().includes(q)
  ).slice(0, 20);
}

export async function getDrugCount() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
