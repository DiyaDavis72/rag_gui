<script lang="ts">
  import BrainCircuit from "@lucide/svelte/icons/brain-circuit";
  import Thermometer from "@lucide/svelte/icons/thermometer";
  import { Range, Select, Label, Checkbox, cn } from "flowbite-svelte";
  import { page } from "$app/state";
  import { getChatBoxState } from "$lib/state/ChatBoxState.svelte";
  import type { MODEL_LIST } from "$lib/types";
  import Send from "@lucide/svelte/icons/send";
  import { getMessagesState } from "$lib/state/MessagesState.svelte";
  import { getConversationState } from "$lib/state/ConversationState.svelte";
  const messageState = getMessagesState();
  const conversationState = getConversationState();
  const chatBoxState = getChatBoxState();
  let disabled = $derived(
    chatBoxState.messageBody.trim() === "" ||
      chatBoxState.selectedModel.trim() === "",
  );

  $effect(() => {
    const processEvent = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        newMessage();
      }
    };
    addEventListener("keydown", processEvent);

    return () => {
      removeEventListener("keydown", processEvent);
    };
  });

  const newMessage = async () => {
    if (disabled) {
      return;
    }

    const convoId = conversationState.activeConvo
      ? conversationState.activeConvoId
      : (await conversationState.newConvo()).id;

    if (conversationState.activeConvo?.title === "") {
      conversationState.updateConvo({
        id: convoId,
        title: chatBoxState.messageBody.trim().slice(0, 20),
      });
    }

    await messageState.addMessage({
      conversationId: convoId,
      content: chatBoxState.messageBody.trim(),
      role: "user",
      chunks: [],
      thinking: chatBoxState.think,
      temprature: chatBoxState.temprature,
      timestamp: new Date(),
      processed: false,
    });

    chatBoxState.messageBody = "";
  };
</script>

<div class="mt-4 flex justify-between items-center gap-4">
  <div class="flex flex-row items-center gap-4 bg-transparent">
    {#await page.data.streamed.models}
      <Select
        class="w-32"
        disabled
        name="model-select"
        placeholder="Loading models..."
        items={[]}
      />
    {:then models}
      <Select
        class="w-32"
        name="model-select"
        bind:value={chatBoxState.selectedModel}
        items={models.map((m: MODEL_LIST) => ({
          value: m.name,
          name: m.name,
        }))}
        placeholder={"Select a model"}
      />
    {:catch error}
      {console.error("Error loading models:", error)}
      <Select
        class="w-48 border border-red-400"
        disabled
        name="model-select"
        placeholder="No models available..."
        items={[]}
      />
    {/await}
    <Checkbox custom bind:checked={chatBoxState.think}>
      <BrainCircuit
        class={cn(
          "w-10 h-10 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-colors",
          {
            "text-primary-600 dark:text-primary-500 border-primary-500":
              chatBoxState.think,
          },
        )}
      />
    </Checkbox>
    <div class="flex flex-row items-center gap-2">
      <Label for="temprature-range">
        <Thermometer
          class="w-10 h-10 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
        />
      </Label>
      <Range
        id="temprature-range"
        name="temprature-range"
        size="lg"
        min={0}
        max={1}
        step={0.1}
        bind:value={chatBoxState.temprature}
      />
    </div>
  </div>
  <button
    {disabled}
    onclick={newMessage}
    class="rounded-md p-2 border border-gray-500 flex items-center justify-center transition-colors
           enabled:cursor-pointer enabled:hover:bg-gray-100 enabled:dark:hover:bg-gray-700
           disabled:opacity-40 disabled:cursor-not-allowed"
    aria-label="Send message"
  >
    <Send class="text-primary-500 rotate-45 mr-2" />
  </button>
</div>

<style>
  /* Thumb */
  :global(input[type="range"]::-webkit-slider-thumb) {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: rgb(248 113 113); /* red-400 */
    margin-top: -6px;
    cursor: pointer;
  }

  /* Firefox */
  :global(input[type="range"]::-moz-range-thumb) {
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 9999px;
    background: rgb(248 113 113);
    cursor: pointer;
  }
</style>
