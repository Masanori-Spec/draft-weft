// Geometry of Boolean sequences, not yarn physics or fabric advice.
export function measureRun(sequence, value, cyclic = false) {
  if (!Array.isArray(sequence) || sequence.length < 1 || Array.from(sequence).some(v => typeof v !== 'boolean') || typeof value !== 'boolean') throw new TypeError('Expected a non-empty Boolean sequence and Boolean value.');
  if (cyclic && sequence.every(v => v === value)) return { kind: 'unbounded', length: null };
  let current = 0, maximum = 0;
  const n = sequence.length;
  for (let i = 0; i < (cyclic ? 2 * n : n); i++) {
    current = sequence[i % n] === value ? current + 1 : 0;
    maximum = Math.max(maximum, current);
  }
  return { kind: 'finite', length: maximum };
}
const combine = entries => entries.some(x => x.kind === 'unbounded') ? { kind: 'unbounded', length: null } : { kind: 'finite', length: Math.max(...entries.map(x => x.length)) };
export function analyzeFloats(motif) {
  const rows = motif.length, cols = motif[0].length, lines = [];
  for (const axis of ['warp', 'weft']) {
    const count = axis === 'warp' ? cols : rows;
    for (let index = 0; index < count; index++) {
      const sequence = axis === 'warp' ? motif.map(row => row[index]) : motif[index];
      const frontValue = axis === 'warp';
      lines.push({ axis, index: index + 1, constant: sequence.every(x => x === sequence[0]),
        front: { finite: measureRun(sequence, frontValue), cyclic: measureRun(sequence, frontValue, true) },
        back: { finite: measureRun(sequence, !frontValue), cyclic: measureRun(sequence, !frontValue, true) } });
    }
  }
  const summary = {};
  for (const axis of ['warp', 'weft']) {
    summary[axis] = {};
    for (const face of ['front', 'back']) summary[axis][face] = {
      finite: combine(lines.filter(x => x.axis === axis).map(x => x[face].finite)),
      cyclic: combine(lines.filter(x => x.axis === axis).map(x => x[face].cyclic)),
    };
  }
  return { summary, lines, constantColumns: lines.filter(x => x.axis === 'warp' && x.constant).map(x => x.index), constantRows: lines.filter(x => x.axis === 'weft' && x.constant).map(x => x.index) };
}
