import type {
	Project,
	CircuitComponent,
	ComponentType,
	WiringMode,
	ConsoleMessage
} from '#lib/types/project.ts';

const STORAGE_KEY = 'esp32-lua-lab-project';
const MAX_MESSAGES = 200;

const AUTO_PINS = [2, 4, 5, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33];

function createDefaultProject(): Project {
	return {
		version: 1,
		id: crypto.randomUUID(),
		name: 'Untitled Project',
		code: `-- Welcome to ESP32 Lua Lab!
-- Add an LED in the Design tab.`,
		components: [],
		wires: [],
		wiringMode: 'auto',
		updatedAt: Date.now()
	};
}

function createProjectState() {
	let project = $state<Project>(createDefaultProject());
	let messages = $state<ConsoleMessage[]>([]);
	let dirty = $state(false);

	function touch() {
		project.updatedAt = Date.now();
		dirty = true;
	}

	function uniqueName(type: ComponentType) {
		const base = type === 'led' ? 'led' : 'button';
		let number = 1;

		while (project.components.some((component) => component.name === `${base}${number}`)) {
			number++;
		}

		return `${base}${number}`;
	}

	function nextPin(): number | undefined {
		const used = new Set(
			project.components
				.map((component) => component.pin)
				.filter((pin): pin is number => typeof pin === 'number')
		);

		return AUTO_PINS.find((pin) => !used.has(pin));
	}

	function addComponent(type: ComponentType) {
		const component: CircuitComponent = {
			id: crypto.randomUUID(),
			type,
			name: uniqueName(type),
			x: 100 + (project.components.length % 4) * 140,
			y: 100 + Math.floor(project.components.length / 4) * 120,
			...(type === 'led' ? { color: 'red' } : {})
		};

		if (project.wiringMode === 'auto') {
			component.pin = nextPin();
		}

		project.components.push(component);
		rebuildWires();
		touch();

		return component;
	}

	function updateComponent(id: string, changes: Partial<Pick<CircuitComponent, 'name' | 'color'>>) {
		const component = project.components.find((item) => item.id === id);

		if (!component) return;

		Object.assign(component, changes);
		touch();
	}

	function removeComponent(id: string) {
		project.components = project.components.filter((component) => component.id !== id);

		project.wires = project.wires.filter((wire) => wire.componentId !== id);
		rebuildWires();
		touch();
	}

	function setWiringMode(mode: WiringMode) {
		project.wiringMode = mode;

		if (mode === 'auto') {
			// Reassign unique pins.
			project.components.forEach((component, index) => {
				component.pin = AUTO_PINS[index];
			});
		}

		touch();
	}

	function setCode(code: string) {
		project.code = code;
		touch();
	}

	function setName(name: string) {
		project.name = name;
		touch();
	}

	function save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(project)));

		dirty = false;
	}

	function load() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;

		try {
			const parsed = JSON.parse(stored) as Project;

			if (parsed.version !== 1) {
				throw new Error('Unsupported project version');
			}

			project = parsed;
			dirty = false;
		} catch (error) {
			addMessage('error', 'Could not load saved project.');
		}
	}

	function addMessage(level: ConsoleMessage['level'], text: string) {
		messages.push({
			id: crypto.randomUUID(),
			level,
			text: text.slice(0, 500),
			timestamp: Date.now()
		});

		if (messages.length > MAX_MESSAGES) {
			messages.splice(0, messages.length - MAX_MESSAGES);
		}
	}

	function clearMessages() {
		messages = [];
	}

	function exportProject() {
		const data = JSON.stringify($state.snapshot(project), null, 2);

		const blob = new Blob([data], {
			type: 'application/json'
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'esp32-project.json';
		link.click();

		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function importProject(file: File) {
		const text = await file.text();
		const data: unknown = JSON.parse(text);

		// Basic validation for the project format.
		if (
			typeof data !== 'object' ||
			data === null ||
			!('version' in data) ||
			data.version !== 1 ||
			!('components' in data) ||
			!Array.isArray(data.components) ||
			!('wires' in data) ||
			!Array.isArray(data.wires) ||
			!('code' in data) ||
			typeof data.code !== 'string' ||
			!('wiringMode' in data) ||
			!['auto', 'manual'].includes(String(data.wiringMode))
		) {
			throw new Error('Invalid ESP32 project file');
		}

		// A full schema validator should be added before
		// importing files from untrusted sources.
		project = data as unknown as Project;
		touch();
	}

	function rebuildWires() {
		project.wires = project.components.flatMap((component) => {
			if (component.pin === undefined) return [];

			return [
				{
					id: `${component.id}-signal`,
					componentId: component.id,
					pin: component.pin,
					kind: 'signal' as const
				},
				{
					id: `${component.id}-ground`,
					componentId: component.id,
					pin: 'GND' as const,
					kind: 'ground' as const
				}
			];
		});
	}

	function setComponentPin(id: string, pin?: number) {
		const component = project.components.find((item) => item.id === id);

		if (!component) return;

		if (
			pin !== undefined &&
			project.components.some((item) => item.id !== id && item.pin === pin)
		) {
			throw new Error(`GPIO ${pin} is already assigned.`);
		}

		component.pin = pin;
		rebuildWires();
		touch();
	}

	function moveComponent(id: string, x: number, y: number) {
		const component = project.components.find((item) => item.id === id);

		if (!component) return;

		component.x = Math.max(0, Math.round(x));
		component.y = Math.max(0, Math.round(y));

		touch();
	}

	return {
		get project() {
			return project;
		},
		get messages() {
			return messages;
		},
		get dirty() {
			return dirty;
		},

		addComponent,
		updateComponent,
		removeComponent,
		setWiringMode,
		setCode,
		setName,
		save,
		load,
		addMessage,
		clearMessages,
		setComponentPin,
		moveComponent
	};
}

export const projectState = createProjectState();
