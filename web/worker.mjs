import { compile } from '../src/compiler.mjs';
import { exportBundle } from '../src/export.mjs';
self.onmessage = ({ data }) => {
  const { id, project } = data;
  try {
    const result = compile(project);
    const files = result.feasible ? exportBundle(project).files : null;
    self.postMessage({ id, result, files });
  } catch (error) {
    self.postMessage({ id, error: { code: error.code ?? 'COMPILE', message: error.message } });
  }
};
