import type { ChatRequest } from "$lib/types";

export const buildChatPayload = ({
	query,
	model,
	temperature,
	think,
}: {
	query: string;
	model: string;
	temperature: number;
	think: boolean;
}): ChatRequest => {
	if (
		typeof query !== "string" ||
		!query.trim() ||
		typeof model !== "string" ||
		!model.trim() ||
		typeof temperature !== "number" ||
		temperature > 1 ||
		temperature < 0 ||
		typeof think !== "boolean"
	) {
		throw new Error("Bad Payload");
	}
	return {
		query,
		model,
		temperature,
		think,
	};
};
