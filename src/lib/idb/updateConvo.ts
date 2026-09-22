import { initDB } from "./init";
import { StoreNames, type Conversation } from "./types";

export const updateConvo = async (convo: Conversation) => {
  const db = await initDB();

  return new Promise<Conversation>((resolve, reject) => {
    const tx = db.transaction(StoreNames.conversations, "readwrite");
    const store = tx.objectStore(StoreNames.conversations)
    const request = store.put(convo);

    request.onsuccess = () => resolve(convo);
    request.onerror = () => reject(request.error);

  })

}
