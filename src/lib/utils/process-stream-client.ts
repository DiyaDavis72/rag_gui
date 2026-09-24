import type { Message } from "$lib/idb/types";
import type { StreamEvent } from "$lib/types";

export const processSteamClient = (
	event: StreamEvent,
	message: Message,
	userMessage: Message,
) => {
	switch (event.event) {
		case "tool": {
			const toolIndex = message.toolCall ? message.toolCall.length : 0;
			message.toolCall = [
				...(message.toolCall ? message.toolCall : []),
				{ query: event.data.query, chunks: event.data.newCandidates },
			];
			if (!message.parts) {
				message.parts = {};
			}
			message.parts[toolIndex] = message.content.length;
			message.status = "searching";
			break;
		}
		case "chunks":
			message.chunks = event.data;
			break;
		case "thinking":
			message.thinking = (message.thinking ?? "") + event.data;
			break;
		case "token":
			message.content += event.data;
			break;
		case "error":
			message.status = "error";
			message.error = event.data;
			userMessage.status = "error";
			break;
		case "status":
			message.status = event.data;
			break;
		case "done":
			if (message.status !== "error") {
				message.status = "done";
			}
			userMessage.status = "done";
			if (event.data && !message.content) {
				message.content = event.data;
			}
			break;
		default:
			console.error("Unknown event");
	}
};
