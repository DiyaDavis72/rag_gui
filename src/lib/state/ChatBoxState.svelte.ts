export type ChatBoxStateType = {
  think: boolean;
  selectedModel: string;
  temprature: number
}

export const chatBoxState = $state<ChatBoxStateType>({
  think: false,
  selectedModel: "qwen2.5:14b",
  temprature: 0,
})
