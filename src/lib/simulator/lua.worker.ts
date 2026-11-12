// @ts-expect-error Fengari does not have delaration files
import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari-web';

import { LUA_BOOTSTRAP } from './lua-bootstrap';

import type { WorkerInput, WorkerOutput } from '#lib/types/messages.ts';

import type { CircuitComponent, RuntimeComponent } from '#lib/types/project.ts';

const MIN_WAIT_MS = 20;
const MAX_WAIT_MS = 60_000;

let components = new Map<string, RuntimeComponent>();
let thread: any = null;
let state: any = null;
let resumeTimer: ReturnType<typeof setTimeout> | null = null;
let nextDelay = 0;
let active = false;

const send = (message: WorkerOutput) => {
	self.postMessage(message);
};

const luaText = (L: any, index: number): string => {
	const value = lua.lua_tostring(L, index);
	return value ? to_jsstring(value) : '';
};

const register = (L: any, name: string, fn: (L: any) => number) => {
	lua.lua_pushcfunction(L, fn);
	lua.lua_setglobal(L, to_luastring(name));
};

const getComponent = (name: string, type: 'led' | 'button'): RuntimeComponent => {
	const component = components.get(name);

	if (!component || component.type !== type) {
		throw new Error(`Component "${name}" is not a ${type} in Design.`);
	}

	return component;
};

const installFunctions = (L: any) => {
	register(L, '__setLED', (L) => {
		const name = luaText(L, 1);
		const on = lua.lua_toboolean(L, 2);
		const component = getComponent(name, 'led');

		if (component.on !== on) {
			component.on = on;

			send({
				type: 'component',
				id: component.id,
				on
			});
		}

		return 0;
	});

	register(L, '__isPressed', (L) => {
		const name = luaText(L, 1);
		const component = getComponent(name, 'button');

		lua.lua_pushboolean(L, component.pressed);
		return 1;
	});

	register(L, 'print', (L) => {
		const count = lua.lua_gettop(L);
		const values: string[] = [];

		// Lua's tostring handles numbers, booleans,
		// strings, nil, and tables.
		lua.lua_getglobal(L, to_luastring('tostring'));

		const tostringIndex = lua.lua_gettop(L);

		for (let i = 1; i <= count; i++) {
			lua.lua_pushvalue(L, tostringIndex);
			lua.lua_pushvalue(L, i);
			lua.lua_call(L, 1, 1);

			values.push(luaText(L, -1));
			lua.lua_pop(L, 1);
		}

		lua.lua_pop(L, 1);

		send({
			type: 'serial',
			message: values.join('\\t').slice(0, 500)
		});

		return 0;
	});

	register(L, '__scheduleWait', (L) => {
		const seconds = lauxlib.luaL_checknumber(L, 1);

		if (!Number.isFinite(seconds) || seconds < 0) {
			return lauxlib.luaL_error(L, to_luastring('wait() requires a non-negative number'));
		}

		nextDelay = Math.min(Math.max(seconds * 1000, MIN_WAIT_MS), MAX_WAIT_MS);

		return 0;
	});
};

const loadChunk = (L: any, source: string) => {
	const status = lauxlib.luaL_loadstring(L, to_luastring(source));

	if (status !== lua.LUA_OK) {
		throw new Error(luaText(L, -1));
	}

	const result = lua.lua_pcall(L, 0, 0, 0);

	if (result !== lua.LUA_OK) {
		throw new Error(luaText(L, -1));
	}
};

const resume = () => {
	if (!thread || !active) return;

	resumeTimer = null;

	let status: number;

	try {
		status = lua.lua_resume(thread, null, 0);
	} catch (error) {
		active = false;
		send({
			type: 'error',
			message: error instanceof Error ? error.message : String(error)
		});
		return;
	}

	if (status === lua.LUA_YIELD) {
		resumeTimer = setTimeout(resume, nextDelay);
		return;
	}

	active = false;

	if (status === lua.LUA_OK) {
		send({ type: 'finished' });
		return;
	}

	const message = luaText(thread, -1);

	console.error('Lua runtime error:', message);

	send({
		type: 'error',
		message
	});
};

const run = (code: string, circuit: CircuitComponent[]) => {
	if (resumeTimer !== null) {
		clearTimeout(resumeTimer);
		resumeTimer = null;
	}

	active = false;
	thread = null;
	state = null;
	nextDelay = 0;
	components.clear();

	for (const component of circuit) {
		if (components.has(component.name)) {
			send({
				type: 'error',
				message: `Duplicate component: ${component.name}`
			});
			return;
		}

		components.set(component.name, {
			...component,
			on: false,
			pressed: false
		});
	}

	try {
		state = lauxlib.luaL_newstate();
		lualib.luaL_openlibs(state);

		installFunctions(state);

		// Pass Design components to Lua.
		lua.lua_newtable(state);

		for (const component of circuit) {
			lua.lua_pushstring(state, to_luastring(component.type));

			lua.lua_setfield(state, -2, to_luastring(component.name));
		}

		lua.lua_setglobal(state, to_luastring('__components'));

		// Install LED, button and wait APIs.
		loadChunk(state, LUA_BOOTSTRAP);

		// Create the coroutine.
		thread = lua.lua_newthread(state);

		// Load student code exactly once.
		const status = lauxlib.luaL_loadstring(thread, to_luastring(code));

		if (status !== lua.LUA_OK) {
			throw new Error(luaText(thread, -1));
		}

		active = true;

		send({ type: 'started' });

		resume();
	} catch (error) {
		active = false;

		send({
			type: 'error',
			message: error instanceof Error ? error.message : String(error)
		});
	}
};

self.onmessage = (event: MessageEvent<WorkerInput>) => {
	const message = event.data;

	if (message.type === 'run') {
		run(message.code, message.components);
	}

	if (message.type === 'button') {
		for (const component of components.values()) {
			if (component.id === message.id && component.type === 'button') {
				component.pressed = message.pressed;
				break;
			}
		}
	}
};
