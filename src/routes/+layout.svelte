<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { setConversationState } from "$lib/state/ConversationState.svelte";
  import { onMount } from "svelte";
  import { setMessagesState } from "$lib/state/MessagesState.svelte";
  import { setChatBoxState } from "$lib/state/ChatBoxState.svelte";
  import { page } from "$app/state";
  const convoState = setConversationState();
  const messagesState = setMessagesState();
  setChatBoxState();
  let { children } = $props();

  onMount(() => convoState.load());

  $effect(() => {
    const convoId = page.url.searchParams.get("id");
    if (convoId) {
      if (convoState.conversations.has(convoId)) {
        convoState.activeConvoId = convoId;
        messagesState.load(convoId);
      }
    } else {
      convoState.activeConvoId = "";
      messagesState.messages.clear();
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Sidebar {children} />
