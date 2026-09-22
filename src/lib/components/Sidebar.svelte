<script lang="ts">
  import {
    Sidebar,
    SidebarGroup,
    SidebarButton,
    uiHelpers,
    cn,
  } from "flowbite-svelte";
  import { page } from "$app/state";
  import MessageCircle from "@lucide/svelte/icons/message-circle";
  import Menu from "@lucide/svelte/icons/menu";
  import SquarePen from "@lucide/svelte/icons/square-pen";
  import SidebarItem from "$lib/components/Sidebar-item.svelte";
  import { getConversationState } from "$lib/state/ConversationState.svelte";
  let activeUrl = $state(page.url.pathname);
  const demoSidebarUi = uiHelpers();
  let isCollapsed = $state(false);
  let isDemoOpen = $state(false);
  const closeDemoSidebar = demoSidebarUi.close;
  $effect(() => {
    isDemoOpen = demoSidebarUi.isOpen;
    activeUrl = page.url.pathname;
  });
  let { children } = $props();
  const convoState = getConversationState();
</script>

<SidebarButton onclick={demoSidebarUi.toggle} class="mb-2" />
<div
  class="flex flex-row h-svh overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
>
  <Sidebar
    breakpoint="md"
    isOpen={isDemoOpen}
    closeSidebar={closeDemoSidebar}
    class={cn(
      "md:static transition-[width] duration-300 ease-in-out overflow-hidden shrink-0",
      { "md:w-14": isCollapsed },
    )}
    classes={{
      div: cn(
        "overflow-y-auto overflow-x-hidden py-4 transition-all duration-300",
        isCollapsed ? "px-2" : "px-3",
      ),
    }}
  >
    <div
      class={cn(
        "hidden border-b border-gray-200 dark:border-gray-700 md:flex w-full items-center pb-2 mb-2",
        {
          "justify-center": isCollapsed,
          "justify-between": !isCollapsed,
        },
      )}
    >
      {#if !isCollapsed}
        <span
          class="text-lg font-semibold whitespace-nowrap text-gray-900 dark:text-white"
        >
          History
        </span>
      {/if}
      <button
        onclick={() => (isCollapsed = !isCollapsed)}
        class="p-2 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Toggle sidebar"
      >
        <Menu />
      </button>
    </div>

    <!-- New Conversation Button -->
    <a
      href="/"
      class={cn(
        "flex items-center gap-2 mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      title="New conversation"
    >
      <SquarePen class="w-5 h-5 shrink-0 text-primary-600 dark:text-primary-500" />
      {#if !isCollapsed}
        <span class="text-sm font-medium whitespace-nowrap">New conversation</span>
      {/if}
    </a>

    <SidebarGroup class="pt-2 ">
      {#if convoState.isLoading}
        <p
          class={cn("text-gray-500 dark:text-gray-400", {
            hidden: isCollapsed,
          })}
        >
          Loading conversations...
        </p>
      {:else if convoState.conversations.size === 0}
        <p
          class={cn("text-gray-500 dark:text-gray-400", {
            hidden: isCollapsed,
          })}
        >
          No conversations
        </p>
      {:else}
        {#each convoState.conversations.values() as conversation (conversation.id)}
          <SidebarItem
            Icon={MessageCircle}
            label={conversation.title}
            href={`/?id=${conversation.id}`}
            {isCollapsed}
          />
        {/each}
      {/if}
    </SidebarGroup>
  </Sidebar>
  {@render children()}
</div>
