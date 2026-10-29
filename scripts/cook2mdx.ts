/**
 * Converts every `recipes/**\/*.cook` (https://cooklang.org/docs/spec/) into a Qwik City MDX route + sidebar `menu.md`
 * Hand-rolled instead of `@cooklang/cooklang` because the official parser drops `[- notes -]`, which are rendered as tips
 */
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

interface Ingredient {
	name: string;
	quantity?: string;
	unit?: string;
}

class CookRecipe {
	public readonly metadata = new Map<string, string>();
	public readonly ingredients: Ingredient[] = [];
	public readonly cookware = new Set<string>();
	public readonly steps: { text: string; notes: string[] }[] = [];
	public totalMinutes = 0;

	constructor(source: string) {
		for (const block of source
			.replaceAll('\r\n', '\n')
			// Line comments
			.replace(/--.*$/gm, '')
			.split(/\n\s*\n/)) {
			const notes: string[] = [];
			const text = block
				.replace(/^>>\s*([^:]+):\s*(.*)$/gm, (_, key: string, value: string) => {
					this.metadata.set(key.trim().toLowerCase(), value.trim());
					return '';
				})
				.replace(/\[-([\s\S]*?)-\]/g, (_, note: string) => {
					notes.push(note.trim());
					return '';
				})
				// Multi-word `@name{qty%unit}` or single-word `@name`
				.replace(/@([^@#~{}\n]+?)\{([^}]*)\}|@([^\s@#~{}.,;:!?]+)/g, (_, multi?: string, amount?: string, single?: string) => {
					const name = (multi ?? single!).trim();
					const [quantity, unit] = (amount ?? '').split('%').map((part) => part.trim());
					this.ingredients.push({ name, quantity: quantity || undefined, unit: unit || undefined });
					return name;
				})
				.replace(/#([^@#~{}\n]+?)\{[^}]*\}|#([^\s@#~{}.,;:!?]+)/g, (_, multi?: string, single?: string) => {
					const name = (multi ?? single!).trim();
					this.cookware.add(name);
					return name;
				})
				.replace(/~([^@#~{}\n]*)\{([^}]*)\}/g, (_, _name: string, amount: string) => {
					const [quantity = '0', unit = ''] = amount.split('%').map((part) => part.trim());
					const value = CookRecipe.number(quantity);
					this.totalMinutes += unit.toLowerCase().startsWith('h') ? value * 60 : unit.toLowerCase().startsWith('s') ? value / 60 : value;
					return `${quantity} ${unit}`.trim();
				})
				.replace(/\s+/g, ' ')
				.trim();

			if (text || notes.length) this.steps.push({ text, notes });
		}
	}

	/** `3/2` → 1.5, `1/3` → 0.33 */
	public static number(quantity: string) {
		const [numerator = '0', denominator] = quantity.split('/');
		return Math.round((Number(numerator) / (denominator ? Number(denominator) : 1)) * 100) / 100;
	}
}

/** Escapes text so MDX treats it as literal text, not markdown/JSX */
const escape = (text: string) => text.replace(/[\\`*_[\]{}<>#|]/g, (char) => `\\${char}`);
/** Matches the old cook-docs url scheme (`Buffalo Chicken Sandwich` → `buffalo-chicken-sandwich`) */
const slug = (name: string) => name.trim().replace(/\s+/g, '-').toLowerCase();
const image = (base: string) => ['.jpg', '.png', '.webp'].map((ext) => base + ext).find((path) => existsSync(path));

const recipesDir = 'recipes';
const routesDir = join('src', 'routes');

// Every folder in `src/routes` is generated, start clean so deleted recipes disappear
for (const generated of globSync(join(routesDir, '*/'))) rmSync(generated, { recursive: true, force: true });

const menu = new Map<string, string[]>();

for (const cookFile of globSync('**/*.cook', { cwd: recipesDir }).sort((a, b) => a.localeCompare(b))) {
	const name = basename(cookFile, '.cook');
	const folders = dirname(cookFile).split('/');
	// Top level sections (`Breakfasts`) keep their casing like before, nested folders get slugged to keep spaces out of urls
	const routeDir = join(routesDir, folders[0]!, ...folders.slice(1).map(slug), slug(name));
	const sourceBase = join(recipesDir, dirname(cookFile), name);
	const importPath = (path: string) => JSON.stringify(`${relative(routeDir, path)}?jsx`);
	const recipe = new CookRecipe(readFileSync(join(recipesDir, cookFile), 'utf8'));

	const hero = image(sourceBase);
	const stepImages = recipe.steps.map((_, i) => image(`${sourceBase}.${i + 1}`));

	const table = new Map<string, string>();
	if (recipe.metadata.has('servings')) table.set('🍽️ Serves', recipe.metadata.get('servings')!);
	if (recipe.metadata.has('yield')) table.set('🥣 Yield', recipe.metadata.get('yield')!);
	table.set('⏲️ Total Time', recipe.totalMinutes > 60 ? `${(recipe.totalMinutes / 60).toFixed(2)} hours` : `${Math.round(recipe.totalMinutes * 100) / 100} minutes`);

	const source = recipe.metadata.get('source');
	const checklist = (items: string[]) => `<ul>\n${items.map((item) => `<li><label><input type="checkbox" /> ${escape(item)}</label></li>`).join('\n')}\n</ul>`;

	// JSON is valid YAML, so frontmatter is the cooklang metadata (`>> key: value`) plus derived fields for future search/filtering
	const frontmatter = {
		...Object.fromEntries(recipe.metadata),
		title: name,
		section: folders,
		ingredients: [...new Set(recipe.ingredients.map(({ name }) => name))],
		cookware: [...recipe.cookware],
		totalMinutes: Math.round(recipe.totalMinutes * 100) / 100,
		comments: true,
	};

	const mdx = ['---', ...Object.entries(frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`), '---', hero ? `import Hero from ${importPath(hero)};` : '', ...stepImages.map((path, i) => (path ? `import Step${i + 1} from ${importPath(path)};` : '')), '', `# ${escape(name)}`, '', hero ? `<Hero alt=${JSON.stringify(name)} />\n` : '', `| ${[...table.keys()].join(' | ')} |`, `| ${[...table.keys()].map(() => ':-:').join(' | ')} |`, `| ${[...table.values()].map(escape).join(' | ')} |`, '', '## Requirements', '', '<div class="tabs">', '<input type="radio" name="requirements" id="ingredients" aria-label="Ingredients" checked />', '<label for="ingredients">🧂 Ingredients</label>', '<input type="radio" name="requirements" id="cookware" aria-label="Cookware" />', '<label for="cookware">🍳 Cookware</label>', checklist(recipe.ingredients.map(({ name, quantity, unit }) => [quantity ? CookRecipe.number(quantity) : 'some', unit, name].filter(Boolean).join(' '))), checklist([...recipe.cookware].map((name) => `1 ${name}`)), '</div>', '', '## 📝 Instructions', '', ...recipe.steps.flatMap(({ text, notes }, i) => [`### Step ${i + 1}`, '', escape(text), '', stepImages[i] ? `<Step${i + 1} alt="Step ${i + 1}" />\n` : '', ...notes.map((note) => `<aside class="note">\n\n${escape(note)}\n\n</aside>\n`)]), source ? `<details class="quote" open>\n<summary>Source</summary>\n\n${URL.canParse(source) ? `[${escape(source)}](<${source}>)` : escape(source)}\n\n</details>` : '', ''].join('\n');

	mkdirSync(routeDir, { recursive: true });
	writeFileSync(join(routeDir, 'index.mdx'), mdx.replace(/\n{3,}/g, '\n\n'));

	// Menu groups by folder path (`Desserts`, `Desserts/Cinnamon Rolls`)
	const group = dirname(cookFile);
	// Parent headings must exist before nested ones or Qwik errors with "skipped a level"
	folders.forEach((_, i) => menu.set(folders.slice(0, i + 1).join('/'), menu.get(folders.slice(0, i + 1).join('/')) ?? []));
	menu.set(group, [...(menu.get(group) ?? []), `- [${name}](</${relative(routesDir, routeDir)}/index.mdx>)`]);
}

// https://qwik.dev/docs/advanced/menu/ - heading depth = folder depth
writeFileSync(join(routesDir, 'menu.md'), ['# Recipes', ...[...menu].flatMap(([group, links]) => [`${'#'.repeat(group.split('/').length + 1)} ${basename(group)}`, ...links])].join('\n\n') + '\n');

console.log(`Generated ${[...menu.values()].flat().length} recipes`);
