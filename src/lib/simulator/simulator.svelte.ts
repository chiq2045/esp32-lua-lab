import { projectState } from '#lib/state/project.svelte.ts';
import type { WorkerInput, WorkerOutput } from '#lib/types/messages.ts';
import type { CircuitComponent } from './component-api';

const MAX_RUNTIME_MS = 5 * 60 * 1000;

const createSimulator = () => {
	let worker: Worker | null = null;

	let status = $state<'idle' | 'running' | 'finished' | 'error' | 'stopped'>('idle');

	let startedAt = $state<number | null>(null);
	let elapsedMs = $state(0);
	let ledStates = $state<Record<string, boolean>>({});
	let buttonStates = $state<Record<string, boolean>>({});

	let runtimeTimer: ReturnType<typeof setTimeout> | null = null;
	let clockTimer: ReturnType<typeof setInterval> | null = null;

	const cleanup = () => {
		if (runtimeTimer !== null) clearTimeout(runtimeTimer);
		if (clockTimer !== null) clearInterval(clockTimer);

		runtimeTimer = null;
		clockTimer = null;

		worker?.terminate();
		worker = null;
	};

	const stop = (reason = 'Simulation stopped.') => {
		const wasRunning = status === 'running';

		cleanup();
		buttonStates = {};

		if (wasRunning) {
			status = 'stopped';
			projectState.addMessage('info', reason);
		}
	};

	const handleMessage = (message: WorkerOutput) => {
		switch (message.type) {
			case 'started':
				status = 'running';
				projectState.addMessage('info', 'Simulation started.');
				break;

			case 'component':
				ledStates[message.id] = message.on;
				break;

			case 'serial':
				projectState.addMessage('output', message.message);
				break;

			case 'error':
				status = 'error';
				projectState.addMessage('error', message.message);
				cleanup();
				break;

			case 'finished':
				status = 'finished';
				projectState.addMessage('info', 'Program finished.');
				cleanup();
				break;
		}
	};

	const run = (code: string, components: CircuitComponent[]) => {
		cleanup();

		status = 'idle';
		elapsedMs = 0;
		startedAt = Date.now();
		ledStates = {};
		buttonStates = {};

		const currentWorker = new Worker(new URL('./lua.worker.ts', import.meta.url), {
			type: 'module'
		});

		worker = currentWorker;

		currentWorker.onmessage = (event: MessageEvent<WorkerOutput>) => {
			if (worker !== currentWorker) return;
			handleMessage(event.data);
		};

		currentWorker.onerror = (event) => {
			if (worker !== currentWorker) return;

			projectState.addMessage('error', event.message || 'Worker failed.');
			console.log(event);
			status = 'error';
			cleanup();
		};

		const message: WorkerInput = {
			type: 'run',
			code,
			components: $state.snapshot(components)
		};

		// Set running immediately, so the modal shows
		// a running state while the worker initializes.
		status = 'running';
		currentWorker.postMessage(message);

		clockTimer = setInterval(() => {
			if (startedAt !== null) {
				elapsedMs = Date.now() - startedAt;
			}
		}, 100);

		runtimeTimer = setTimeout(() => {
			stop('Simulation stopped: five-minute time limit.');
		}, MAX_RUNTIME_MS);
	};

	const setButton = (id: string, pressed: boolean) => {
		if (status !== 'running' || !worker) return;

		buttonStates[id] = pressed;

		const message: WorkerInput = {
			type: 'button',
			id,
			pressed
		};

		worker.postMessage(message);
	};

	return {
		get status() {
			return status;
		},
		get elapsedMs() {
			return elapsedMs;
		},
		get ledStates() {
			return ledStates;
		},
		get buttonStates() {
			return buttonStates;
		},

		run,
		stop,
		setButton
	};
};

export const simulator = createSimulator();
