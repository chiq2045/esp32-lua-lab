<script lang="ts">
	import {
		autocompletion,
		closeBrackets,
		closeBracketsKeymap,
		completionKeymap,
		startCompletion
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
	import { projectState } from '#lib/state/project.svelte.ts';
	import { luaAutocomplete } from './lua-autocomplete';

	let view: EditorView | null = null;
	let parent: HTMLDivElement | null = null;
	const getComponents = () => projectState.project.components;

	onMount(() => {
		view = new EditorView({
			doc: projectState.project.code,
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
				luaAutocomplete(getComponents),
				EditorView.updateListener.of((update) => {
					if (!update.docChanged) return;

					projectState.setCode(update.state.doc.toString());

					// Trigger method suggestions when the student types ":".
					const cursor = update.state.selection.main.head;

					const line = update.state.doc.lineAt(cursor);
					const before = line.text.slice(0, cursor - line.from);

					if (/[A-Za-z_][A-Za-z0-9_]*:$/.test(before)) {
						// Schedule completion after this editor update finishes.
						queueMicrotask(() => {
							startCompletion(update.view);
						});
					}
				}),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...completionKeymap,
					{
						key: 'Ctrl-Space',
						run: startCompletion
					}
				]),
				whiteLight
			]
		});
	});

	onDestroy(() => {
		if (!view) return;

		view?.destroy();
	});

	$effect(() => {
		const code = projectState.project.code;

		if (!view) return;

		const current = view.state.doc.toString();

		if (current !== code) {
			view.dispatch({
				changes: {
					from: 0,
					to: view.state.doc.length,
					insert: code
				}
			});
		}
	});
</script>

<div bind:this={parent}></div>
