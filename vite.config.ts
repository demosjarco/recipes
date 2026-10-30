import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => ({
	// GitHub Pages lives under `/recipes/`, Cloudflare at `/`. Qwik City derives its `basePathname` from this
	base: process.env['BASE_PATH'] ?? '/',
	plugins: [
		tailwindcss(),
		qwikCity(),
		// Otherwise every @fontsource subset/weight/format (54 files) gets preloaded, `unicode-range` already picks what's needed
		qwikVite({ disableFontPreload: true }),
		// Client bundle chunking report, open `stats.html` after `npm run build.client`
		!isSsrBuild && visualizer({ filename: 'stats.html', template: 'treemap', gzipSize: true, brotliSize: true }),
	],
	build: {
		target: 'esnext',
		// Keep fonts/images as files so the CSP doesn't need `data:`
		assetsInlineLimit: 0,
	},
}));
