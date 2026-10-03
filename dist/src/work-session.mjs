// Separates current input from in-flight work and makes stale messages harmless.
export class WorkSession {
  constructor({ createWorker, onResult, onError, budgetMs = 5000, timer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { createWorker, onResult, onError, budgetMs, timer, clearTimer });
    this.epoch = 0; this.worker = null; this.timeout = null;
  }
  cancel() {
    this.epoch++;
    if (this.worker) this.worker.terminate();
    if (this.timeout !== null) this.clearTimer(this.timeout);
    this.worker = null; this.timeout = null;
  }
  start(project) {
    this.cancel(); const id = this.epoch;
    let worker;
    try { worker = this.createWorker(); } catch { this.onError({ code: 'WORKER', message: 'Worker could not start.' }); return; }
    this.worker = worker;
    const stop = () => { worker.terminate(); this.worker = null; if (this.timeout !== null) this.clearTimer(this.timeout); this.timeout = null; };
    worker.onmessage = ({ data }) => {
      if (id !== this.epoch || data.id !== id || worker !== this.worker) return;
      stop(); if (data.error) this.onError(data.error); else this.onResult(data);
    };
    worker.onerror = () => { if (id !== this.epoch || worker !== this.worker) return; stop(); this.onError({ code: 'WORKER', message: 'Worker failed.' }); };
    this.timeout = this.timer(() => { if (id !== this.epoch || worker !== this.worker) return; this.cancel(); this.onError({ code: 'BUDGET', message: 'Time budget exceeded.' }); }, this.budgetMs);
    try { worker.postMessage({ id, project }); } catch { stop(); this.onError({ code: 'WORKER', message: 'Worker could not receive the project.' }); }
  }
}
