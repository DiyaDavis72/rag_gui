export type Conversation = {
  id: string;
  timestamp: number;
  title: string;
  model: string;
  think: boolean;
  temprature: number;
};

export type Message = {
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
}

export const StoreNames = {
  conversations: 'conversations',
  messages: 'messages'
}

export type StoreNames = keyof typeof StoreNames; 
