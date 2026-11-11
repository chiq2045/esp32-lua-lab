import { autocompletion, type CompletionContext, type Completion } from '@codemirror/autocomplete';

import { componentAPI, type CircuitComponent } from '#lib/simulator/component-api.ts';

export function luaAutocomplete(getComponents: () => CircuitComponent[]) {
	function complete(context: CompletionContext) {
		const before = context.state.doc.sliceString(0, context.pos);

		// Detect component method calls:
		// redLED:turn...
		const methodMatch = before.match(/([A-Za-z_][A-Za-z0-9_]*):([A-Za-z0-9_]*)$/);

		if (methodMatch) {
			const [, componentName, partial] = methodMatch;

			const component = getComponents().find((item) => item.name === componentName);

			if (!component) return null;

			const options: Completion[] = componentAPI[component.type].map((method) => ({
				label: method.signature,
				type: 'method',
				detail: method.returns,
				info: method.description,
				apply: method.signature
			}));

			return {
				from: context.pos - partial.length,
				options,
				validFor: /^[A-Za-z0-9_]*$/
			};
		}

		// Detect component names:
		// red...
		const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);

		if (!word && !context.explicit) {
			return null;
		}

		const options: Completion[] = getComponents().map((component) => ({
			label: component.name,
			type: 'variable',
			detail: component.type,
			info: `${component.type} component`
		}));

		return {
			from: word?.from ?? context.pos,
			options,
			validFor: /^[A-Za-z_][A-Za-z0-9_]*$/
		};
	}

	return autocompletion({
		override: [complete],
		activateOnTyping: true
	});
}
