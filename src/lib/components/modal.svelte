<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		actions,
		clickToClose,
		content,
		dialog = $bindable(),
		fullWidth,
		onClose,
		title
	}: {
		dialog: HTMLDialogElement | null;
		title?: string;
		content: Snippet<[]>;
		actions?: Snippet<[]>;
		clickToClose?: boolean;
		fullWidth?: boolean;
		onClose?: () => void;
	} = $props();
</script>

<dialog
	bind:this={dialog}
	class="modal modal-bottom sm:modal-middle"
	aria-modal="true"
	onclose={onClose}
>
	<div class={`modal-box  ${fullWidth ? 'w-full max-w-5xl sm:w-11/12' : ''}`}>
		{#if title}
			<div class="bg-base-100">
				<h2 class="text-lg font-bold">{title}</h2>
			</div>
			<div role="separator" class="divider my-0"></div>
		{/if}
		<div class="rounded bg-base-200 p-4">
			{@render content()}
		</div>
		{#if actions}
			<div role="separator" class="divider my-0"></div>
			<div class="modal-action mt-2">
				{@render actions()}
			</div>
		{/if}
	</div>
	{#if clickToClose}
		<form method="dialog" class="modal-backdrop">
			<button onclick={onClose}>Close</button>
		</form>
	{/if}
</dialog>
