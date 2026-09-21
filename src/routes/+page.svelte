<script lang="ts">
  import { getAllConversations } from "$lib/idb/getAllConversations";
  import ChatBox from "$lib/components/ChatBox.svelte";
  import ChatControls from "$lib/components/ChatControls.svelte";
  import { Card } from "flowbite-svelte";
  import type { Conversation } from "$lib/idb/types";
  import { onMount } from "svelte";
  let conversations = $state<Conversation[]>([]);
  let isLoading = $state<boolean>(true);

  onMount(async () => {
    try {
      conversations = await getAllConversations();
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      isLoading = false;
    }
  });
</script>

<main
  class="flex flex-col flex-1 min-w-0 h-full p-12 overflow-hidden items-center justify-between gap-4"
>
  <div>
    <p class="text-gray-500 dark:text-gray-400">No conversation</p>
  </div>
  <Card class="max-w-11/12 p-8 overflow-hidden flex flex-col gap-4 shadow-lg">
    <ChatBox />
    <ChatControls />
  </Card>
</main>
