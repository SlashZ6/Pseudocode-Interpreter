const DB_NAME = 'PseudocodeInterpreterDB';
const DB_VERSION = 1;
const STORE_NAME = 'codeStore';
const CODE_KEY = 'lastSessionCode';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject('Error opening IndexedDB');
        dbPromise = null; // Reset promise on error
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}

export async function saveCode(code: string): Promise<void> {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(code, CODE_KEY);
    
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
            console.error('Error saving code:', transaction.error);
            reject(transaction.error)
        };
    });
}

export async function loadCode(): Promise<string | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(CODE_KEY);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // request.result can be undefined if key not found
        resolve(request.result ?? null); 
      };
      request.onerror = () => {
        console.error('Error loading code:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    // This can happen if indexedDB is disabled by the user's browser settings
    console.error("Could not access IndexedDB:", error);
    return null;
  }
}
