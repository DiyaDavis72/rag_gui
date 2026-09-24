import { createMessage } from "$lib/idb/createMessage";
import { getAllMessages } from "$lib/idb/getAllMessages";
import { updateMessage } from "$lib/idb/updateMessage";
import type { Message } from "$lib/idb/types";
import { buildChatPayload } from "$lib/payload/chat-payload";
import type { StreamEvent } from "$lib/types";
import { processSteamClient } from "$lib/utils/process-stream-client";
import { readNdjsonStream } from "$lib/utils/stream";
import { getContext, setContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

class MessagesState {
	//state
	messages = new SvelteMap<number, Message>();
	isLoading = $state(false);
	isError = $state<Error | null>(null);

	//actions
	async load(conversationId: string) {
		this.isLoading = true;
		try {
			const messages = await getAllMessages({ conversationId });
			this.messages.clear();
			messages.forEach((message) => {
				this.messages.set(message.id, message);
			});
		} catch (e) {
			this.isError = e as Error;
		} finally {
			this.isLoading = false;
		}
	}

	async addMessage(message: Omit<Message, "id">, conversationId: string) {
		// user message
		const newMsgId = await createMessage(message);
		this.messages.set(newMsgId, { ...message, id: newMsgId });

		const userMsgRef = this.messages.get(newMsgId);
		if (!userMsgRef) throw new Error("Bad State");

		//Assistant message
		const assistantMsg: Omit<Message, "id"> = {
			conversationId,
			role: "assistant",
			chunks: [],
			content: "",
			parts: {},
			timestamp: new Date(),
			status: "pending",
			temprature: message.temprature,
			thinking: message.thinking,
			model: message.model,
		};
		const assistantMsgId = await createMessage(assistantMsg);

		this.messages.set(assistantMsgId, { ...assistantMsg, id: assistantMsgId });

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify(
					buildChatPayload({
						model: message.model ?? "",
						query: message.content,
						temperature: message.temprature ?? 0,
						think: message.think ?? false,
					}),
				),
			});

			const assistentMsgRef = this.messages.get(assistantMsgId);
			if (!assistentMsgRef) {
				throw new Error("Bad state");
			}
			if (!res.ok) {
				assistentMsgRef.status = "error";
				assistentMsgRef.error = "Network Error";
				return;
			}

			const stream = readNdjsonStream<StreamEvent>(res);
			for await (const event of stream) {
				console.log(event);
				processSteamClient(event, assistentMsgRef, userMsgRef);
				// Trigger Svelte 5 SvelteMap reactivity
				this.messages.set(assistantMsgId, { ...assistentMsgRef });
				if (event.event === "done" || event.event === "error") {
					this.messages.set(newMsgId, { ...userMsgRef });
					updateMessage(assistentMsgRef).catch(console.error);
					updateMessage(userMsgRef).catch(console.error);
				}
			}
		} catch (e) {
			console.error("Chat error:", e);
			const assistantMsgRef = this.messages.get(assistantMsgId);
			if (assistantMsgRef) {
				assistantMsgRef.status = "error";
				assistantMsgRef.error =
					e instanceof Error ? e.message : "Failed to generate";
				this.messages.set(assistantMsgId, { ...assistantMsgRef });
				updateMessage(assistantMsgRef).catch(console.error);
			}
		}
	}
}

const MESSAGES_STATE_KEY = Symbol("MESSAGES_STATE_KEY");

export const setMessagesState = () =>
	setContext(MESSAGES_STATE_KEY, new MessagesState());
export const getMessagesState = () =>
	getContext<MessagesState>(MESSAGES_STATE_KEY);
