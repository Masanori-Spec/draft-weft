// A deliberately narrow verifier for our own exported bytes, not a WIF importer.
// Independent of the compiler, signature grouping, and its reconstruction helper.
export function verifyWifBytes(text, expected) {
  const bad = reason => { throw new Error(`WIF readback failed: ${reason}`); };
  if (typeof text !== 'string' || text.length > 65536 || /[^\x09\x0a\x0d\x20-\x7e]/.test(text)) bad('ASCII text budget');
  const sections = new Map(); let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(';')) continue;
    if (/^\[[^\[\]]+\]$/.test(line)) {
      const name = line.slice(1, -1).toUpperCase();
      if (sections.has(name)) bad('duplicate section');
      current = new Map(); sections.set(name, current); continue;
    }
    const at = line.indexOf('=');
    if (!current || at < 1) bad('assignment');
    const key = line.slice(0, at).trim().toUpperCase();
    if (current.has(key)) bad('duplicate key');
    current.set(key, line.slice(at + 1).trim());
  }
  const get = (s, k) => sections.get(s)?.get(k);
  const known = ['WIF', 'CONTENTS', 'TEXT', 'COLOR PALETTE', 'COLOR TABLE', 'WEAVING', 'WARP', 'WEFT', 'THREADING', 'LIFTPLAN'];
  if (sections.size !== known.length || known.some(s => !sections.has(s))) bad('section profile');
  for (const name of known.filter(s => !['WIF', 'CONTENTS'].includes(s))) if (get('CONTENTS', name) !== 'true') bad('contents');
  if (sections.get('CONTENTS').size !== known.length - 2) bad('contents count');
  if (get('WIF', 'VERSION') !== '1.1' || !get('WIF', 'DATE') || !get('WIF', 'DEVELOPERS') || get('WIF', 'SOURCE PROGRAM') !== 'DraftWeft') bad('identity');
  const number = (s, k, min, max) => {
    const raw = get(s, k); if (!/^\d+$/.test(raw ?? '')) bad(`${s}.${k}`);
    const n = Number(raw); if (!Number.isInteger(n) || n < min || n > max) bad(`${s}.${k} range`); return n;
  };
  const shafts = number('WEAVING', 'SHAFTS', 1, 32), width = number('WARP', 'THREADS', 1, 32), height = number('WEFT', 'THREADS', 1, 32);
  if (number('WEAVING', 'TREADLES', 0, 0) !== 0 || get('WEAVING', 'RISING SHED') !== 'true') bad('rising-shed direct profile');
  if (get('COLOR PALETTE', 'ENTRIES') !== '2' || get('COLOR PALETTE', 'RANGE') !== '0,255' || get('COLOR TABLE', '1') !== '31,71,73' || get('COLOR TABLE', '2') !== '237,215,171' || get('WARP', 'COLOR') !== '1' || get('WEFT', 'COLOR') !== '2') bad('palette');
  if (sections.get('THREADING').size !== width || sections.get('LIFTPLAN').size !== height) bad('structure length');
  const threading = Array.from({ length: width }, (_, i) => number('THREADING', String(i + 1), 1, shafts));
  const liftplan = Array.from({ length: height }, (_, i) => {
    const raw = get('LIFTPLAN', String(i + 1));
    if (raw === '0') return [];
    if (!/^\d+(,\d+)*$/.test(raw ?? '')) bad('lift row');
    const values = raw.split(',').map(Number);
    if (values.some((n, j) => n < 1 || n > shafts || (j > 0 && n <= values[j - 1]))) bad('shaft IDs');
    return values;
  });
  const motif = [];
  for (let r = 0; r < height; r++) {
    const row = [];
    for (let c = 0; c < width; c++) row.push(liftplan[r].some(s => s === threading[c]));
    motif.push(row);
  }
  if (expected.length !== height || expected.some((row, r) => row.length !== width || row.some((v, c) => v !== motif[r][c]))) bad('cell mismatch');
  return { checkedCells: width * height, motif, threading, liftplan, shafts };
}
