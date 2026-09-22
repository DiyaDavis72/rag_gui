<script lang="ts">
  import ChatBox from "$lib/components/ChatBox.svelte";
  import ChatControls from "$lib/components/ChatControls.svelte";
  import ChatBubble from "$lib/components/ChatBubble.svelte";
  import { getMessagesState } from "$lib/state/MessagesState.svelte";
  import { Card } from "flowbite-svelte";
  import ragImg from "$lib/assets/Rag-PNG-Pic.png";

  const msgState = getMessagesState();
  let messageContainer: HTMLDivElement | undefined = $state();

  $effect(() => {
    // Auto-scroll to bottom as new messages arrive
    if (msgState.messages.size && messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });
</script>

<main
  class="flex flex-col flex-1 min-w-0 min-h-0 h-full p-8 overflow-hidden items-center justify-between gap-4"
>
  <div
    bind:this={messageContainer}
    class="flex-1 min-h-0 w-full max-w-4xl overflow-y-auto px-4 py-2"
  >
    {#if !msgState.messages.size}
      <div class="flex flex-col items-center justify-center h-full gap-2">
        <div class="flex flex-row items-center gap-1">
          <h3
            class="text-3xl font-semibold font-serif dark:text-secondary-200/50"
          >
            Frankensein
          </h3>
          <img
            src={ragImg}
            alt="Frankensein Rag"
            class="w-32 h-32 object-contain"
          />
        </div>
        <p class="text-lg text-center dark:text-secondary-200/30">
          A chat interface for the Frankensein Rag project.
        </p>
      </div>
    {:else}
      <div class="flex flex-col min-h-full justify-end gap-3">
        {#each msgState.messages.values() as message (message.id)}
          <ChatBubble {message} />
        {/each}
      </div>
    {/if}
  </div>
  <Card class="max-w-4xl w-full p-6 shrink-0 flex flex-col gap-4 shadow-lg">
    <ChatBox />
    <ChatControls />
  </Card>
</main>
