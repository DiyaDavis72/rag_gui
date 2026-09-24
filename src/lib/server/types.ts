export type Chunk = {
  id: string;
  chapter_id: string;
  chapter_name: string;
  volume: string;
  text: string;
  embedding: string;
};

export type Embedding = number[];

export type Retrieved = Omit<
  Chunk & {
    score: number;
  },
  "embedding"
>;

export type ChapterMetadata = {
  id: string;
  volume: string;
  title: string;
};

export type ToolCalls = {
  id: string;
  function: { index: number; name: "search"; arguments: { query: string } };
};

export const ROLES = {
  system: "system",
  user: "user",
  assistant: "assistant",
  tool: "tool",
} as const;

export type Role = keyof typeof ROLES;

export type BaseMessage = {
  content: string;
};

export type UserMessage = BaseMessage & {
  role: "user";
};

export type SystemMessage = BaseMessage & {
  role: "system";
};

export type AssistantMessage = BaseMessage & {
  role: "assistant";
  tool_calls?: ToolCalls[];
  thinking?: string;
};

export type ToolMessage = BaseMessage & {
  role: "tool";
  tool_name: "search";
};

export type Message =
  | SystemMessage
  | AssistantMessage
  | ToolMessage
  | UserMessage;

export type History = Message & {
  raw?: { query: string; candidates: Retrieved[] };
};
