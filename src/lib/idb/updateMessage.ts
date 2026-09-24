import { initDB } from "./init";
import { StoreNames, type Message } from "./types";

export const updateMessage = async (message: Message) => {
	const db = await initDB();

	return new Promise<Message>((resolve, reject) => {
		const tx = db.transaction(StoreNames.messages, "readwrite");
		const store = tx.objectStore(StoreNames.messages);
		const request = store.put(message);

		request.onsuccess = () => resolve(message);
		request.onerror = () => reject(request.error);
	});
};
