<script lang="ts">
  import type { Message } from "$lib/idb/types";
  import { Avatar } from "flowbite-svelte";
  import User from "@lucide/svelte/icons/user";
  import Bot from "@lucide/svelte/icons/bot";
  import { Loader } from "@lucide/svelte";

  type Props = {
    message: Message;
  };

  let { message }: Props = $props();
  const isUser = $derived(message.role === "user");

  const formattedTime = $derived(
    message.timestamp instanceof Date
      ? message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
  );
</script>

{#if isUser}
  <!-- User Message (Right-aligned Flowbite Chat Bubble) -->
  <div class="flex items-start justify-end gap-2.5 my-2 w-full">
    <div
      class="flex flex-col w-full max-w-106 leading-1.5 p-4 bg-primary-600 text-white rounded-s-xl rounded-ee-xl shadow-sm"
    >
      <div class="flex items-center justify-between gap-4 mb-1">
        <span class="text-sm font-semibold">You</span>
        <div class="flex items-center gap-2">
          <span class="text-xs text-primary-200">{formattedTime}</span>
          {#if !message.processed}
            <Loader class="animate-spin ml-auto text-primary-200 w-4" />
          {/if}
        </div>
      </div>
      <p
        class="text-sm font-normal whitespace-pre-wrap wrap-break-word leading-relaxed"
      >
        {message.content}
      </p>
    </div>
    <Avatar size="sm" class="shrink-0 bg-primary-700 text-white mt-1">
      <User class="w-4 h-4" />
    </Avatar>
  </div>
{:else}
  <!-- Assistant / Other Message (Left-aligned Flowbite Chat Bubble) -->
  <div class="flex items-start justify-start gap-2.5 my-2 w-full">
    <Avatar
      size="sm"
      class="shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mt-1"
    >
      <Bot class="w-4 h-4" />
    </Avatar>
    <div
      class="flex flex-col w-full max-w-162.5 leading-1.5 p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-e-xl rounded-es-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between gap-4 mb-1">
        <span class="text-sm font-semibold">Assistant</span>
        <span class="text-xs text-gray-500 dark:text-gray-400"
          >{formattedTime}</span
        >
      </div>
      <p
        class="text-sm font-normal whitespace-pre-wrap break-words leading-relaxed text-gray-800 dark:text-gray-200"
      >
        {message.content}
      </p>
    </div>
  </div>
{/if}
