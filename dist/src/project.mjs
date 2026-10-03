export const LIMIT = 32;
export const MAX_INPUT_BYTES = 65536;
export const SCHEMA = 'draft-weft/v1';

export class DraftError extends Error {
  constructor(code, message, details = {}) {
    super(message); this.name = 'DraftError'; this.code = code; this.details = details;
  }
}
const fail = (code, message) => { throw new DraftError(code, message); };
const exactKeys = (value, keys) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('OBJECT', 'Expected a project object.');
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail('KEY', `Unknown project field: ${JSON.stringify(key.slice(0, 60))}`);
};
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > LIMIT) fail('ROWS', 'Weft rows must be between 1 and 32.');
  if (!Array.isArray(matrix[0]) || matrix[0].length < 1 || matrix[0].length > LIMIT) fail('COLUMNS', 'Warp columns must be between 1 and 32.');
  const width = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== width) fail('RECTANGLE', 'Every row must have the same width.');
    // An indexed loop rejects sparse arrays too.
    for (let c = 0; c < width; c++) if (typeof row[c] !== 'boolean') fail('BOOLEAN', 'Every motif cell must be true or false.');
  }
  return matrix.map(row => [...row]);
}
export function validateProject(input) {
  exactKeys(input, ['schema', 'title', 'shaftCap', 'motif']);
  if (input.schema !== SCHEMA) fail('SCHEMA', 'Expected schema draft-weft/v1.');
  if (typeof input.title !== 'string' || [...input.title].length > 80 || /[\u0000-\u001f\u007f-\u009f\u2028\u2029\ud800-\udfff\ufffe\uffff]/u.test(input.title)) fail('TITLE', 'Title must be at most 80 characters without control characters or line breaks.');
  if (!Number.isInteger(input.shaftCap) || input.shaftCap < 1 || input.shaftCap > LIMIT) fail('CAP', 'Shaft cap must be an integer between 1 and 32.');
  return { schema: SCHEMA, title: input.title, shaftCap: input.shaftCap, motif: validateMatrix(input.motif) };
}
export function parseProject(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_INPUT_BYTES) fail('SIZE', 'Project JSON must be at most 64 KiB.');
  let parsed;
  try { parsed = JSON.parse(text); } catch { fail('JSON', 'Project is not valid JSON.'); }
  return validateProject(parsed);
}
export const serializeProject = input => JSON.stringify(validateProject(input), null, 2) + '\n';
export function makeExample(kind = 'twill') {
  const size = kind === 'plain' ? 4 : kind === 'boundary' ? 4 : 8;
  const motif = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) =>
    kind === 'plain' ? (r + c) % 2 === 0 : kind === 'boundary' ? [true, true, false, true][c] : (c - r + size) % 4 < 2));
  return { schema: SCHEMA, title: kind === 'plain' ? 'Plain weave' : kind === 'boundary' ? 'Repeat boundary study' : 'Two-over-two twill', shaftCap: 4, motif };
}
