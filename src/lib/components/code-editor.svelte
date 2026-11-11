<script lang="ts">
	import {
		autocompletion,
		closeBrackets,
		closeBracketsKeymap,
		completionKeymap
	} from '@codemirror/autocomplete';
	import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
	import { EditorState, type Text } from '@codemirror/state';
	import { defaultKeymap } from '@codemirror/commands';
	import {
		dropCursor,
		highlightActiveLine,
		highlightActiveLineGutter,
		highlightSpecialChars,
		keymap,
		lineNumbers
	} from '@codemirror/view';
	import { basicSetup, EditorView } from 'codemirror';
	import { onDestroy, onMount } from 'svelte';
	import { lua } from '@codincod/codemirror-lang-lua';
	import { whiteLight } from '@uiw/codemirror-themes-all';
	import type { CircuitComponent } from '#lib/simulator/component-api.ts';

	interface Props {
		code: string | Text;
		components: CircuitComponent[];
		onCodeChange: (code: string) => void;
	}
	let { code, components, onCodeChange }: Props = $props();

	let view: EditorView | null = null;
	let parent: HTMLDivElement | null = null;

	onMount(() => {
		view = new EditorView({
			doc: code,
			// @ts-expect-error paent will have HTMLDivElement type when component is mounted
			parent,
			extensions: [
				basicSetup,
				lua(),
				lineNumbers(),
				foldGutter(),
				highlightSpecialChars(),
				dropCursor(),
				indentOnInput(),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				highlightActiveLine(),
				highlightActiveLineGutter(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onCodeChange(update.state.doc.toString());
					}
				}),
				keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...completionKeymap]),
				whiteLight
			]
		});
	});

	onDestroy(() => {
		if (!view) return;

		view?.destroy();
	});
</script>

<div bind:this={parent}></div>
