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

	let { doc }: { doc: string | Text } = $props();

	let view: EditorView | null = null;
	let parent: HTMLDivElement | null = null;

	onMount(() => {
		view = new EditorView({
			doc,
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
