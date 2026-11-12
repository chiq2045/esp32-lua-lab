<!-- Open the modal using ID.showModal() method -->
<script lang="ts">
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

<dialog bind:this={dialog} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box">
		<h2 class="text-lg font-bold">Load Project!</h2>
		<p class="py-4">Select the project you want to load</p>
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Saved Projects</legend>
			<label for="saved-projects">Project</label>
			<select id="saved-projects" class="select" bind:value={selectedProject}>
				{#each projects as project}
					<option value="project">{project}</option>
				{/each}
			</select>
			<span class="label">Optional</span>
		</fieldset>
		<div class="modal-action">
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
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
