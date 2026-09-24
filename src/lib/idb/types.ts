import type { Message } from "$lib/server/types";

export type Conversation = {
  id: string;
  timestamp: number;
  title: string;
  model: string;
  think: boolean;
  temprature: number;
};

export type MessageDB = {
  id: number;
  conversationId: string;
  subMessages: Message[];
  thinking?: { messageIndex: number; thinking: string };
  chunks?: { messageIndex: number; chunks: string[] };
  config: {
    model?: string;
    temprature?: number;
    think?: boolean;
  };
  timestamp: Date;
  status: "searching" | "inference" | "error" | "pending" | "done";
  error?: string;
};

export const StoreNames = {
  conversations: "conversations",
  messages: "messages",
};

export type StoreNames = keyof typeof StoreNames;
