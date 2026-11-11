<script lang="ts">
	import { projectState } from '#lib/state/project.svelte.ts';
	import type { CircuitComponent, WiringMode } from '#lib/types/project.ts';

	let selectedId = $state<string | null>(null);

	let selected = $derived(
		projectState.project.components.find((component) => component.id === selectedId)
	);

	function rename(component: CircuitComponent, name: string) {
		const value = name.trim();

		// Names must be valid Lua identifiers.
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
			return;
		}

		if (
			projectState.project.components.some(
				(other) => other.id !== component.id && other.name === value
			)
		) {
			return;
		}

		projectState.updateComponent(component.id, {
			name: value
		});
	}
</script>

<div class="space-y-6">
	<header>
		<h2 class="text-xl font-semibold">Circuit Design</h2>
		<p class="text-sm opacity-70">Add components that your Lua program can control.</p>
	</header>

	<div class="flex flex-wrap gap-2">
		<button
			class="rounded bg-blue-600 px-4 py-2 text-white"
			onclick={() => projectState.addComponent('led')}
		>
			+ Add LED
		</button>

		<button
			class="rounded bg-blue-600 px-4 py-2 text-white"
			onclick={() => projectState.addComponent('button')}
		>
			+ Add Button
		</button>
	</div>

	<div class="flex items-center gap-3">
		<label for="wiring-mode">Wiring mode</label>

		<select
			id="wiring-mode"
			class="rounded border p-2"
			value={projectState.project.wiringMode}
			onchange={(event) => projectState.setWiringMode(event.currentTarget.value as WiringMode)}
		>
			<option value="auto">Automatic</option>
			<option value="manual">Manual</option>
		</select>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<h3 class="font-semibold">Components</h3>

			{#each projectState.project.components as component (component.id)}
				<button
					class="block w-full rounded border p-3 text-left"
					class:bg-blue-100={selectedId === component.id}
					onclick={() => (selectedId = component.id)}
				>
					<strong>{component.name}</strong>
					<span class="ml-2 text-sm opacity-60">
						{component.type}
					</span>
				</button>
			{:else}
				<p class="text-sm opacity-60">No components yet. Add an LED or button.</p>
			{/each}
		</div>

		<div class="rounded border p-4">
			{#if selected}
				<h3 class="mb-4 font-semibold">Component Properties</h3>

				<label class="mb-2 block text-sm" for="component-name">Component name</label>

				<input
					id="component-name"
					class="mb-4 w-full rounded border p-2"
					value={selected.name}
					onchange={(event) => rename(selected, event.currentTarget.value)}
				/>

				<p class="mb-4 text-sm">
					GPIO: {selected.pin ?? 'Not assigned'}
				</p>

				{#if selected.type === 'led'}
					<label class="mb-2 block text-sm" for="led-color">LED color</label>

					<select
						id="led-color"
						class="mb-4 w-full rounded border p-2"
						value={selected.color ?? 'red'}
						onchange={(event) =>
							projectState.updateComponent(selected.id, {
								color: event.currentTarget.value
							})}
					>
						<option value="red">Red</option>
						<option value="green">Green</option>
						<option value="blue">Blue</option>
						<option value="yellow">Yellow</option>
					</select>
				{/if}

				<button
					class="rounded bg-red-600 px-3 py-2 text-white"
					onclick={() => {
						projectState.removeComponent(selected.id);
						selectedId = null;
					}}
				>
					Remove Component
				</button>
			{:else}
				<p class="text-sm opacity-60">Select a component to edit its properties.</p>
			{/if}
		</div>
	</div>
</div>
