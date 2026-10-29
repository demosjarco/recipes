import { $, component$, noSerialize, Slot, useOnDocument, useSignal, useVisibleTask$, type NoSerialize } from '@builder.io/qwik';
import { Link, useContent, useDocumentHead, useLocation, type ContentMenu } from '@builder.io/qwik-city';
import icon from '../icon.png?url';

// Cycles in the same order the old mkdocs palette toggle did
const themes = { light: 'oled', oled: 'dark', dark: 'light' } as const;
// giscus has no oled theme, transparent lets the black page through
const giscusThemes = { light: 'light', dark: 'dark', oled: 'transparent_dark' } as const;

export default component$(() => {
	const { url } = useLocation();
	// Plain values (not store reads inside JSX) so Qwik doesn't serialize them as inline client functions
	const { pathname, href } = url;
	const basePath = import.meta.env.BASE_URL;
	const { menu, headings } = useContent();
	const { frontmatter } = useDocumentHead();

	const keepAwakeSupported = useSignal(false);
	const keepAwake = useSignal(false);
	const wakeLock = useSignal<NoSerialize<WakeLockSentinel>>();

	// Most important feature: stop the screen from sleeping while cooking
	const lockScreen = $(async () => {
		try {
			wakeLock.value = noSerialize(await navigator.wakeLock.request('screen'));
		} catch (error) {
			console.error(error);
			keepAwake.value = false;
		}
	});

	useVisibleTask$(
		() => {
			keepAwakeSupported.value = 'wakeLock' in navigator;
		},
		{ strategy: 'document-idle' },
	);

	// Browsers release the wake lock when the tab is hidden, take it back when visible again
	useOnDocument(
		'visibilitychange',
		$(async () => {
			if (keepAwake.value && document.visibilityState === 'visible') await lockScreen();
		}),
	);

	const renderMenu = (items: ContentMenu[] = [], depth = 0) => (
		<ul class={depth > 0 ? 'ml-3' : ''}>
			{items.map((item) =>
				item.href ? (
					<li key={item.href}>
						<Link href={item.href} class={['block py-1.5', item.href === pathname ? 'text-primary' : 'hover:text-accent']}>
							{item.text}
						</Link>
					</li>
				) : (
					<li key={item.text}>
						<details open={JSON.stringify(item).includes(`"${pathname}"`)} class="group">
							<summary class="hover:text-accent flex cursor-pointer list-none items-center justify-between py-1.5">
								{item.text}
								<svg class="size-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M8.59 16.58 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
								</svg>
							</summary>
							{renderMenu(item.items, depth + 1)}
						</details>
					</li>
				),
			)}
		</ul>
	);

	return (
		<>
			{/* CSS-only mobile drawer toggle */}
			<input type="checkbox" id="drawer" class="peer sr-only" aria-label="Navigation" />
			<header class="bg-primary sticky top-0 z-20 flex h-12 items-center gap-2 px-2 text-white shadow-md">
				<label for="drawer" class="cursor-pointer p-2 lg:hidden" title="Navigation">
					<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
					</svg>
				</label>
				<Link href={basePath} class="hidden p-2 lg:block" aria-label="Recipes">
					<img src={icon} alt="logo" width={24} height={24} class="size-6" />
				</Link>
				<span class="grow truncate px-2 text-lg font-bold">Recipes</span>

				{keepAwakeSupported.value && (
					<label class="flex cursor-pointer items-center gap-1 text-sm">
						<input
							type="checkbox"
							class="accent-white"
							checked={keepAwake.value}
							onChange$={async (_, el) => {
								keepAwake.value = el.checked;
								if (el.checked) {
									await lockScreen();
								} else {
									await wakeLock.value?.release();
								}
							}}
						/>
						Keep Awake
					</label>
				)}

				<button
					type="button"
					class="cursor-pointer p-2"
					title="Switch theme"
					onClick$={() => {
						const theme = themes[(document.documentElement.dataset['theme'] ?? 'light') as keyof typeof themes];
						document.documentElement.dataset['theme'] = theme;
						try {
							localStorage.setItem('theme', theme);
						} catch {
							// Storage blocked, still switches for this page
						}
						document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusThemes[theme] } } }, 'https://giscus.app');
					}}>
					<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path class="light:block hidden" d="M12 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4m0 10a6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6 6 6 0 0 1-6 6m8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12z" />
						<path class="oled:block hidden" d="M6 20h6v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1zm5-5.11V16H7v-2.42C5.23 12.81 4 11.05 4 9c0-2.76 2.24-5 5-5 .9 0 1.73.26 2.46.67.54-.47 1.2-.86 1.89-1.17C12.16 2.57 10.65 2 9 2 5.13 2 2 5.13 2 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-.68c-.75-.36-1.43-.82-2-1.43m9.92-4.95-.5-1.64 1.3-1.08-1.68-.04-.63-1.58-.56 1.61-1.68.11 1.33 1.03-.4 1.65 1.4-.97zm-1.8 2.31a4.62 4.62 0 0 1-3.27-2.28c-.73-1.26-.8-2.72-.35-4 .14-.34-.16-.68-.5-.63-3.44.66-5 4.79-2.78 7.61 1.81 2.24 5.28 2.32 7.17.05.23-.26.08-.7-.27-.75" />
						<path class="hidden dark:block" d="M12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6a6 6 0 0 1 6 6 6 6 0 0 1-6 6m8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12z" />
					</svg>
				</button>

				<details class="relative">
					<summary class="cursor-pointer list-none p-2" title="Select language">
						<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="m12.87 15.07-2.54-2.51.03-.03A17.5 17.5 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2zm-2.62 7 1.62-4.33L19.12 17z" />
						</svg>
					</summary>
					<ul class="bg-bg text-fg absolute right-0 mt-1 rounded-sm py-2 text-sm shadow-lg">
						<li>
							<a href={pathname} hreflang="en" class="hover:text-accent block px-4 py-1">
								English
							</a>
						</li>
						{(
							[
								['ro', 'Romanian'],
								['es', 'Spanish'],
							] as const
						).map(([lang, name]) => (
							<li key={lang}>
								<a href={`https://translate.google.com/translate?sl=en&tl=${lang}&hl=${lang}&u=${encodeURIComponent(href)}`} hreflang={lang} class="hover:text-accent block px-4 py-1">
									{name}
								</a>
							</li>
						))}
					</ul>
				</details>

				<a href="https://github.com/demosjarco/recipes" class="hidden items-center gap-2 p-2 text-sm md:flex" title="Go to repository">
					<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
					</svg>
					demosjarco/recipes
				</a>
			</header>

			{/* Drawer backdrop on mobile */}
			<label for="drawer" class="fixed inset-0 z-30 hidden bg-black/50 peer-checked:block lg:peer-checked:hidden" aria-hidden="true" />

			<div class="flex gap-10 px-4 lg:px-6">
				<nav class="bg-bg fixed inset-y-0 left-0 z-40 w-60 -translate-x-full overflow-y-auto p-4 text-sm transition-transform lg:sticky lg:top-12 lg:z-auto lg:h-[calc(100vh-3rem)] lg:w-60 lg:shrink-0 lg:translate-x-0 lg:px-0 lg:py-10 [#drawer:checked~div_&]:translate-x-0" aria-label="Navigation">
					<p class="text-fg-light mb-2 font-bold">{menu?.text}</p>
					<ul>
						<li>
							<a href="https://demosjarco.dev" class="hover:text-accent block py-1.5">
								Main Site
							</a>
						</li>
						<li>
							<Link href={basePath} class={['block py-1.5', pathname === basePath ? 'text-primary' : 'hover:text-accent']}>
								Welcome
							</Link>
						</li>
					</ul>
					{renderMenu(menu?.items)}
				</nav>

				<main class="typeset min-w-0 grow py-10">
					<Slot />

					{frontmatter['comments'] && (
						<>
							<h2 id="__comments">Comments</h2>
							<script src="https://giscus.app/client.js" data-repo="demosjarco/Portfolio" data-repo-id="R_kgDOKUeHwg" data-category="Website Comments" data-category-id="DIC_kwDOKUeHws4CZYCA" data-mapping="pathname" data-strict="0" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="top" data-theme="preferred_color_scheme" data-lang="en" data-loading="lazy" crossOrigin="anonymous" async />
						</>
					)}
				</main>

				{headings && headings.length > 0 && (
					<aside class="sticky top-12 hidden h-[calc(100vh-3rem)] w-60 shrink-0 overflow-y-auto py-10 text-sm xl:block" aria-label="Table of contents">
						<p class="text-fg-light mb-2 font-bold">Table of contents</p>
						<ul>
							{headings
								.filter(({ level }) => level > 1)
								.map(({ id, text, level }) => (
									<li key={id} class={level > 2 ? 'ml-3' : ''}>
										<a href={`#${id}`} class="hover:text-accent block py-1.5">
											{text}
										</a>
									</li>
								))}
						</ul>
					</aside>
				)}
			</div>
		</>
	);
});
