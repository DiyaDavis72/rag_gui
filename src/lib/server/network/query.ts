import { tools } from "../tools";
import type { Message } from "../types";

export const query = async ({
	messages,
	think = false,
	temperature,
	model,
}: {
	messages: Message[];
	think?: boolean;
	temperature: number;
	model: string;
}) => {
	const sanitizedMessages = messages.map((m) => {
		const msg: Record<string, any> = {
			role: m.role,
			content: m.content ?? "",
		};
		if (m.tool_calls && m.tool_calls.length > 0) {
			msg.tool_calls = m.tool_calls;
		}
		if (m.tool_call_id) {
			msg.tool_call_id = m.tool_call_id;
		}
		return msg;
	});

	return fetch(`http://mini.lan:11434/api/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			...(think ? { think: think } : { think: false }),
			messages: sanitizedMessages,
			keep_alive: "30m",
			stream: true,
			options: {
				temperature,
				num_ctx: 8192,
			},
			tools,
		}),
	});
};
