import { requireFeasible, assertSameMotif, reconstruct } from './compiler.mjs';
import { verifyWifBytes } from './wif-readback.mjs';
import { serializeProject } from './project.mjs';
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const ascii = value => [...value].map(c => /^[\x20-\x7e]$/.test(c) ? c : '?').join('');
export function exportWif(input) {
  const result = requireFeasible(input), { project, requiredShafts, width, height, threading, liftplan } = result;
  const sections = ['TEXT', 'COLOR PALETTE', 'COLOR TABLE', 'WEAVING', 'WARP', 'WEFT', 'THREADING', 'LIFTPLAN'];
  const lines = [
    '[WIF]', 'Version=1.1', 'Date=April 20, 1997', 'Developers=DraftWeft contributors', 'Source Program=DraftWeft', 'Source Version=0.1.0', '',
    '[CONTENTS]', ...sections.map(s => `${s}=true`), '',
    '[TEXT]', `Title=${ascii(project.title)}`, '',
    '[COLOR PALETTE]', 'Entries=2', 'Range=0,255', '',
    '[COLOR TABLE]', '1=31,71,73', '2=237,215,171', '',
    '[WEAVING]', `Shafts=${requiredShafts}`, 'Treadles=0', 'Rising Shed=true', '',
    '[WARP]', `Threads=${width}`, 'Color=1', 'Units=Centimeters', '', '[WEFT]', `Threads=${height}`, 'Color=2', 'Units=Centimeters', '',
    '[THREADING]', ...threading.map((s, i) => `${i + 1}=${s}`), '',
    '[LIFTPLAN]', ...liftplan.map((raised, i) => `${i + 1}=${raised.length ? raised.join(',') : '0'}`), '',
  ];
  const text = lines.join('\r\n');
  verifyWifBytes(text, project.motif);
  return text;
}
export function exportThreading(input) {
  const result = requireFeasible(input);
  const lines = ['DraftWeft numbered threading and direct liftplan', `Title: ${result.project.title}`, `Model: ${result.model}`, 'Orientation: warp 1 is the left column; pick 1 is the top row; true means warp up.', `Shafts: ${result.requiredShafts}; verified cells: ${result.checkedCells}`, '', 'WARP END -> SHAFT', ...result.threading.map((s, i) => `${i + 1} -> ${s}`), '', 'PICK -> RAISED SHAFTS', ...result.liftplan.map((s, i) => `${i + 1} -> ${s.join(', ') || '(none)'}`), '', 'Educational geometry only. Confirm orientation and loom suitability independently.', 'No cloth-quality, physical-size, yarn-physics, safety, or loom-control claim.'];
  return lines.join('\n') + '\n';
}
export function exportReport(input) {
  const result = requireFeasible(input);
  return JSON.stringify(result, null, 2) + '\n';
}
export function exportSvg(input) {
  const d = requireFeasible(input); assertSameMotif(d.project.motif, reconstruct(d.threading, d.liftplan));
  const titlePoints = [...d.project.title], titleLines = [titlePoints.slice(0, 40).join(''), titlePoints.slice(40).join('')].filter(Boolean);
  const titleOffset = titleLines.length > 1 ? 20 : 0;
  const cell = 22, left = 58, top = 145 + titleOffset, gap = 85;
  const threadingHeight = d.requiredShafts * cell, mainTop = top + threadingHeight + 52;
  const liftLeft = left + d.width * cell + gap;
  const width = Math.max(790, liftLeft + d.requiredShafts * cell + 45);
  const repeatTop = mainTop + d.height * cell + 98, repeatCell = 8;
  const height = repeatTop + d.height * repeatCell * 3 + 115;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${xml(d.project.title)} — DraftWeft draft</title>`, '<desc id="desc">Numbered threading, rising-shed direct liftplan, verified binary drawdown, and three by three repeat. Warp one left, pick one top. Educational geometry, not loom instructions.</desc>',
    '<style>text{font-family:system-ui,sans-serif;fill:#173b3d} .small{font-size:11px} .label{font-size:15px;font-weight:600} .cell{stroke:#91a2a1;stroke-width:.55}</style>', `<rect width="${width}" height="${height}" fill="#fffdf8"/>`];
  const text = (x, y, value, cls = 'small') => out.push(`<text x="${x}" y="${y}" class="${cls}">${xml(value)}</text>`);
  const rect = (x, y, w, h, fill) => out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" class="cell"/>`);
  text(left, 35, 'DraftWeft', 'label'); titleLines.forEach((line, i) => text(left, 62 + i * 20, line, 'label'));
  text(left, 85 + titleOffset, `${d.width} warp ends × ${d.height} picks · ${d.requiredShafts} shafts · ${d.checkedCells} cells reconstructed`);
  text(left, 105 + titleOffset, 'Warp 1 = left; pick 1 = top; dark = warp up. Single shaft per end, rising shed, direct liftplan.');
  text(left, top - 22, 'THREADING · column = warp end; row = shaft', 'label');
  for (let s = 0; s < d.requiredShafts; s++) {
    text(left - 24, top + s * cell + 15, s + 1);
    for (let c = 0; c < d.width; c++) rect(left + c * cell, top + s * cell, cell, cell, d.threading[c] === s + 1 ? '#1f4749' : '#fffdf8');
  }
  for (let c = 0; c < d.width; c++) { text(left + c * cell + 5, top - 5, c + 1); text(left + c * cell + 5, mainTop - 5, c + 1); }
  text(left, mainTop - 27, 'VERIFIED DRAWDOWN', 'label'); text(liftLeft, mainTop - 27, 'LIFTPLAN · shafts up', 'label');
  for (let s = 0; s < d.requiredShafts; s++) text(liftLeft + s * cell + 5, mainTop - 5, s + 1);
  for (let r = 0; r < d.height; r++) {
    text(left - 24, mainTop + r * cell + 15, r + 1); text(liftLeft - 24, mainTop + r * cell + 15, r + 1);
    for (let c = 0; c < d.width; c++) rect(left + c * cell, mainTop + r * cell, cell, cell, d.project.motif[r][c] ? '#1f4749' : '#edd7ab');
    for (let s = 0; s < d.requiredShafts; s++) rect(liftLeft + s * cell, mainTop + r * cell, cell, cell, d.liftplan[r].includes(s + 1) ? '#1f4749' : '#fffdf8');
  }
  text(left, repeatTop - 29, '3 × 3 REPEAT · schematic only', 'label');
  for (let r = 0; r < d.height * 3; r++) for (let c = 0; c < d.width * 3; c++) rect(left + c * repeatCell, repeatTop + r * repeatCell, repeatCell, repeatCell, d.project.motif[r % d.height][c % d.width] ? '#1f4749' : '#edd7ab');
  for (let n = 1; n < 3; n++) {
    out.push(`<path d="M${left + n * d.width * repeatCell} ${repeatTop}v${d.height * repeatCell * 3}" stroke="#b54821" stroke-width="1.5"/>`);
    out.push(`<path d="M${left} ${repeatTop + n * d.height * repeatCell}h${d.width * repeatCell * 3}" stroke="#b54821" stroke-width="1.5"/>`);
  }
  text(left, height - 71, 'Repeat floats join across edges; constant rows/columns have unbounded repeat runs.');
  text(left, height - 51, 'No cloth-quality, safety, physical-size, yarn-physics, or loom-control claim.');
  text(left, height - 31, 'Cross-application orientation is unverified. Confirm in the receiving software before practical use.');
  out.push('</svg>'); return out.join('\n') + '\n';
}
export function exportBundle(input) {
  const result = requireFeasible(input);
  return { result, files: {
    'draft-weft.wif': exportWif(input), 'draft-weft.svg': exportSvg(input),
    'draft-weft-threading.txt': exportThreading(input), 'draft-weft-report.json': exportReport(input),
    'draft-weft-project.json': serializeProject(input),
  } };
}
