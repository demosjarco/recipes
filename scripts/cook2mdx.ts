/**
 * Converts every `recipes/**\/*.cook` into a Qwik City MDX route + sidebar `menu.md`
 * Parsing, ingredient grouping and quantity formatting are done by cooklang-rs (`@cooklang/cooklang` is its WASM build), the same parser can later scale recipes via `parse(source, scale)`
 */
import { CooklangParser, cookware_display_name, cookware_should_be_listed, getQuantityValue, grouped_quantity_display, ingredient_display_name, ingredient_should_be_listed, quantity_display } from '@cooklang/cooklang';
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

/** Escapes text so MDX treats it as literal text, not markdown/JSX */
const escape = (text: string) => text.replace(/[\\`*_[\]{}<>#|]/g, (char) => `\\${char}`);
/** Matches the old cook-docs url scheme (`Buffalo Chicken Sandwich` → `buffalo-chicken-sandwich`) */
const slug = (name: string) => name.trim().replace(/\s+/g, '-').toLowerCase();
const image = (base: string) => ['.jpg', '.png', '.webp'].map((ext) => base + ext).find((path) => existsSync(path));

const recipesDir = 'recipes';
const routesDir = join('src', 'routes');

const parser = new CooklangParser();
// Inline quantities (bit 7) turn plain text like `360 F.` into a quantity and swallow the trailing period
parser.extensions &= ~(1 << 7);

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

	const [recipe, report] = parser.parse(readFileSync(join(recipesDir, cookFile), 'utf8'));
	if (report) console.warn(cookFile, report);

	// Steps are numbered per section by cooklang, notes (`> text`) are attached to the step before them
	const steps = recipe.sections
		.flatMap((section) => section.content)
		.reduce<{ text: string; notes: string[] }[]>((steps, content) => {
			if (content.type === 'step') {
				steps.push({
					text: content.value.items
						.map((item) => {
							switch (item.type) {
								case 'text':
									return item.value;
								case 'ingredient':
									return ingredient_display_name(recipe.ingredients[item.index]!);
								case 'cookware':
									return cookware_display_name(recipe.cookware[item.index]!);
								case 'timer': {
									const timer = recipe.timers[item.index]!;
									return timer.quantity ? quantity_display(timer.quantity) : (timer.name ?? '');
								}
								default:
									return quantity_display(recipe.inlineQuantities[item.index]!);
							}
						})
						.join('')
						.replace(/\s+/g, ' ')
						.trim(),
					notes: [],
				});
			} else {
				steps.at(-1)?.notes.push(content.value);
			}
			return steps;
		}, []);
	const stepImages = steps.map((_, i) => image(`${sourceBase}.${i + 1}`));

	const totalMinutes = recipe.timers.reduce((total, { quantity }) => {
		const value = getQuantityValue(quantity) ?? 0;
		const unit = quantity?.unit?.toLowerCase() ?? '';
		return total + (unit.startsWith('h') ? value * 60 : unit.startsWith('s') ? value / 60 : value);
	}, 0);
	const metadata = Object.fromEntries(recipe.rawMetadata) as Record<string, unknown>;

	const table = new Map<string, string>();
	if (metadata['servings']) table.set('🍽️ Serves', String(metadata['servings']));
	if (metadata['yield']) table.set('🥣 Yield', String(metadata['yield']));
	table.set('⏲️ Total Time', totalMinutes > 60 ? `${(totalMinutes / 60).toFixed(2)} hours` : `${Math.round(totalMinutes * 100) / 100} minutes`);

	const checklist = (items: string[]) => `<ul>\n${items.map((item) => `<li><label><input type="checkbox" /> ${escape(item)}</label></li>`).join('\n')}\n</ul>`;
	const source = recipe.source?.url ?? recipe.source?.name;

	// JSON is valid YAML, so frontmatter is the recipe's own frontmatter plus derived fields for future search/filtering
	const frontmatter = {
		...metadata,
		title: name,
		section: folders,
		ingredients: [...new Set(recipe.ingredients.filter(ingredient_should_be_listed).map(ingredient_display_name))],
		cookware: [...new Set(recipe.cookware.filter(cookware_should_be_listed).map(cookware_display_name))],
		totalMinutes: Math.round(totalMinutes * 100) / 100,
		comments: true,
	};

	const mdx = ['---', ...Object.entries(frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`), '---', ...[image(sourceBase), ...stepImages].map((path, i) => (path ? `import ${i ? `Step${i}` : 'Hero'} from ${importPath(path)};` : '')), '', `# ${escape(name)}`, '', image(sourceBase) ? `<Hero alt=${JSON.stringify(name)} />\n` : '', `| ${[...table.keys()].join(' | ')} |`, `| ${[...table.keys()].map(() => ':-:').join(' | ')} |`, `| ${[...table.values()].map(escape).join(' | ')} |`, '', '## Requirements', '', '<div class="tabs">', '<input type="radio" name="requirements" id="ingredients" aria-label="Ingredients" checked />', '<label for="ingredients">🧂 Ingredients</label>', '<input type="radio" name="requirements" id="cookware" aria-label="Cookware" />', '<label for="cookware">🍳 Cookware</label>', checklist(recipe.groupedIngredients.filter(([ingredient]) => ingredient_should_be_listed(ingredient)).map(([ingredient, quantity]) => `${grouped_quantity_display(quantity) || 'some'} ${ingredient_display_name(ingredient)}`)), checklist([...new Set(recipe.groupedCookware.filter(([cookware]) => cookware_should_be_listed(cookware)).map(([cookware, quantity]) => `${grouped_quantity_display(quantity) || '1'} ${cookware_display_name(cookware)}`))]), '</div>', '', '## 📝 Instructions', '', ...steps.flatMap(({ text, notes }, i) => [`### Step ${i + 1}`, '', escape(text), '', stepImages[i] ? `<Step${i + 1} alt="Step ${i + 1}" />\n` : '', ...notes.map((note) => `<aside class="note">\n\n${escape(note)}\n\n</aside>\n`)]), source ? `<details class="quote" open>\n<summary>Source</summary>\n\n${URL.canParse(source) ? `[${escape(source)}](<${source}>)` : escape(source)}\n\n</details>` : '', ''].join('\n');

	mkdirSync(routeDir, { recursive: true });
	writeFileSync(join(routeDir, 'index.mdx'), mdx.replace(/\n{3,}/g, '\n\n'));

	// Menu groups by folder path (`Desserts`, `Desserts/Cinnamon Rolls`). Parent headings must exist before nested ones or Qwik errors with "skipped a level"
	folders.forEach((_, i) => menu.set(folders.slice(0, i + 1).join('/'), menu.get(folders.slice(0, i + 1).join('/')) ?? []));
	menu.get(dirname(cookFile))!.push(`- [${name}](</${relative(routesDir, routeDir)}/index.mdx>)`);
}

// https://qwik.dev/docs/advanced/menu/ - heading depth = folder depth
writeFileSync(join(routesDir, 'menu.md'), ['# Recipes', ...[...menu].flatMap(([group, links]) => [`${'#'.repeat(group.split('/').length + 1)} ${basename(group)}`, ...links])].join('\n\n') + '\n');

console.log(`Generated ${[...menu.values()].flat().length} recipes`);
