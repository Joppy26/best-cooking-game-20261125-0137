// main.ts — hands the Warung Rush entry in: copies game/ and screenshots/
// from this repository to the output directory and writes dossier.json
// with buildDossier from vendor/makefun-game.ts (the kit's copy, unchanged).

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name: string): void {
  const from = join(repoDir, name);
  const to = join(outputDir, name);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

function handInEntry(): void {
  mkdirSync(outputDir, { recursive: true });
  copyTree('game');
  copyTree('screenshots');
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handInEntry();
