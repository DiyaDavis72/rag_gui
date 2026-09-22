import { createMessage } from "$lib/idb/createMessage";
import { getAllMessages } from "$lib/idb/getAllMessages";
import type { Message } from "$lib/idb/types";
import { getContext, setContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

class MessagesState {
  //state
  messages = new SvelteMap<number, Message>();
  isLoading = $state(false);
  isError = $state<Error | null>(null);

  //actions 
  async load(conversationId: string) {
    this.isLoading = true
    try {

      const messages = await getAllMessages({ conversationId });
      this.messages.clear();
      messages.forEach((message) => {
        this.messages.set(message.id, message);
      });
    } catch (e) {
      this.isError = e as Error
    }
    finally {
      this.isLoading = false
    }
  }

  async addMessage(message: Omit<Message, "id">) {
    const newMsgId = await createMessage(message);

    this.messages.set(newMsgId, { ...message, id: newMsgId });
  }

}

const MESSAGES_STATE_KEY = Symbol("MESSAGES_STATE_KEY");

export const setMessagesState = () => setContext(MESSAGES_STATE_KEY, new MessagesState);
export const getMessagesState = () => getContext<MessagesState>(MESSAGES_STATE_KEY);
