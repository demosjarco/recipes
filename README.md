[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/demosjarco/recipes/badge)](https://securityscorecards.dev/viewer/?uri=github.com/demosjarco/recipes)

Recipes are written in [Cooklang](https://cooklang.org/) (`recipes/**/*.cook`, with `Name.jpg` as the cover and `Name.<step>.jpg` per step). `scripts/cook2mdx.ts` turns them into [Qwik City MDX](https://qwik.dev/docs/guides/mdx/) routes, which are [statically generated](https://qwik.dev/docs/guides/static-site-generation/) and deployed to Cloudflare Workers static assets and GitHub Pages.

- `npm start` - dev server
- `npm run build` - SSG into `dist/` (bundle report in `stats.html`)
- `npm run preview` - serve `dist/` with `wrangler dev`
