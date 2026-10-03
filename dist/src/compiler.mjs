import { validateProject, DraftError } from './project.mjs';
import { analyzeFloats } from './floats.mjs';
export const MODEL = 'rising-shed/single-shaft-per-end/direct-liftplan';
export function reconstruct(threading, liftplan) {
  return liftplan.map(raised => threading.map(shaft => raised.includes(shaft)));
}
export function assertSameMotif(expected, actual) {
  if (expected.length !== actual.length || expected.some((row, r) => row.length !== actual[r]?.length || row.some((cell, c) => cell !== actual[r][c]))) throw new DraftError('RECONSTRUCTION', 'Reconstructed cells do not match the original motif.');
  return expected.length * expected[0].length;
}
export function compile(input) {
  const project = validateProject(input), { motif } = project;
  const groups = [], bySignature = new Map(), threading = [];
  for (let column = 0; column < motif[0].length; column++) {
    const signature = motif.map(row => row[column] ? '1' : '0').join('');
    if (!bySignature.has(signature)) {
      const group = { shaft: groups.length + 1, signature, columns: [] };
      bySignature.set(signature, group); groups.push(group);
    }
    const group = bySignature.get(signature);
    group.columns.push(column + 1); threading.push(group.shaft);
  }
  const liftplan = motif.map((_, row) => groups.filter(g => g.signature[row] === '1').map(g => g.shaft));
  const checkedCells = assertSameMotif(motif, reconstruct(threading, liftplan));
  const witnesses = [];
  for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
    const ga = groups[a], gb = groups[b];
    const row = [...ga.signature].findIndex((v, i) => v !== gb.signature[i]);
    witnesses.push({ shafts: [ga.shaft, gb.shaft], columns: [ga.columns[0], gb.columns[0]], row: row + 1, values: [ga.signature[row] === '1', gb.signature[row] === '1'] });
  }
  const floats = analyzeFloats(motif), requiredShafts = groups.length;
  return { model: MODEL, project, width: motif[0].length, height: motif.length, requiredShafts, feasible: requiredShafts <= project.shaftCap,
    groups, witnesses, threading, liftplan, checkedCells, floats,
    warnings: [
      ...(floats.constantColumns.length || floats.constantRows.length ? ['NO_INTERLACEMENT'] : []),
      ...(liftplan.some(pick => pick.length === 0) ? ['PYWEAVING_0_0_7_ZERO_LIFT'] : []),
      'MODEL_ONLY', 'ORIENTATION_UNVERIFIED',
    ] };
}
export function requireFeasible(input) {
  const result = compile(input);
  if (!result.feasible) throw new DraftError('SHAFT_CAP', `This fixed model needs ${result.requiredShafts} shafts; the cap is ${result.project.shaftCap}. The motif was not changed.`, { requiredShafts: result.requiredShafts, cap: result.project.shaftCap });
  return result;
}
