import { initDB } from "./init"
import { StoreNames, type Message } from "./types";

export const createMessage = async (message: Omit<Message, "id">): Promise<number> => {
  const db = await initDB();

  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction(StoreNames.messages, "readwrite");

    const store = tx.objectStore(StoreNames.messages)

    const request = store.add(message)

    request.onsuccess = () => resolve(Number(request.result) as number)
    request.onerror = () => reject(request.error)

  })
}
