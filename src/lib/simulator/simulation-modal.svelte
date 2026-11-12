<script lang="ts">
	import { projectState } from '#lib/state/project.svelte.ts';
	import { onMount } from 'svelte';
	import { simulator } from './simulator.svelte';

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

<dialog
	bind:this={dialog}
	class="modal modal-bottom sm:modal-middle"
	aria-label="Running simulation"
>
	<div class="modal-box">
		<div class="flex items-center justify-between gap-2">
			<h2 class="text-xl font-semibold">Simulation</h2>
			<p class="flex flex-col gap-1 text-sm text-slate-500">
				<span>Status: {simulator.status}</span>
				<span>Elapsed: {formatElapsed(simulator.elapsedMs)}</span>
			</p>
			<button
				class="rounded bg-red-600 px-4 py-2 text-white"
				disabled={simulator.status !== 'running'}
				onclick={() => {
					console.log('stop');
					simulator.stop();
				}}
			>
				Stop
			</button>
		</div>
		<div class="overflow-auto p-4">
			<div
				class="relative min-h-125 min-w-187.5
               rounded-lg border bg-slate-50"
				style="background-image:
          radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 20px 20px;"
			>
				<div class="absolute top-16 left-8">
					<wokwi-esp32-devkit-v1></wokwi-esp32-devkit-v1>
				</div>

				{#each projectState.project.components as component (component.id)}
					<div
						class="absolute flex flex-col items-center
                   gap-2 rounded-lg bg-white/90 p-3"
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

		{#if !loaded}
			<p class="p-4 text-sm text-slate-500">Loading circuit components...</p>
		{/if}
		<form method="dialog" class="modal-backdrop">
			<button onclick={() => simulator.stop()}>Close</button>
		</form>
	</div>
</dialog>
