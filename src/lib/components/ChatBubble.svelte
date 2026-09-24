<script lang="ts">
  import type { Message } from "$lib/idb/types";
  import { Avatar } from "flowbite-svelte";
  import {
    Loader,
    User,
    Bot,
    FileText,
    Search,
    BrainCircuit,
    ChevronDown,
    ChevronUp,
    X,
  } from "@lucide/svelte";

  type Props = {
    message: Message;
  };

  let { message }: Props = $props();
  const isUser = $derived(message.role === "user");

  let activeExcerpt = $state<{ title: string; text: string } | null>(null);
  let showThinking = $state(false);

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

  const toggleExcerpt = (title: string, text: string) => {
    if (activeExcerpt?.title === title) {
      activeExcerpt = null;
    } else {
      activeExcerpt = { title, text };
    }
  };

  type Segment =
    | { type: "text"; text: string }
    | { type: "tool"; tool: { query: string; chunks: string[] }; index: number };

  const segments = $derived.by<Segment[]>(() => {
    if (!message.toolCall || message.toolCall.length === 0) {
      return message.content ? [{ type: "text", text: message.content }] : [];
    }

    if (!message.parts) {
      // Legacy fallback: text first, all tool calls after
      const res: Segment[] = [];
      if (message.content) res.push({ type: "text", text: message.content });
      message.toolCall.forEach((tool, index) => {
        res.push({ type: "tool", tool, index });
      });
      return res;
    }

    // Sort tool calls by content character index recorded in parts
    const toolsWithPos = message.toolCall.map((tool, index) => ({
      tool,
      index,
      pos: message.parts?.[index] ?? message.content.length,
    }));

    toolsWithPos.sort((a, b) => a.pos - b.pos);

    const res: Segment[] = [];
    let lastIndex = 0;

    for (const item of toolsWithPos) {
      if (item.pos > lastIndex) {
        const textSlice = message.content.slice(lastIndex, item.pos);
        if (textSlice.trim() !== "") {
          res.push({ type: "text", text: textSlice });
        }
        lastIndex = item.pos;
      }
      res.push({ type: "tool", tool: item.tool, index: item.index });
    }

    if (lastIndex < message.content.length) {
      const remainingText = message.content.slice(lastIndex);
      if (remainingText.trim() !== "") {
        res.push({ type: "text", text: remainingText });
      }
    }

    return res;
  });
</script>

{#if isUser}
  <!-- User Message (Right-aligned Flowbite Chat Bubble) -->
  <div class="flex items-start justify-end gap-2.5 my-2 w-full">
    <div
      class="flex flex-col w-full max-w-106 leading-1.5 p-4 bg-primary-600 text-white rounded-s-xl rounded-ee-xl shadow-sm"
    >
      <div class="flex items-center justify-between gap-4 mb-1">
        <span class="text-sm font-semibold">You</span>
        <span class="text-xs text-primary-200">{formattedTime}</span>
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
  <!-- Assistant / LLM Message (Left-aligned) -->
  <div class="flex items-start justify-start gap-2.5 my-3 w-full">
    <Avatar
      size="sm"
      class="shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mt-1"
    >
      <Bot class="w-4 h-4" />
    </Avatar>

    <div
      class="flex flex-col w-full max-w-2xl leading-1.5 p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-e-xl rounded-es-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-gray-200/60 dark:border-gray-700/60">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">Assistant</span>
          {#if message.model}
            <span class="text-[10px] px-1.5 py-0.5 rounded font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {message.model}
            </span>
          {/if}
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</span>
          {#if message.status !== "done" && message.status !== "error"}
            <Loader class="animate-spin w-3.5 h-3.5 text-primary-500" />
          {/if}
        </div>
      </div>

      <!-- 1. CHUNKS (ABOVE THE MESSAGE) -->
      {#if message.chunks && message.chunks.length > 0}
        <div class="mb-3 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <FileText class="w-3.5 h-3.5 text-primary-500" />
            <span>Retrieved Excerpts ({message.chunks.length})</span>
          </div>

          <div class="flex flex-wrap gap-1.5">
            {#each message.chunks as chunk, idx}
              <button
                type="button"
                onclick={() => toggleExcerpt(`Excerpt #${idx + 1}`, chunk)}
                class="group flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all text-left
                       bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/80
                       hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-xs cursor-pointer
                       {activeExcerpt?.title === `Excerpt #${idx + 1}` ? 'border-primary-500 ring-1 ring-primary-500' : ''}"
              >
                <span class="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span class="max-w-44 truncate text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                  {chunk.trim().slice(0, 30)}...
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Thinking Collapsible (if model produced reasoning) -->
      {#if message.thinking}
        <div class="mb-3 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 overflow-hidden">
          <button
            type="button"
            onclick={() => showThinking = !showThinking}
            class="w-full flex items-center justify-between px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-1.5">
              <BrainCircuit class="w-3.5 h-3.5" />
              <span>Thinking Process</span>
            </div>
            {#if showThinking}
              <ChevronUp class="w-3.5 h-3.5" />
            {:else}
              <ChevronDown class="w-3.5 h-3.5" />
            {/if}
          </button>
          {#if showThinking}
            <div class="px-3 py-2 text-xs font-mono text-purple-900 dark:text-purple-200 whitespace-pre-wrap leading-relaxed border-t border-purple-200/50 dark:border-purple-900/30 max-h-48 overflow-y-auto">
              {message.thinking}
            </div>
          {/if}
        </div>
      {/if}

      <!-- 2. INTERMIXED CONTENT AND TOOL CALLS -->
      {#if segments.length > 0}
        <div class="flex flex-col gap-3">
          {#each segments as segment}
            {#if segment.type === "text"}
              <p class="text-sm font-normal whitespace-pre-wrap break-words leading-relaxed text-gray-800 dark:text-gray-200">
                {segment.text}
              </p>
            {:else if segment.type === "tool"}
              <div class="p-2.5 rounded-lg bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-xs flex flex-col gap-2 shadow-xs">
                <div class="flex items-center gap-2 font-mono text-[11px] text-secondary-600 dark:text-secondary-400">
                  <Search class="w-3 h-3 shrink-0" />
                  <span class="font-semibold">search:</span>
                  <span class="italic text-gray-700 dark:text-gray-300">"{segment.tool.query}"</span>
                </div>

                {#if segment.tool.chunks && segment.tool.chunks.length > 0}
                  <div class="flex flex-wrap gap-1.5 pl-5">
                    {#each segment.tool.chunks as chunk, cIdx}
                      <button
                        type="button"
                        onclick={() => toggleExcerpt(`Search: "${segment.tool.query}" - Chunk #${cIdx + 1}`, chunk)}
                        class="group flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border transition-all text-left
                               bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                               hover:border-secondary-400 dark:hover:border-secondary-500 cursor-pointer
                               {activeExcerpt?.title === `Search: "${segment.tool.query}" - Chunk #${cIdx + 1}` ? 'border-secondary-500 ring-1 ring-secondary-500' : ''}"
                      >
                        <span class="text-secondary-600 dark:text-secondary-400 font-bold text-[10px]">
                          #{cIdx + 1}
                        </span>
                        <span class="max-w-40 truncate text-gray-500 dark:text-gray-400 text-[10px]">
                          {chunk.trim().slice(0, 25)}...
                        </span>
                      </button>
                    {/each}
                  </div>
                {:else}
                  <span class="text-[10px] text-gray-400 italic pl-5">No new excerpts found</span>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      <!-- Status indicator during active generation/search -->
      {#if message.status !== "done" && message.status !== "error"}
        {#if message.status === "searching"}
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1">
            <Loader class="animate-spin w-3.5 h-3.5 text-primary-500" />
            <span>Searching novel for relevant context...</span>
          </div>
        {:else if message.status === "pending" || message.status === "inference"}
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1">
            <Loader class="animate-spin w-3.5 h-3.5 text-primary-500" />
            <span>Formulating answer...</span>
          </div>
        {/if}
      {/if}

      <!-- Error State -->
      {#if message.status === "error"}
        <div class="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
          {message.error ?? "Failed to generate answer"}
        </div>
      {/if}

      <!-- Interactive Excerpt Drawer/Viewer (shown when clicking any chunk) -->
      {#if activeExcerpt}
        <div class="mt-3 p-3 rounded-lg text-xs leading-relaxed bg-white dark:bg-gray-900 border border-primary-300 dark:border-primary-800/60 text-gray-700 dark:text-gray-300 shadow-md">
          <div class="flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100 dark:border-gray-800">
            <span class="font-semibold text-primary-600 dark:text-primary-400 text-[11px]">
              {activeExcerpt.title}
            </span>
            <button
              type="button"
              onclick={() => activeExcerpt = null}
              class="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              aria-label="Close excerpt"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
          <p class="whitespace-pre-wrap font-serif italic text-gray-600 dark:text-gray-300 max-h-52 overflow-y-auto pr-1">
            "{activeExcerpt.text.trim()}"
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}
