export type ComponentType = 'led' | 'button';
export type WiringMode = 'auto' | 'manual';

export interface CircuitComponent {
	id: string;
	type: ComponentType;
	name: string;
	x: number;
	y: number;
	pin?: number;
	color?: string;
}

export interface RuntimeComponent extends CircuitComponent {
	on: boolean;
	pressed: boolean;
}

export interface CircuitWire {
	id: string;
	componentId: string;
	pin: number | 'GND';
	kind: 'signal' | 'ground';
}

export interface ConsoleMessage {
	id: string;
	level: 'info' | 'output' | 'error';
	text: string;
	timestamp: number;
}

export interface Project {
	version: 1;
	id: string;
	name: string;
	code: string;
	components: CircuitComponent[];
	wires: CircuitWire[];
	wiringMode: WiringMode;
	updatedAt: number;
}

export type SavedProjects = Record<string, Project>;
