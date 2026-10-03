// Independent release review: deliberately no compiler reconstruction or WIF readback imports.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync, symlinkSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compile } from '../src/compiler.mjs';
import { measureRun, analyzeFloats } from '../src/floats.mjs';
import { parseProject, validateProject, SCHEMA } from '../src/project.mjs';
import { exportWif, exportSvg, exportBundle } from '../src/export.mjs';
const project = motif => ({ schema: SCHEMA, title: 'Independent oracle', shaftCap: 32, motif });
const decode = (mask, h, w) => Array.from({length:h}, (_,r) => Array.from({length:w}, (_,c) => !!(mask & (1 << (r*w+c)))));

// Enumerate all shaft assignments and all possible lift sequences. This does not
// group columns or use the compiler's inverse and gives an independent lower bound.
function physicalMinimums(h, w) {
  const minima = new Map();
  for (let k=1; k<=w; k++) {
    for (let assignment=0; assignment<k**w; assignment++) {
      const shafts = []; let digits=assignment;
      for (let c=0; c<w; c++) { shafts.push(digits % k); digits=Math.floor(digits/k); }
      for (let lifts=0; lifts<2**(k*h); lifts++) {
        let mask=0;
        for (let r=0; r<h; r++) for (let c=0; c<w; c++) {
          if (lifts & (1 << (r*k+shafts[c]))) mask |= 1 << (r*w+c);
        }
        if (!minima.has(mask)) minima.set(mask,k);
      }
    }
  }
  return minima;
}

// Separate byte consumer: extract sections, interpret each shaft as an integer
// bit, then compose warp bits and pick bits. Never calls a production parser.
function independentWifDrawdown(bytes) {
  assert.equal(Buffer.from(bytes, 'ascii').toString('ascii'), bytes);
  const sections = Object.create(null);
  let current;
  for (const line of bytes.split(/\r?\n/)) {
    if (!line.trim() || /^\s*;/.test(line)) continue;
    const header = /^\[([^\]]+)\]$/.exec(line);
    if (header) { current=header[1]; assert.equal(sections[current],undefined); sections[current]=Object.create(null); continue; }
    const eq=line.indexOf('=');assert.ok(current && eq>0);const key=line.slice(0,eq);assert.equal(sections[current][key],undefined);sections[current][key]=line.slice(eq+1);
  }
  assert.equal(sections.WIF.Version,'1.1');
  assert.equal(sections.WEAVING['Rising Shed'],'true');
  assert.equal(sections.WEAVING.Treadles,'0');
  assert.equal(sections.TIEUP,undefined);assert.equal(sections.TREADLING,undefined);
  for (const s of Object.keys(sections)) if (!['WIF','CONTENTS'].includes(s)) assert.equal(sections.CONTENTS[s],'true');
  const w=Number(sections.WARP.Threads), h=Number(sections.WEFT.Threads), k=Number(sections.WEAVING.Shafts);
  assert.equal(Object.keys(sections.THREADING).length,w);assert.equal(Object.keys(sections.LIFTPLAN).length,h);
  const masks=Array.from({length:h},(_,r)=>{
    const ids=sections.LIFTPLAN[r+1].split(',').map(Number);
    if (ids.length===1 && ids[0]===0) return 0n;
    return ids.reduce((mask,id)=>{ assert.ok(Number.isInteger(id) && id>=1 && id<=k);return mask | 1n<<BigInt(id-1);},0n);
  });
  return masks.map(mask=>Array.from({length:w},(_,c)=>{
    const id=Number(sections.THREADING[c+1]);assert.ok(Number.isInteger(id) && id>=1 && id<=k);
    return (mask & (1n<<BigInt(id-1)))!==0n;
  }));
}

test('independent exhaustive physical models establish all 512 minima and WIF cells for 3x3',()=>{
  const minima=physicalMinimums(3,3);assert.equal(minima.size,512);
  for (let mask=0;mask<512;mask++) {
    const p=project(decode(mask,3,3)), before=JSON.stringify(p), d=compile(p);
    assert.equal(d.requiredShafts,minima.get(mask),`physical minimum mask ${mask}`);
    assert.equal(d.checkedCells,9);assert.equal(JSON.stringify(p),before);
    assert.equal(d.warnings.includes('PYWEAVING_0_0_7_ZERO_LIFT'),p.motif.some(row=>row.every(cell=>cell===false)));
    assert.equal(d.witnesses.length,d.requiredShafts*(d.requiredShafts-1)/2);
    for (const witness of d.witnesses) {
      const [a,b]=witness.columns;assert.notEqual(p.motif[witness.row-1][a-1],p.motif[witness.row-1][b-1]);
      assert.deepEqual(witness.values,[p.motif[witness.row-1][a-1],p.motif[witness.row-1][b-1]]);
    }
    assert.deepEqual(independentWifDrawdown(exportWif(p)),p.motif,`WIF mask ${mask}`);
    if (d.requiredShafts>1) {
      p.shaftCap=d.requiredShafts-1;const capBefore=JSON.stringify(p);assert.equal(compile(p).feasible,false);
      assert.throws(()=>exportBundle(p),e=>e.code==='SHAFT_CAP');assert.equal(JSON.stringify(p),capBefore);
    }
  }
});

test('maximum 32-shaft asymmetric profile preserves row/column order through independent WIF bits',()=>{
  const p=project(Array.from({length:32},(_,r)=>Array.from({length:32},(_,c)=>r===c)));
  assert.equal(compile(p).requiredShafts,32);assert.deepEqual(independentWifDrawdown(exportWif(p)),p.motif);
  p.motif=Array.from({length:7},(_,r)=>Array.from({length:11},(_,c)=>((r*17+c*3+r*c)%7)<3));
  assert.deepEqual(independentWifDrawdown(exportWif(p)),p.motif);
});

function independentRun(sequence,value,cyclic) {
  if (cyclic && sequence.every(cell=>cell===value)) return {kind:'unbounded',length:null};
  let length=0;
  for (let start=0; start<sequence.length; start++) {
    let run=0;
    while (run<sequence.length && (cyclic || start+run<sequence.length) && sequence[(start+run)%sequence.length]===value) run++;
    length=Math.max(length,run);
  }
  return {kind:'finite',length};
}
test('all sequences through length 9 match independent finite/cyclic run oracle, both faces',()=>{
  for(let n=1;n<=9;n++)for(let mask=0;mask<2**n;mask++){
    const sequence=Array.from({length:n},(_,i)=>!!(mask&(1<<i)));
    for(const value of [false,true])for(const cyclic of [false,true])assert.deepEqual(measureRun(sequence,value,cyclic),independentRun(sequence,value,cyclic),JSON.stringify({sequence,value,cyclic}));
  }
  const f=analyzeFloats([[true,true,false,true],[true,true,false,true]]);
  assert.deepEqual(f.summary.weft.back,{finite:{kind:'finite',length:2},cyclic:{kind:'finite',length:3}});
  assert.deepEqual(f.summary.warp.front.cyclic,{kind:'unbounded',length:null});
  assert.deepEqual(f.summary.warp.back.cyclic,{kind:'unbounded',length:null});
});

test('title injection stays text; invalid XML characters are rejected before SVG generation',()=>{
  const p=project([[true,false],[false,true]]);p.title='</title><script>alert(1)</script>&"\' [WEAVING]=0';
  const svg=exportSvg(p);assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));
  assert.deepEqual(independentWifDrawdown(exportWif(p)),p.motif);
  for(const value of ['\n[LIFTPLAN]\n1=1','\r','\u0000','\u001f','\u007f','\u0085','\u2028','\u2029','\ufffe','\uffff','\ud800','\udfff']) {
    assert.throws(()=>validateProject({...p,title:`Bad${value}`}),e=>e.code==='TITLE',`invalid title ${JSON.stringify(value)}`);
  }
  p.title='🧵'.repeat(80);assert.doesNotThrow(()=>validateProject(p));
  assert.throws(()=>validateProject({...p,title:'🧵'.repeat(81)}),e=>e.code==='TITLE');
});

test('strict import guard refuses coercion, sparse/oversized matrices, unsafe fields and 64KiB overflow',()=>{
  const p=project([[true,false]]);
  for(const motif of [[],[[]],[[1,0]],[[true],[false,true]],[Array(2)],Array.from({length:33},()=>[true]),[Array(33).fill(false)]])assert.throws(()=>validateProject({...p,motif}));
  for(const shaftCap of [0,33,1.5,'2',NaN,Infinity])assert.throws(()=>validateProject({...p,shaftCap}));
  assert.throws(()=>parseProject(JSON.stringify({...p,html:'<script/>'})),e=>e.code==='KEY');
  assert.throws(()=>parseProject(JSON.stringify({...p,['\u001b]0;injected\u0007']:true})),e=>e.code==='KEY' && !/[\u0000-\u001f\u007f-\u009f]/.test(e.message),'unknown-key diagnostics must not include terminal controls');
  assert.throws(()=>parseProject('{"__proto__":{},"schema":"draft-weft/v1"}'),e=>e.code==='KEY');
  assert.throws(()=>parseProject('[WIF]\nVersion=1.1'),e=>e.code==='JSON');
  assert.throws(()=>parseProject(JSON.stringify({...p,schema:'draft-weft/v2'})),e=>e.code==='SCHEMA');
  assert.throws(()=>parseProject(' '.repeat(65537)),e=>e.code==='SIZE');
  assert.throws(()=>parseProject('🧵'.repeat(16385)),e=>e.code==='SIZE');
});

test('CLI refuses overwrite and symlink destinations; invalid/cap-failed imports create no output',()=>{
  const dir=mkdtempSync(join(tmpdir(),'draft-weft-review-'));
  const cli=resolve('src/cli.mjs'), p=project([[true,false],[false,true]]), input=join(dir,'input.json');writeFileSync(input,JSON.stringify(p));
  const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:5000});
  try {
    const destination=join(dir,'output');let result=run('export',input,destination);assert.equal(result.status,0,result.stderr);assert.equal(readdirSync(destination).length,5);
    const old=readFileSync(join(destination,'draft-weft.wif'));result=run('export',input,destination);assert.equal(result.status,1);assert.deepEqual(readFileSync(join(destination,'draft-weft.wif')),old);
    const target=join(dir,'target');mkdirSync(target);writeFileSync(join(target,'sentinel'),'untouched');symlinkSync(target,join(dir,'link'),'dir');result=run('export',input,join(dir,'link'));assert.equal(result.status,1);assert.deepEqual(readdirSync(target),['sentinel']);
    p.shaftCap=1;writeFileSync(input,JSON.stringify(p));result=run('export',input,join(dir,'cap'));assert.equal(result.status,2,result.stderr);assert.equal(existsSync(join(dir,'cap')),false);assert.deepEqual(JSON.parse(readFileSync(input,'utf8')),p);
    writeFileSync(input,'[WIF]\nVersion=1.1');result=run('export',input,join(dir,'invalid'));assert.equal(result.status,1);assert.equal(existsSync(join(dir,'invalid')),false);
    writeFileSync(input,' '.repeat(65537));result=run('check',input);assert.equal(result.status,1);assert.match(result.stderr,/64 KiB/);
    assert.equal(run('example','unknown').status,1);assert.equal(run('check',input,'ignored').status,1);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
