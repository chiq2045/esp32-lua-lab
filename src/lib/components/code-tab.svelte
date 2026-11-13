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
		<!--     <button> -->
		<!--       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> -->
		<!--   <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /> -->
		<!-- </svg> -->
		<!--       Learn More -->
		<!--     </button> -->
		<button class="btn btn-success" onclick={onRun}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
				/>
			</svg>
			Run
		</button>
	</header>

	<CodeEditor />

	<p class="text-sm opacity-60">
		Available components:
		{projectState.project.components.map((component) => component.name).join(', ') || 'None'}
	</p>
</div>
