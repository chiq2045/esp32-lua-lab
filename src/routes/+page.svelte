<script lang="ts">
	import CodeEditor from '#lib/components/code-editor.svelte';
	import CodeTab from '#lib/components/code-tab.svelte';
	import ConsoleTab from '#lib/components/console-tab.svelte';
	import DesignTab from '#lib/components/design-tab.svelte';
	import { type CircuitComponent } from '#lib/simulator/component-api.ts';
	import { projectState } from '#lib/state/project.svelte.ts';
	import type { Tab, TabLabel } from '#lib/types/tabs.ts';
	import { onMount } from 'svelte';

	let activeTab = $state<Tab>('code');
	let ready = $state(false);

	const tabs: TabLabel[] = [
		{
			id: 'code',
			label: 'Code',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" ><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>',
			controls: 'code-view'
		},
		{
			id: 'design',
			label: 'Design',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" ><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>',
			controls: 'design-view'
		},
		{
			id: 'console',
			label: 'Console',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" ><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>',
			controls: 'console-view'
		}
		// {id: 'settings', label: 'Settings'},
	];

	const changeView = (view: Tab) => {
		activeTab = view;
	};
	let code = $state(`-- this is a test`);
	let components = $state<CircuitComponent[]>([]);
	const onCodeChange = (v: string) => {
		code = v;
	};

	onMount(() => {
		projectState.load();
		ready = true;
	});

	$effect(() => {
		if (!ready || projectState.dirty) {
			return;
		}
		const updatedAt = projectState.project.updatedAt;

		const timer = setTimeout(() => {
			projectState.save();
		}, 1000);

		return () => clearTimeout(timer);
	});

	const run = () => {
		projectState.addMessage('info', 'Simulation engine is not connected yet.');
		activeTab = 'console';
	};
</script>

<div class="flex h-full flex-col gap-4">
	<div class="flex flex-row justify-between gap-2">Controls</div>
	<div class="tabs tabs-box" role="tablist" aria-label="Views">
		{#each tabs as tab}
			<button
				class="tab"
				role="tab"
				aria-selected={activeTab === tab.id}
				aria-controls={tab.controls}
				id={`${tab.controls}-button`}
				onclick={() => changeView(tab.id)}
				tabindex={activeTab === tab.id ? 0 : -1}
			>
				{@html tab.svg ?? ''}
				<span class="pl-2">{tab.label}</span>
			</button>
		{/each}
	</div>

	<div class="grow">
		{#if ready}
			<div
				role="tabpanel"
				id="code-view"
				aria-labelledby="code-view-button"
				tabindex={activeTab === 'code' ? 0 : undefined}
				hidden={activeTab !== 'code'}
			>
				<!-- <h2 class="font-mono">main.lua</h2>
				<CodeEditor {code} {onCodeChange} {components} /> -->
				<CodeTab onRun={run} />
			</div>
			<div
				role="tabpanel"
				id="design-view"
				aria-labelledby="design-view-button"
				tabindex={activeTab === 'design' ? 0 : undefined}
				hidden={activeTab !== 'design'}
			>
				<DesignTab />
			</div>
			<div
				role="tabpanel"
				id="settings-view"
				aria-labelledby="settings-view-button"
				tabindex={activeTab === 'settings' ? 0 : undefined}
				hidden={activeTab !== 'settings'}
			>
				<ConsoleTab />
			</div>
		{:else}
			<div class="loader"></div>
		{/if}
	</div>
</div>

<style>
	.loader {
		width: 45px;
		aspect-ratio: 1;
		--c: no-repeat linear-gradient(#000 0 0);
		background:
			var(--c) 0% 100%,
			var(--c) 50% 100%,
			var(--c) 100% 100%;
		animation: l2 1s infinite linear;
	}
	@keyframes l2 {
		0% {
			background-size:
				20% 100%,
				20% 100%,
				20% 100%;
		}
		20% {
			background-size:
				20% 60%,
				20% 100%,
				20% 100%;
		}
		40% {
			background-size:
				20% 80%,
				20% 60%,
				20% 100%;
		}
		60% {
			background-size:
				20% 100%,
				20% 80%,
				20% 60%;
		}
		80% {
			background-size:
				20% 100%,
				20% 100%,
				20% 80%;
		}
		100% {
			background-size:
				20% 100%,
				20% 100%,
				20% 100%;
		}
	}
</style>
