import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, useDocumentHead, useLocation } from '@builder.io/qwik-city';

import icon from './icon.png?url';

import './global.css';

export default component$(() => (
	<QwikCityProvider>
		<Head />
		<body class="bg-bg text-fg font-sans antialiased">
			<RouterOutlet />
		</body>
	</QwikCityProvider>
));

// Separate component because `useDocumentHead()`/`useLocation()` need to be inside `QwikCityProvider`
const Head = component$(() => {
	const head = useDocumentHead();
	const loc = useLocation();

	return (
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="color-scheme" content="light dark" />
			<meta name="theme-color" content="#4cae4f" />
			<title>{head.title ? `${head.title} - Recipes` : 'Recipes'}</title>
			<link rel="canonical" href={loc.url.href} />
			<link rel="icon" type="image/png" href={icon} />
			{head.meta.map((m) => (
				<meta key={m.key} {...m} />
			))}
			{/* Before paint to avoid a theme flash. Saved choice wins, otherwise system: dark + HDR screen → oled, dark → darkgray, else light */}
			<script dangerouslySetInnerHTML="try{document.documentElement.dataset.theme=localStorage.getItem('theme')??(matchMedia('(prefers-color-scheme: dark)').matches?(matchMedia('(dynamic-range: high)').matches?'oled':'dark'):'light')}catch{document.documentElement.dataset.theme='light'}" />
		</head>
	);
});
