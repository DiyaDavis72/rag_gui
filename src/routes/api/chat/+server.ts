import { inference } from "$lib/server/infrence";
import { retrieve } from "$lib/server/retrieve";
import type { StreamEvent } from "$lib/types";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	const { query, model, think, temperature } = await request
		.json()
		.catch(() => ({}));

	if (
		(typeof model !== "string" && model.trim() === "") ||
		(typeof query !== "string" && query.trim() === "")
	) {
		throw error(400, "Bad payload");
	}

	console.log("starting process for query, ", query, {
		temperature,
		model,
		think,
	});

	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const sendEvent = (props: StreamEvent) => {
				const { event, data } = props;
				controller.enqueue(
					encoder.encode(`${JSON.stringify({ event, data })}\n`),
				);
			};

			try {
				sendEvent({ event: "status", data: "searching" });
				const chunks = await retrieve({ query, limit: 4 });
				sendEvent({ event: "chunks", data: chunks.map((c) => c.text) });
				sendEvent({ event: "status", data: "inference" });

				const answer = await inference({
					query,
					candidates: chunks,
					model,
					temperature,
					think,
					onStatus: (status) => sendEvent({ event: "status", data: status }),
					onThinking: (thinking: string) =>
						sendEvent({ event: "thinking", data: thinking }),
					onToken: (token) => sendEvent({ event: "token", data: token }),
					onToolCall: (query, newCandidates) =>
						sendEvent({
							event: "tool",
							data: { query, newCandidates: newCandidates.map((c) => c.text) },
						}),
					onError: (error: string) =>
						sendEvent({ event: "error", data: error }),
				});
				if (answer) {
					sendEvent({ event: "done", data: answer });
				}
			} catch (e) {
				console.error(e);
				sendEvent({
					event: "error",
					data: e instanceof Error ? e.message : "Inference failed",
				});
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "application/x-ndjson",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};
