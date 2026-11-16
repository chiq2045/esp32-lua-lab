<script lang="ts">
	import { projectState } from '#lib/state/project.svelte.ts';
	import { onMount } from 'svelte';
	import { simulator } from './simulator.svelte';
	import Modal from '#lib/components/modal.svelte';
	import MiniConsole from '#lib/components/mini-console.svelte';

	let {
		dialog = $bindable()
	}: {
		dialog: HTMLDialogElement | null;
	} = $props();

	let loaded = $state(false);

	onMount(() => {
		import('@wokwi/elements').then(() => {
			loaded = true;
		});

		return () => {
			// Ensure buttons cannot remain pressed after closing.
			for (const component of projectState.project.components) {
				if (component.type === 'button') {
					simulator.setButton(component.id, false);
				}
			}
		};
	});

	const formatElapsed = (ms: number) => {
		return (ms / 1000).toFixed(1) + 's';
	};
</script>

{#snippet dialogContent()}
	<div class="flex items-center justify-between gap-2">
		{#if simulator.status === 'running'}
			<span class="badge badge-success">Status: {simulator.status}</span>
		{:else if simulator.status === 'error'}
			<span class="badge badge-error">Status: {simulator.status}</span>
		{:else}
			<span class="badge badge-info">Status: {simulator.status}</span>
		{/if}
		<span>Elapsed: {formatElapsed(simulator.elapsedMs)}</span>
		<form method="dialog">
			<button class="btn btn-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
					/>
				</svg>
				Stop
			</button>
		</form>
	</div>
	<div class="overflow-auto p-2">
		<div
			class="relative min-h-125 rounded-md border bg-slate-50"
			style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;"
		>
			<div class="absolute top-16 left-8">
				<wokwi-esp32-devkit-v1></wokwi-esp32-devkit-v1>
			</div>

			{#each projectState.project.components as component (component.id)}
				<div
					class="absolute flex flex-col items-center gap-2 rounded-md bg-white/80 p-3"
					style:left={`${component.x}px`}
					style:top={`${component.y}px`}
				>
					{#if component.type === 'led'}
						<wokwi-led
							color={component.color ?? 'red'}
							value={simulator.ledStates[component.id] ?? false}
						></wokwi-led>
					{:else}
						<button
							class="rounded p-2"
							disabled={simulator.status !== 'running'}
							onpointerdown={() => simulator.setButton(component.id, true)}
							onpointerup={() => simulator.setButton(component.id, false)}
							onpointercancel={() => simulator.setButton(component.id, false)}
							onpointerleave={() => simulator.setButton(component.id, false)}
							aria-label={`Press ${component.name}`}
						>
							<wokwi-pushbutton color="green"></wokwi-pushbutton>
						</button>
					{/if}
					<span class="font-mono text-sm">
						{component.name}
					</span>
					<span class="text-xs text-slate-500">
						GPIO {component.pin ?? 'unassigned'}
					</span>
				</div>
			{/each}
		</div>
	</div>
	<MiniConsole />
	{#if !loaded}
		<p class="p-4">Loading circuit components...</p>
	{/if}
{/snippet}

<Modal
	bind:dialog
	title="Simulation"
	content={dialogContent}
	fullWidth
	onClose={() => simulator.stop()}
/>
