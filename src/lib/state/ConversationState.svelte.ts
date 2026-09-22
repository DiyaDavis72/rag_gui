import { createConvo } from "$lib/idb/createConvo";
import { getAllConversations } from "$lib/idb/getAllConversations";
import type { Conversation } from "$lib/idb/types";
import { updateConvo as updateConvoDb } from "$lib/idb/updateConvo";
import { getContext, setContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

class ConversationState {
  // state
  conversations = new SvelteMap<string, Conversation>()
  activeConvoId = $state<string>("");
  isLoading = $state<boolean>(false);
  isError = $state<null | Error>(null);
  // drived state
  activeConvo: Conversation | undefined = $derived(this.conversations.get(this.activeConvoId));

  //actions
  async load() {
    this.isLoading = true;

    try {
      const convoArr = await getAllConversations();
      this.conversations.clear();
      convoArr.forEach((convo) => {
        this.conversations.set(convo.id, convo);
      });
    } catch (error) {
      this.isError = error as Error;
    } finally {
      this.isLoading = false;
    }
  }

  setActiveConvo(convoId: string) {
    if (!this.conversations.has(convoId)) {
      this.isError = new Error(`Conversation with ID ${convoId} does not exist.`);
      return
    }
    this.activeConvoId = convoId;
  }

  async updateConvo(convo: Partial<Conversation> & { id: string; }) {
    const existingConvo = this.conversations.get(convo.id);

    if (!existingConvo) {
      this.isError = new Error(`Conversation with ID ${convo.id} does not exist.`);
      return
    }

    const updatedConvo = { ...existingConvo, ...convo };

    const result = await updateConvoDb(updatedConvo);

    this.conversations.set(convo.id, result);

  }

  async newConvo() {
    const id = crypto.randomUUID();
    const newConvo: Conversation = {
      id,
      timestamp: Date.now(),
      title: "",
      model: "qwen2.5:14b",
      think: false,
      temprature: 0
    }
    await createConvo(newConvo);

    this.conversations.set(id, newConvo);

    this.activeConvoId = id;
    return newConvo;
  }

}

const CONVERSATION_STATE_KEY = Symbol("CONVERSATION_STATE_KEY");

export function setConversationState() {
  return setContext(CONVERSATION_STATE_KEY, new ConversationState)
}

export function getConversationState() {
  return getContext<ConversationState>(CONVERSATION_STATE_KEY)
}
