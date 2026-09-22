export type Conversation = {
  id: string;
  timestamp: number;
  title: string;
  model: string;
  think: boolean;
  temprature: number;
};

export type Message = {
  id: number
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  chunks: string[];
  temprature: number;
  processed: boolean;
}

export const StoreNames = {
  conversations: 'conversations',
  messages: 'messages'
}

export type StoreNames = keyof typeof StoreNames; 
