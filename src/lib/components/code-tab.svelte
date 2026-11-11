<script lang="ts">
	import CodeEditor from '#lib/editor/code-editor.svelte';
	import { projectState } from '#lib/state/project.svelte.ts';

	let { onRun }: { onRun: () => void } = $props();
</script>

<div class="flex h-full flex-col gap-4">
	<header class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-semibold">Lua Code</h2>
			<p class="text-sm opacity-70">Write code using components from Design.</p>
		</div>

		<button class="rounded bg-green-600 px-4 py-2 text-white" onclick={onRun}> Run </button>
	</header>

	<CodeEditor />

	<p class="text-sm opacity-60">
		Available components:
		{projectState.project.components.map((component) => component.name).join(', ') || 'None'}
	</p>
</div>
