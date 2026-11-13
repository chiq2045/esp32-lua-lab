<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { projectState } from '#lib/state/project.svelte.ts';
	import { PersistedState } from 'runed';
	import type { Project, SavedProjects } from '#lib/types/project.ts';
	import LoadProjectsModal from '#lib/components/load-projects-modal.svelte';
	import { dev } from '$app/env';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	const STORAGE_KEY = 'esp32-lua-lab:projects';
	let { children }: LayoutProps = $props();

	const savedProjects = new PersistedState<SavedProjects>(STORAGE_KEY, {});
	let savedTimer = null;
	let showSavedMessage = $state(false);

	const saveProject = (project: Project) => {
		savedProjects.current[project.name] = $state.snapshot(project);
		savedTimer = setTimeout(() => {
			showSavedMessage = false;
		}, 5000);
		showSavedMessage = true;
	};

	const loadProject = (projectName: string) => {
		return savedProjects.current[projectName] ?? null;
	};

	const getListOfSavedProjects = () => {
		return Object.keys(savedProjects.current);
	};

	const deleteProject = (projectName: string) => {
		delete savedProjects.current[projectName];
	};

	let loadProjectDialog = $state<HTMLDialogElement | null>(null);
	let projects = $state<string[]>([]);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav class="navbar bg-base-100 px-4 shadow-sm">
		<div class="navbar-start">
			<h1 class="text-xl font-semibold">ESP32 Lua Lab</h1>
		</div>
		<div class="navbar-center gap-2">
			<label class="input">
				Project Name
				<input
					type="text"
					class="grow"
					placeholder="src/app/"
					bind:value={projectState.project.name}
				/>
			</label>
			<div class="flex flex-col items-center gap-1">
				<!-- <span class="text-xs text-slate-500"> -->
				<!-- 	{projectState.dirty ? 'Unsaved' : 'Saved'} -->
				<!-- </span> -->
				{#if showSavedMessage}
					<span class="text-xs text-slate-500">Saved!</span>
				{/if}
			</div>
		</div>
		<div class="navbar-end gap-2">
			<button
				class="btn btn-soft btn-neutral"
				onclick={() => {
					projectState.save();
					saveProject(projectState.project);
				}}
			>
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
						d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
					/>
				</svg>
				<span>Save</span>
			</button>
			<button
				class="btn btn-soft btn-neutral"
				onclick={() => {
					projects = getListOfSavedProjects();
					loadProjectDialog?.showModal();
				}}
			>
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
						d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
					/>
				</svg>
				<span>Load</span>
			</button>
		</div>
	</nav>
</header>

<main class="h-full grow bg-base-200 p-2 md:p-4">
	{@render children()}

	<LoadProjectsModal bind:dialog={loadProjectDialog} {loadProject} {projects} />
</main>
