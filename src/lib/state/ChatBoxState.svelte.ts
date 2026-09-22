import type { MODEL_LIST } from "$lib/types";
import { getContext, setContext } from "svelte";

class ChatBoxState {
  // state
  think = $state(false);
  selectedModel = $state("qwen2.5:14b");
  temprature = $state(0);
  messageBody = $state("")


  // actions

  setThink(value: boolean) {
    this.think = value;
  }

  setSelectedModel(model: string) {
    this.selectedModel = model;
  }

  setTemprature(value: number) {
    this.temprature = value;
  }
}

const CHATBOX_STATE_KEY = Symbol("CHATBOX_STATE_KEY");

export const setChatBoxState = () => setContext(CHATBOX_STATE_KEY, new ChatBoxState());
export const getChatBoxState = () => getContext<ChatBoxState>(CHATBOX_STATE_KEY);
