export async function* readNdjsonStream<T>(
	response: Response,
): AsyncGenerator<T> {
	if (!response.body) throw new Error("Missing response body");

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? ""; // Retain incomplete line for next packet

			for (const line of lines) {
				if (!line.trim()) continue;
				yield JSON.parse(line) as T;
			}
		}
	} finally {
		reader.releaseLock();
	}
}
