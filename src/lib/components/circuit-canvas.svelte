<script lang="ts">
	import { onMount } from 'svelte';
	import { projectState } from '#lib/state/project.svelte.ts';

	let {
		selectedId = $bindable<string | null>(null)
	}: {
		selectedId?: string | null;
	} = $props();

	let canvas: HTMLDivElement;
	let dragging = $state<string | null>(null);
	let offset = { x: 0, y: 0 };

	const board = { x: 35, y: 95, width: 110, height: 210 };
	const componentWidth = 110;
	const componentHeight = 105;

	const components = $derived(projectState.project.components);

	function startDrag(event: PointerEvent, id: string) {
		if (event.button !== 0) return;

		const component = components.find((item) => item.id === id);
		if (!component) return;

		selectedId = id;
		dragging = id;

		const rect = canvas.getBoundingClientRect();

		offset = {
			x: event.clientX - rect.left - component.x,
			y: event.clientY - rect.top - component.y
		};

		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function drag(event: PointerEvent) {
		if (!dragging) return;

		const rect = canvas.getBoundingClientRect();

		const x = Math.max(
			0,
			Math.min(rect.width - componentWidth, event.clientX - rect.left - offset.x)
		);

		const y = Math.max(
			0,
			Math.min(rect.height - componentHeight, event.clientY - rect.top - offset.y)
		);

		projectState.moveComponent(dragging, x, y);
	}

	function stopDrag() {
		dragging = null;
	}

	onMount(async () => {
		await import('@wokwi/elements');
	});
</script>

<div class="circuit-canvas" bind:this={canvas}>
	<!-- Logical GPIO wires -->
	<svg class="wire-layer" aria-hidden="true">
		{#each components.filter((c) => c.pin !== undefined) as component (component.id)}
			<path
				d={`M ${board.x + board.width} ${board.y + 50}
            C ${board.x + 210} ${board.y + 50},
              ${component.x - 70} ${component.y + 50},
              ${component.x} ${component.y + 50}`}
				fill="none"
				stroke="#5e81ac"
				stroke-width="3"
				stroke-linecap="round"
			/>
		{/each}
	</svg>

	<!-- ESP32 -->
	<div class="esp32-board" style:left={`${board.x}px`} style:top={`${board.y}px`}>
		<wokwi-esp32-devkit-v1></wokwi-esp32-devkit-v1>
		<span class="board-label">ESP32</span>
	</div>

	<!-- Components -->
	{#each components as component (component.id)}
		<div
			class="circuit-component"
			class:selected={selectedId === component.id}
			class:dragging={dragging === component.id}
			style:left={`${component.x}px`}
			style:top={`${component.y}px`}
			role="button"
			tabindex="0"
			aria-label={`Select ${component.name}`}
			onpointerdown={(event) => startDrag(event, component.id)}
			onpointermove={drag}
			onpointerup={stopDrag}
			onpointercancel={stopDrag}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					selectedId = component.id;
				}
			}}
		>
			{#if component.type === 'led'}
				<wokwi-led color={component.color ?? 'red'}></wokwi-led>
			{:else}
				<wokwi-pushbutton color="green"></wokwi-pushbutton>
			{/if}

			<span class="component-name">{component.name}</span>

			<span class="component-pin">
				{component.pin !== undefined ? `GPIO ${component.pin}` : 'Not connected'}
			</span>
		</div>
	{/each}
</div>

<style>
	.circuit-canvas {
		position: relative;
		width: 100%;
		min-height: 520px;
		overflow: auto;
		border: 1px solid #cbd5e1;
		border-radius: 12px;
		background-color: #f8fafc;
		background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
		background-size: 20px 20px;
	}

	.wire-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}

	.esp32-board {
		position: absolute;
		width: 110px;
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
	}

	.esp32-board wokwi-esp32-devkit-v1 {
		display: block;
		transform: scale(0.8);
		transform-origin: top center;
	}

	.board-label {
		font-size: 12px;
		font-weight: 600;
	}

	.circuit-component {
		position: absolute;
		width: 110px;
		min-height: 105px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		cursor: grab;
		user-select: none;
		touch-action: none;
		border: 2px solid transparent;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.9);
	}

	.circuit-component.selected {
		border-color: #5e81ac;
		background: #e5eef8;
	}

	.circuit-component.dragging {
		cursor: grabbing;
	}

	.component-name {
		font-size: 13px;
		font-weight: 600;
	}

	.component-pin {
		font-size: 11px;
		color: #64748b;
	}

	wokwi-led,
	wokwi-pushbutton {
		pointer-events: none;
	}
</style>
