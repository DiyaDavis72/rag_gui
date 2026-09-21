import { StoreNames } from "./types";

const DB_NAME = "frank_rag";
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(StoreNames.conversations as StoreNames)) {
        db.createObjectStore(StoreNames.conversations as StoreNames, {
          keyPath: "id"
        })
      }

      if (!db.objectStoreNames.contains(StoreNames.messages as StoreNames)) {
        const messageStore = db.createObjectStore(StoreNames.messages as StoreNames, {
          keyPath: "id",
          autoIncrement: true
        })

        messageStore.createIndex('by_conversation', 'conversationId', { unique: false })

        messageStore.createIndex('by_convo_and_time', ['conversationId', 'timestamp'], { unique: false })

      }
    }

    request.onsuccess = () => resolve(request.result)

    request.onerror = () => reject(request.error)
  })
}
