<script lang="ts">
	import { tick } from 'svelte';
	import { projectState } from '#lib/state/project.svelte.ts';

	let output: HTMLDivElement;
	let autoScroll = $state(true);

	const messages = $derived(projectState.messages);

	// Scroll to the newest message when output changes.
	$effect(() => {
		messages.length;

		if (autoScroll) {
			tick().then(() => {
				output?.scrollTo({
					top: output.scrollHeight,
					behavior: 'instant'
				});
			});
		}
	});
</script>

<div class="flex h-full min-h-0 flex-col gap-3 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Console</h2>
			<p class="text-sm opacity-60">Output from your Lua program</p>
		</div>

		<div class="flex items-center gap-3">
			<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={autoScroll} />
				Auto-scroll
			</label>

			<button class="btn btn-outline btn-sm" onclick={() => projectState.clearMessages()}>
				Clear
			</button>
		</div>
	</div>

	<div
		bind:this={output}
		class="min-h-0 flex-1 overflow-y-auto rounded-lg bg-base-300 p-4 font-mono text-sm"
		role="log"
		aria-label="Lua console output"
	>
		{#if messages.length === 0}
			<p class="opacity-50">Run your program to see output here.</p>
		{:else}
			{#each messages as message, index (index)}
				<div class="py-0.5 wrap-break-word whitespace-pre-wrap">
					{message.text}
				</div>
			{/each}
		{/if}
	</div>
</div>
