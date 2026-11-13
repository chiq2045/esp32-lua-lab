<!-- Open the modal using ID.showModal() method -->
<script lang="ts">
	import Modal from './modal.svelte';

	let {
		dialog = $bindable(),
		projects,
		loadProject
	}: {
		dialog: HTMLDialogElement | null;
		projects: string[];
		loadProject: (project: string) => void;
	} = $props();
	let selectedProject = $state('');
</script>

{#snippet dialogContent()}
	<p class="py-4">Select the project you want to load</p>
	<label for="saved-projects">Project:</label>
	<select id="saved-projects" class="select" bind:value={selectedProject}>
		{#each projects as project}
			<option value="project">{project}</option>
		{/each}
	</select>
{/snippet}

{#snippet dialogActions()}
	<button class="btn" onclick={() => dialog?.close()}>Cancel</button>
	<button
		disabled={selectedProject === ''}
		class="btn btn-primary"
		onclick={() => {
			loadProject(selectedProject);
			dialog?.close();
		}}
	>
		Load
	</button>
{/snippet}

<Modal
	bind:dialog
	title="Load Project"
	content={dialogContent}
	actions={dialogActions}
	clickToClose
/>
