<script lang="ts">
	import { tick } from 'svelte';
	import { projectState } from '#lib/state/project.svelte.ts';
	import { simulator } from '#lib/simulator/simulator.svelte.ts';

	let output = $state<HTMLDivElement | null>(null);
	let expanded = $state(true);

	const messages = $derived(projectState.messages.slice(simulator.messageStartIndex));

	$effect(() => {
		// Track changes to the message collection.
		messages.length;

		if (expanded) {
			tick().then(() => {
				output?.scrollTo({
					top: output.scrollHeight,
					behavior: 'instant'
				});
			});
		}
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-200">
	<div class="flex items-center justify-between px-3 py-2">
		<button
			class="flex items-center gap-2 text-sm font-semibold"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
		>
			<span>{expanded ? '▾' : '▸'}</span>
			Console
			<span class="badge badge-ghost badge-sm">
				{messages.length}
			</span>
		</button>

		<button class="btn btn-ghost btn-xs" onclick={() => projectState.clearMessages()}>
			Clear
		</button>
	</div>

	{#if expanded}
		<div
			bind:this={output}
			class="h-36 overflow-y-auto border-t border-base-300 bg-base-300 p-3 font-mono text-xs"
			role="log"
			aria-label="Simulation console output"
		>
			{#if messages.length === 0}
				<span class="opacity-50"> No output yet. Use print() in your Lua code. </span>
			{:else}
				{#each messages as message, index (index)}
					<div class="py-0.5 wrap-break-word whitespace-pre-wrap">
						{message.text}
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
