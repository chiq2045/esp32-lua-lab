<script lang="ts">
	type Tabs = 'code' | 'design' | 'console' | 'settings';
	let selectedView = $state<Tabs>('code');

	const changeView = (view: Tabs) => {
		selectedView = view;
	};
</script>

<div class="flex h-full flex-col gap-4">
	<div class="flex flex-row justify-between">Controls</div>
	<div class="tabs tabs-box" role="tablist" aria-label="Views">
		<button
			class="tab"
			role="tab"
			aria-selected={selectedView === 'code'}
			aria-controls="code-view"
			id="code-view-button"
			onclick={() => changeView('code')}
			tabindex={selectedView === 'code' ? 0 : -1}
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
					d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
				/>
			</svg>
			<span class="pl-2">Code</span>
		</button>
		<button
			class="tab"
			role="tab"
			aria-selected={selectedView === 'design'}
			aria-controls="design-view"
			id="design-view-button"
			onclick={() => changeView('design')}
			tabindex={selectedView === 'design' ? 0 : -1}
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
					d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
				/>
			</svg>
			<span class="pl-2">Design</span>
		</button>
		<button
			class="tab"
			role="tab"
			aria-selected={selectedView === 'settings'}
			aria-controls="settings-view"
			id="settings-view-button"
			onclick={() => changeView('settings')}
			tabindex={selectedView === 'settings' ? 0 : -1}
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
					d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
				/>
			</svg>
			<span class="pl-2">Settings</span>
		</button>
	</div>

	<div class="grow">
		<div
			role="tabpanel"
			id="code-view"
			aria-labelledby="code-view-button"
			tabindex={selectedView === 'code' ? 0 : undefined}
			hidden={selectedView !== 'code'}
		>
			<p>This is the Code View</p>
		</div>
		<div
			role="tabpanel"
			id="design-view"
			aria-labelledby="design-view-button"
			tabindex={selectedView === 'design' ? 0 : undefined}
			hidden={selectedView !== 'design'}
		>
			<p>This is the Design View</p>
		</div>
		<div
			role="tabpanel"
			id="settings-view"
			aria-labelledby="settings-view-button"
			tabindex={selectedView === 'settings' ? 0 : undefined}
			hidden={selectedView !== 'settings'}
		>
			<p>This is the Settings View</p>
		</div>
	</div>
</div>
