#!/usr/bin/env node
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MAX_INPUT_BYTES, parseProject, serializeProject, makeExample } from './project.mjs';
import { compile } from './compiler.mjs';
import { exportBundle } from './export.mjs';
const usage = `DraftWeft 0.1.0 — educational binary motif compiler
Usage:
  node src/cli.mjs example [plain|twill|boundary]
  node src/cli.mjs check project.json
  node src/cli.mjs export project.json NEW_OUTPUT_DIRECTORY

The output directory must not exist. No input files are modified.
Only draft-weft/v1 JSON is accepted. No general WIF import or loom control.
A shaft-cap failure exits 2 and preserves the motif; malformed input exits 1.
`;
try {
  const [command, file, destination, ...extra] = process.argv.slice(2);
  if (!command || command === '--help') { process.stdout.write(usage); }
  else if (command === 'example') {
    if (destination || extra.length || (file && !['plain', 'twill', 'boundary'].includes(file))) throw Error(usage);
    process.stdout.write(serializeProject(makeExample(file ?? 'twill')));
  } else {
    if (!['check', 'export'].includes(command) || !file || extra.length || (command === 'check' && destination) || (command === 'export' && !destination)) throw Error(usage);
    if ((await stat(file)).size > MAX_INPUT_BYTES) throw Error('Project JSON must be at most 64 KiB.');
    const project = parseProject(await readFile(file, 'utf8')), result = compile(project);
    if (!result.feasible) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n'); process.exitCode = 2;
    } else if (command === 'check') process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else {
      const { files } = exportBundle(project), root = resolve(destination);
      await mkdir(root); // No recursive or overwrite option: refuse an existing destination.
      for (const [name, contents] of Object.entries(files)) await writeFile(resolve(root, name), contents, { flag: 'wx' });
      process.stdout.write(JSON.stringify({ output: root, files: Object.keys(files), checkedCells: result.checkedCells, requiredShafts: result.requiredShafts }, null, 2) + '\n');
    }
  }
} catch (error) { process.stderr.write(`DraftWeft: ${error.message}\n`); process.exitCode = 1; }
