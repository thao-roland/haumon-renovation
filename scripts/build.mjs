#!/usr/bin/env node
/**
 * Produit `dist/` : uniquement ce qui doit être servi en production.
 *
 * Les sources (main.css, src.css, tailwind.config.js, node_modules, README)
 * restent en dehors du dossier publié.
 */
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets', 'css'), { recursive: true });
await mkdir(join(dist, 'assets', 'js'), { recursive: true });

// 1. Feuille Tailwind compilée, directement dans dist/
run('npx', ['tailwindcss', '-i', 'assets/css/src.css', '-o', 'dist/assets/css/site.css', '--minify']);

// 2. Pages HTML
const pages = (await readdir(root)).filter((f) => f.endsWith('.html'));
if (pages.length === 0) throw new Error('Aucune page HTML trouvée à la racine.');
for (const page of pages) {
  await cp(join(root, page), join(dist, page));
}

// 3. JavaScript
await cp(join(root, 'assets', 'js'), join(dist, 'assets', 'js'), { recursive: true });

const { size } = await stat(join(dist, 'assets', 'css', 'site.css'));
console.log(
  `\ndist/ → ${pages.length} pages · site.css ${(size / 1024).toFixed(1)} ko\n` +
    pages.map((p) => `  · ${p}`).join('\n')
);
