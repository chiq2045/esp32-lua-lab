import {
	autocompletion,
	type Completion,
	type CompletionContext,
	type CompletionResult
} from '@codemirror/autocomplete';

import type { CircuitComponent } from '#lib/types/project.ts';
import { componentMethods, luaGlobals, luaKeywords } from './lua-api';

export function luaAutocomplete(getComponents: () => CircuitComponent[]) {
	function complete(context: CompletionContext): CompletionResult | null {
		// Only inspect text on the current line.
		const line = context.state.doc.lineAt(context.pos);
		const before = line.text.slice(0, context.pos - line.from);

		// Method completion: redLED: or redLED:tur
		const methodMatch = before.match(/([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z0-9_]*)$/);

		if (methodMatch) {
			const [, componentName, partial] = methodMatch;

			const component = getComponents().find((item) => item.name === componentName);

			if (!component) return null;

			const options: Completion[] = componentMethods[component.type].map((method) => ({
				label: method.name,
				type: 'method',
				detail: `${method.name}()`,
				info: method.description,
				apply: `${method.name}()`,
				boost: 10
			}));

			return {
				from: context.pos - partial.length,
				options,
				validFor: /^[A-Za-z0-9_]*$/
			};
		}

		// Component names and Lua globals.
		const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);

		if (!word && !context.explicit) return null;

		const components: Completion[] = getComponents().map((component) => ({
			label: component.name,
			type: 'variable',
			detail: component.type.toUpperCase(),
			info: `Component from Design: ${component.name}`,
			boost: 20
		}));

		const globals: Completion[] = luaGlobals.map((fn) => ({
			label: fn.name,
			type: 'function',
			detail: `${fn.name}()`,
			info: fn.description,
			apply: `${fn.name}()`
		}));

		const keywords: Completion[] = luaKeywords.map((keyword) => ({
			label: keyword,
			type: 'keyword'
		}));

		return {
			from: word?.from ?? context.pos,
			options: [...components, ...globals, ...keywords],
			validFor: /^[A-Za-z_][A-Za-z0-9_]*$/
		};
	}

	return autocompletion({
		override: [complete],
		activateOnTyping: true,
		maxRenderedOptions: 15
	});
}
