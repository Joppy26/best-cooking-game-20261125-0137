// main.ts — hands the Dapur Kilat entry in. The game is plain static files
// under game/ (game/index.html plus its ES modules, no library, no network),
// and this program copies game/ and screenshots/ from this repository to
// the output directory and writes /output/dossier.json with buildDossier
// from vendor/makefun-game.ts (the kit's copy, unchanged). It runs on Node
// 22 with the standard library only; nothing is installed before it runs.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFresh(name: string): void {
  const from = join(repoDir, name);
  const to = join(outputDir, name);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyFresh('game');
if (existsSync(join(repoDir, 'screenshots'))) {
  copyFresh('screenshots');
}

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes
// the dossier's bytes; the other limits refuse an entry the scorer would
// refuse (more than 4 screenshots or one over 256 KiB; more than 993 files
// in game/ or 48 MiB of game files in all, or a path under game/ over
// 1000 bytes).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
