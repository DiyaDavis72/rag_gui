import { initDB } from "./init";
import { type Conversation, StoreNames } from "./types";

export const getAllConversations = async (): Promise<Conversation[]> => {
  const db = await initDB();

  return new Promise<Conversation[]>((resolve, reject) => {

    const tx = db.transaction(StoreNames.conversations as StoreNames, "readonly");

    const store = tx.objectStore(StoreNames.conversations)

    const result = store.getAll()

    result.onsuccess = () => resolve((result.result.length ? result.result : []) as Conversation[])
    result.onerror = () => reject(result.error)
  })
}
