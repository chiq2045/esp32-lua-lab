import type { ComponentType } from '#lib/types/project.ts';

export interface CircuitComponent {
	id: string;
	name: string;
	type: ComponentType;
	pin?: number;
	x: number;
	y: number;
}
export type ComponentAPI = Record<
	ComponentType,
	{
		name: string;
		signature: string;
		description: string;
		returns: string;
	}[]
>;

export const componentAPI = {
	led: [
		{
			name: 'turnOn',
			signature: 'turnOn()',
			description: 'Turn the LED on',
			returns: 'void'
		},
		{
			name: 'turnOff',
			signature: 'turnOff()',
			description: 'Turn the LED off',
			returns: 'void'
		},
		{
			name: 'isOn',
			signature: 'isOn()',
			description: 'Check whether the LED is on',
			returns: 'boolean'
		}
	],
	button: [
		{
			name: 'isPressed',
			signature: 'isPressed()',
			description: 'Check whether the button is on',
			returns: 'boolean'
		}
	]
} satisfies ComponentAPI;
