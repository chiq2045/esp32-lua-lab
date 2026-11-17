<script lang="ts">
	import type { Assignment } from '#lib/types/assignments.ts';
	import SvelteMarkdown from 'svelte-markdown';

	let {
		assignment,
		onClose
	}: {
		assignment: Assignment;
		onClose: () => void;
	} = $props();
</script>

<details class="collapse w-full border border-base-300 bg-base-100">
	<summary class="collapse-title w-full font-semibold">
		<h2>{assignment.title}</h2>
	</summary>

	<div class="max-h-72 overflow-y-auto p-4">
		<div class="prose prose-sm max-w-none">
			<SvelteMarkdown source={assignment.markdown} />
		</div>
	</div>
</details>
