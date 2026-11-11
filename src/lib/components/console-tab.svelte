<script lang="ts">
	import { projectState } from '#lib/state/project.svelte.ts';
</script>

<div class="space-y-4">
	<header class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Console</h2>

		<button class="rounded border px-3 py-2" onclick={() => projectState.clearMessages()}>
			Clear
		</button>
	</header>

	<div
		class="h-96 overflow-auto rounded bg-slate-950 p-4
           font-mono text-sm text-slate-200"
		role="log"
		aria-live="off"
	>
		{#each projectState.messages as message (message.id)}
			<div class="mb-1">
				<span class="text-slate-500">
					{new Date(message.timestamp).toLocaleTimeString()}
				</span>

				<span
					class:text-red-400={message.level === 'error'}
					class:text-green-400={message.level === 'output'}
				>
					{message.text}
				</span>
			</div>
		{:else}
			<p class="text-slate-500">Console output will appear here.</p>
		{/each}
	</div>
</div>
