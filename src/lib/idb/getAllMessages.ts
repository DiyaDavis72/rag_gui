import { initDB } from "./init";
import { StoreNames, type Message } from "./types";

export const getAllMessages = async ({ conversationId }: { conversationId: string; }): Promise<Message[]> => {

  const db = await initDB();

  return new Promise<Message[]>((resolve, reject) => {
    const tx = db.transaction(StoreNames.messages, 'readonly')
    const store = tx.objectStore(StoreNames.messages)
    const index = store.index("by_conversation");
    const request = index.getAll(conversationId);

    request.onsuccess = () => resolve((request.result.length ? request.result : []) as Message[])
    request.onerror = () => reject(request.error)

  })
}
