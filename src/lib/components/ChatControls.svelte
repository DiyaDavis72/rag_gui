<script lang="ts">
  import { LIST_MODELS_URL } from "$lib/DAL/inference";
  import { modelListState } from "$lib/state/ModelListState.svelte";
  import type { MODEL_LIST } from "$lib/types";
  import { onMount } from "svelte";
  import { chatBoxState } from "$lib/state/ChatBoxState.svelte";
  import BrainCircuit from "@lucide/svelte/icons/brain-circuit";
  import Thermometer from "@lucide/svelte/icons/thermometer";
  import {
    Popover,
    Range,
    Select,
    Label,
    Checkbox,
    cn,
    Card,
  } from "flowbite-svelte";

  onMount(async () => {
    try {
      modelListState.isFetching = true;
      const reponse = await fetch(LIST_MODELS_URL);
      if (!reponse.ok) {
        modelListState.error = `Error fetching model list: ${reponse.status} ${reponse.statusText}`;
      }
      const modelList = (await reponse.json()) as { models: MODEL_LIST[] };
      modelListState.models = modelList.models;
      console.log("Fetched model list:", modelListState.models);
    } catch (error) {
      error = `Error fetching model list: ${error instanceof Error ? error.message : "Unknown error"}`;
    } finally {
      modelListState.isFetching = false;
    }
  });
</script>

<div class="mt-4 flex flex-row items-center gap-4 bg-transparent">
  <Select
    class="w-32"
    name="model-select"
    bind:value={chatBoxState.selectedModel}
    items={modelListState.models.map((m) => ({
      value: m.name,
      name: m.name,
    }))}
    placeholder={modelListState.isFetching
      ? "Getting models list..."
      : "Select a model"}
  />
  <Checkbox custom bind:checked={chatBoxState.think}>
    <BrainCircuit
      class={cn(
        "w-10 h-10 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-colors",
        {
          "text-primary-600 dark:text-primary-500 border-primary-500": chatBoxState.think,
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
  <p class="font-mono text-red-500 tabular">{modelListState.error}</p>
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
