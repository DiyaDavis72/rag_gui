
import { initDB } from "./init"
import { type Conversation, StoreNames } from "./types"

export const createConvo = async (conversation: Conversation): Promise<string> => {

  try {

    const db = await initDB();
    return new Promise((resolve, reject) => {

      const tx = db.transaction(StoreNames.conversations as StoreNames, 'readwrite');
      const store = tx.objectStore(StoreNames.conversations);


      const request = store.add(conversation)

      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);

    })
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }

}
