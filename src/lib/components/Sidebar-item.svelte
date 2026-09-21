<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";
  import { SidebarItem, cn } from "flowbite-svelte";

  type Props = {
    Icon: LucideIcon;
    label: string;
    isCollapsed?: boolean;
    href?: string;
  };

  let { Icon, label, isCollapsed = false, href = "/" }: Props = $props();
</script>

<SidebarItem
  {label}
  {href}
  title={isCollapsed ? label : undefined}
  spanClass={cn(
    "whitespace-nowrap overflow-hidden text-foreground-500 transition-all duration-300",
    isCollapsed
      ? "max-w-0 opacity-0 ms-0 pointer-events-none"
      : "max-w-full opacity-100 ms-3",
  )}
  aClass={cn(
    "transition-colors duration-200",
    isCollapsed ? "justify-center px-0" : "",
  )}
>
  {#snippet icon()}
    <Icon
      class="h-5 w-5 text-foreground-500 shrink-0 transition duration-75 dark:group-hover:text-white"
    />
  {/snippet}
</SidebarItem>
