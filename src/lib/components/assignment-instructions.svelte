<script lang="ts">
	import { assignments } from '#lib/state/assignments.svelte.ts';
	import type { Assignment } from '#lib/types/assignments.ts';
	import SvelteMarkdown from 'svelte-markdown';
</script>

<div class="drawer">
	<input type="checkbox" class="drawer-toggle" bind:checked={assignments.showInstructions} />
	<div class="drawer-content">
		{#if assignments.selectedAssignment}
			<h1 class="text-xl font-semibold">Assignment: {assignments.selectedAssignment.title}</h1>
			<button class="btn drawer-button btn-lg btn-secondary" onclick={assignments.openInstructions}>
				Show Instructions
			</button>
		{:else}
			<h1>Select Assignment</h1>
		{/if}
	</div>
	<div class="drawer-side">
		<button
			aria-label="close sidebar"
			class="drawer-overlay"
			onclick={assignments.closeInstructions}
		></button>
		<div class="prose prose-sm max-w-1/2 bg-base-200 p-4">
			<div class="text-right">
				<button
					aria-label="close sidebar"
					class="btn btn-square"
					onclick={assignments.closeInstructions}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<SvelteMarkdown source={assignments.selectedAssignment?.markdown} />
		</div>
	</div>
</div>
