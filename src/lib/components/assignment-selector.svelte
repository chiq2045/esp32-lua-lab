<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '#convex/_generated/api.js';
	import { convex } from '#convex/client.ts';
	import type { Assignment } from '#lib/types/assignments.ts';
	import { assignments } from '#lib/state/assignments.svelte.ts';

	let {
		onSelect
	}: {
		onSelect: (assignment: Assignment) => void;
	} = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(() => {
		const unsubscribe = convex.onUpdate(
			api.assignments.listPublished,
			{},
			(result) => {
				assignments.updateAssignments(result);
				loading = false;
				error = null;
			},
			(err) => {
				error = err.message;
				loading = false;
			}
		);

		return unsubscribe;
	});

	function selectAssignment(assignment: Assignment) {
		onSelect(assignment);
		assignments.closeAssignmentSelector();
	}
</script>

{#if assignments.showAssignments}
	<div class="modal modal-open" role="presentation">
		<div class="modal-box max-w-xl" role="dialog" aria-modal="true" aria-label="Select assignment">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Assignments</h2>

				<button
					class="btn btn-square btn-ghost btn-sm"
					aria-label="Close assignments"
					onclick={assignments.closeAssignmentSelector}
				>
					✕
				</button>
			</div>

			<p class="mb-4 text-sm opacity-60">Choose an assignment to view its instructions.</p>

			{#if loading}
				<div class="flex justify-center p-8">
					<span class="loading loading-md loading-spinner"></span>
				</div>
			{:else if error}
				<div class="alert alert-error">
					{error}
				</div>
			{:else if assignments.assignments.length === 0}
				<div class="rounded-lg bg-base-200 p-8 text-center">
					<p class="font-medium">No assignments available</p>
					<p class="mt-1 text-sm opacity-60">Your teacher hasn't published any assignments yet.</p>
				</div>
			{:else}
				<div class="flex max-h-96 flex-col gap-2 overflow-y-auto">
					{#each assignments.assignments as assignment (assignment._id)}
						<button
							class="w-full rounded-lg border border-base-300 p-4 text-left transition-colors hover:bg-base-200"
							onclick={() => selectAssignment(assignment)}
						>
							<div class="font-semibold">
								{assignment.title}
							</div>

							{#if assignment.description}
								<p class="mt-1 text-sm opacity-60">
									{assignment.description}
								</p>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={assignments.closeAssignmentSelector}>
					Cancel
				</button>
			</div>
		</div>

		<button
			class="modal-backdrop"
			aria-label="Close assignment selector"
			onclick={assignments.closeAssignmentSelector}
		></button>
	</div>
{/if}
