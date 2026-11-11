import type { ComponentType } from '#lib/types/project.ts';

export interface LuaMethod {
	name: string;
	description: string;
	returns?: string;
	args?: string[];
}

export const componentMethods: Record<ComponentType, LuaMethod[]> = {
	led: [
		{
			name: 'turnOn',
			description: 'Turn this LED on'
		},
		{
			name: 'turnOff',
			description: 'Turn this LED off'
		},
		{
			name: 'isOn',
			description: 'Check whether this LED is on',
			returns: 'boolean'
		}
	],

	button: [
		{
			name: 'isPressed',
			description: 'Check whether the button is pressed',
			returns: 'boolean'
		}
	]
};

export const luaGlobals = [
	{
		name: 'wait',
		description: 'Pause execution for a number of seconds',
		args: ['seconds']
	},
	{
		name: 'print',
		description: 'Print a message to the console',
		args: ['value']
	}
];

export const luaKeywords = [
	'and',
	'break',
	'do',
	'else',
	'elseif',
	'end',
	'false',
	'for',
	'function',
	'if',
	'in',
	'local',
	'nil',
	'not',
	'or',
	'repeat',
	'return',
	'then',
	'true',
	'until',
	'while'
];
