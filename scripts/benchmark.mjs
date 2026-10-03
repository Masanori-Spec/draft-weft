import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import { compile } from '../src/compiler.mjs';
import { exportBundle } from '../src/export.mjs';
const project={schema:'draft-weft/v1',title:'Maximum-size synthetic identity motif',shaftCap:32,motif:Array.from({length:32},(_,r)=>Array.from({length:32},(_,c)=>r===c))};
const times=[];for(let i=0;i<50;i++){const start=performance.now();compile(project);times.push(performance.now()-start);}const start=performance.now(),bundle=exportBundle(project),exportMs=performance.now()-start;
const result={environment:{node:process.version,platform:process.platform,arch:process.arch},input:{rows:32,columns:32,shafts:32},repetitions:50,compileMs:{min:Math.min(...times),median:[...times].sort((a,b)=>a-b)[25],max:Math.max(...times)},exportBundleMs:exportMs,checkedCells:bundle.result.checkedCells,artifactBytes:Object.fromEntries(Object.entries(bundle.files).map(([k,v])=>[k,Buffer.byteLength(v)])),claim:'Single local synthetic measurement, not a performance guarantee'};
await writeFile('docs/evidence/benchmark.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
