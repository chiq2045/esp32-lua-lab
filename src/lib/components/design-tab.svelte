<script lang="ts">
	import CircuitCanvas from '#lib/components/circuit-canvas.svelte';
	import { projectState } from '#lib/state/project.svelte.ts';
	import type { CircuitComponent, WiringMode } from '#lib/types/project.ts';

	let selectedId = $state<string | null>(null);
	let error = $state('');

	const pins = [2, 4, 5, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33];

	let selected = $derived(projectState.project.components.find((item) => item.id === selectedId));

	function add(type: 'led' | 'button') {
		const component = projectState.addComponent(type);
		selectedId = component.id;
	}

	function rename(component: CircuitComponent, value: string) {
		const name = value.trim();

		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
			error = 'Use a valid Lua identifier.';
			return;
		}

		if (
			projectState.project.components.some((item) => item.id !== component.id && item.name === name)
		) {
			error = 'That component name already exists.';
			return;
		}

		error = '';
		projectState.updateComponent(component.id, { name });
	}

	function changePin(id: string, value: string) {
		error = '';

		try {
			projectState.setComponentPin(id, value === '' ? undefined : Number(value));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not assign pin.';
		}
	}
</script>

<div class="space-y-5">
	<header>
		<h2 class="text-xl font-semibold">Circuit Design</h2>
		<p class="text-sm opacity-70">Add components and arrange your circuit.</p>
	</header>

	<div class="flex flex-wrap items-center gap-3">
		<button class="rounded bg-blue-600 px-4 py-2 text-white" onclick={() => add('led')}>
			+ LED
		</button>

		<button class="rounded bg-blue-600 px-4 py-2 text-white" onclick={() => add('button')}>
			+ Button
		</button>

		<div class="ml-auto flex items-center gap-2">
			<label for="wiring-mode">Wiring</label>

			<select
				id="wiring-mode"
				class="rounded border p-2"
				value={projectState.project.wiringMode}
				onchange={(event) => {
					projectState.setWiringMode(event.currentTarget.value as WiringMode);
				}}
			>
				<option value="auto">Automatic</option>
				<option value="manual">Manual</option>
			</select>
		</div>
	</div>

	<div class="grid gap-4 lg:grid-cols-[1fr_260px]">
		<CircuitCanvas bind:selectedId />

		<aside class="space-y-4 rounded border bg-white p-4">
			{#if selected}
				<h3 class="font-semibold">Properties</h3>

				<div>
					<label for="component-name" class="mb-1 block text-sm"> Name </label>

					<input
						id="component-name"
						class="w-full rounded border p-2"
						value={selected.name}
						onchange={(event) => rename(selected, event.currentTarget.value)}
					/>
				</div>

				<p class="text-sm">
					Type: {selected.type === 'led' ? 'LED' : 'Button'}
				</p>

				{#if selected.type === 'led'}
					<div>
						<label for="led-color" class="mb-1 block text-sm"> Color </label>

						<select
							id="led-color"
							class="w-full rounded border p-2"
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
					</div>
				{/if}

				<div>
					<label for="gpio-pin" class="mb-1 block text-sm"> GPIO Pin </label>

					{#if projectState.project.wiringMode === 'manual'}
						<select
							id="gpio-pin"
							class="w-full rounded border p-2"
							value={selected.pin?.toString() ?? ''}
							onchange={(event) => changePin(selected.id, event.currentTarget.value)}
						>
							<option value="">Not connected</option>
							{#each pins as pin}
								<option value={pin}>GPIO {pin}</option>
							{/each}
						</select>
					{:else}
						<p class="rounded bg-slate-100 p-2 text-sm">
							{selected.pin !== undefined ? `GPIO ${selected.pin} (automatic)` : 'No available pin'}
						</p>
					{/if}
				</div>

				{#if error}
					<p class="text-sm text-red-600" role="alert">
						{error}
					</p>
				{/if}

				<button
					class="w-full rounded bg-red-600 px-3 py-2 text-white"
					onclick={() => {
						projectState.removeComponent(selected.id);
						selectedId = null;
						error = '';
					}}
				>
					Remove Component
				</button>
			{:else}
				<h3 class="font-semibold">Properties</h3>
				<p class="text-sm opacity-60">Select a component on the canvas to edit it.</p>
			{/if}
		</aside>
	</div>
</div>
