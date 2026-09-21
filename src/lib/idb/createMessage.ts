import { initDB } from "./init"
import { StoreNames, type Message } from "./types";

export const createMessage = async (message: Message): Promise<string> => {
  const db = await initDB();

  return new Promise<string>((resolve, reject) => {
    const tx = db.transaction(StoreNames.messages, "readwrite");

    const store = tx.objectStore(StoreNames.messages)

    const request = store.add(message)

    request.onsuccess = () => resolve(request.result as string)
    request.onerror = () => reject(request.error)

  })
}
