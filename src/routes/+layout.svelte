<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { setConversationState } from "$lib/state/ConversationState.svelte";
  import { onMount } from "svelte";
  const convoState = setConversationState();
  let { children } = $props();
  onMount(() => convoState.load());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Sidebar {children} />
