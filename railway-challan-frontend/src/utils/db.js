import { openDB } from 'idb';

export async function getDB() {
  return openDB('challan-app', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offlineChallans')) {
        db.createObjectStore('offlineChallans', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function saveOfflineChallan(data) {
  const db = await getDB();
  await db.add('offlineChallans', data);
}

export async function getAllOfflineChallans() {
  const db = await getDB();
  return await db.getAll('offlineChallans');
}

export async function clearOfflineChallans() {
  const db = await getDB();
  const tx = db.transaction('offlineChallans', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function deleteOfflineChallan(id) {
  const db = await getDB();
  await db.delete('offlineChallans', id);
}

