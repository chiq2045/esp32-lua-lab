<script lang="ts">
	import { onMount } from 'svelte';
	import { projectState } from '#lib/state/project.svelte.ts';
	import type { CircuitComponent } from '#lib/types/project.ts';

	let {
		selectedId = $bindable<string | null>(null)
	}: {
		selectedId?: string | null;
	} = $props();

	let canvas: HTMLDivElement;
	let dragging = $state<string | null>(null);
	let offset = { x: 0, y: 0 };

	const BOARD_WIDTH = 107;
	const BOARD_HEIGHT = 201;

	const componentWidth = 110;
	const componentHeight = 105;

	// Wokwi ESP32 DevKit V1 pin positions.
	// Values are relative to the board's top-left corner.
	// Derived from the board's 28.2mm x 53mm layout.
	const LEFT_PINS = [39, 36, 34, 35, 32, 33, 25, 26, 27, 14, 12, 13];

	const RIGHT_PINS = [23, 22, 1, 3, 21, 19, 18, 5, 17, 16, 4, 2, 15];

	const PIN_SPACING = 2.54 * (BOARD_HEIGHT / 53);
	const PIN_START_Y = 5.8 * (BOARD_HEIGHT / 53);

	let canvasWidth = $state(700);

	const board = $derived({
		x: Math.max(0, (canvasWidth - BOARD_WIDTH) / 2),
		y: 145,
		width: BOARD_WIDTH,
		height: BOARD_HEIGHT
	});

	type Point = {
		x: number;
		y: number;
	};

	function getBoardPin(pin: number | 'GND'): Point | null {
		if (pin === 'GND') {
			return {
				x: board.x + BOARD_WIDTH * (26.8 / 28.2),
				y: board.y + BOARD_HEIGHT * (38.82 / 53)
			};
		}

		const leftIndex = LEFT_PINS.indexOf(pin);

		if (leftIndex !== -1) {
			return {
				x: board.x + BOARD_WIDTH * (1.27 / 28.2),
				y: board.y + PIN_START_Y + (leftIndex + 1) * PIN_SPACING
			};
		}

		const rightIndex = RIGHT_PINS.indexOf(pin);

		if (rightIndex !== -1) {
			return {
				x: board.x + BOARD_WIDTH * (26.8 / 28.2),
				y: board.y + PIN_START_Y + rightIndex * PIN_SPACING
			};
		}

		return null;
	}

	function getComponentPin(component: CircuitComponent): Point {
		// Approximate connection point on the component graphic.
		// We'll refine these for LED anode/cathode and button terminals.
		return {
			x: component.x + componentWidth / 2,
			y: component.y + 34
		};
	}

	function getWirePath(component: CircuitComponent): string {
		if (component.pin === undefined) return '';

		const start = getBoardPin(component.pin);
		if (!start) return '';

		const end = getComponentPin(component);

		const direction = end.x < start.x ? -1 : 1;
		const bend = Math.max(30, Math.abs(end.x - start.x) / 2);

		return [
			`M ${start.x} ${start.y}`,
			`C ${start.x + bend * direction} ${start.y},`,
			`${end.x - bend * direction} ${end.y},`,
			`${end.x} ${end.y}`
		].join(' ');
	}

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

<div class="circuit-canvas" bind:this={canvas} bind:clientWidth={canvasWidth}>
	<!-- Logical GPIO wires -->

	<!-- Wires connected to ESP32 GPIO pins -->
	<svg class="wire-layer" aria-hidden="true">
		{#each components.filter((c) => c.pin !== undefined) as component (component.id)}
			{#if getBoardPin(component.pin!)}
				<path
					d={getWirePath(component)}
					fill="none"
					stroke="#5e81ac"
					stroke-width="2.5"
					stroke-linecap="round"
				/>

				{@const point = getBoardPin(component.pin!)}

				{#if point}
					<circle cx={point.x} cy={point.y} r="3.5" fill="#5e81ac" />
				{/if}
			{/if}
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
		width: 107px;
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
	}

	.esp32-board wokwi-esp32-devkit-v1 {
		display: block;
		transform: none;
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
