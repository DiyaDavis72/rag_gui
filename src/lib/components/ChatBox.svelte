<script>
  let message = $state("");
</script>

<textarea
  class="min-h-32 p-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 focus:outline-hidden resize-none"
  bind:value={message}
  placeholder="Enter your query here..."
></textarea>
