import baseConfig from '@demosjarco/prettier-config' with { type: 'json' };

/** @type {import("prettier").Config} */
export default {
	...baseConfig,
	plugins: ['prettier-plugin-tailwindcss'],
};
