export type MODEL_CAPABILITIES = "completion" | "tools" | "thinking";

export type MODEL_LIST = {
	name: string;
	model: string;
	size: number;
	capabilities: MODEL_CAPABILITIES[];
};

// 1. Request payload contract
export type ChatRequest = {
	query: string;
	model: string;
	temperature?: number;
	think?: boolean;
};

// 2. Stream event contract (Discriminated Union)
export type StreamEvent =
	| {
			event: "status";
			data: "done" | "error" | "searching" | "inference" | "pending";
	  }
	| { event: "chunks"; data: string[] }
	| { event: "thinking"; data: string }
	| { event: "token"; data: string }
	| { event: "tool"; data: { query: string; newCandidates: string[] } }
	| { event: "done"; data: string }
	| { event: "error"; data: string };

export type IteratorResult<T> =
	| { value: T; done: false } // The next event
	| { value: undefined; done: true }; // Stream has finished
