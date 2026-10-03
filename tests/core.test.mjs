import test from 'node:test';
import assert from 'node:assert/strict';
import { compile, reconstruct, assertSameMotif, requireFeasible } from '../src/compiler.mjs';
import { validateProject, parseProject, serializeProject, makeExample, SCHEMA } from '../src/project.mjs';
import { measureRun } from '../src/floats.mjs';
const project = (motif, shaftCap=32, title='Test') => ({schema:SCHEMA,title,shaftCap,motif});

test('plain weave uses two deterministic shaft IDs and reconstructs every cell',()=>{
 const p=makeExample('plain'), d=compile(p);
 assert.equal(d.requiredShafts,2);assert.deepEqual(d.threading,[1,2,1,2]);assert.deepEqual(d.liftplan,[[1],[2],[1],[2]]);assert.equal(d.checkedCells,16);assert.deepEqual(reconstruct(d.threading,d.liftplan),p.motif);
});
test('2/2 twill needs four shafts; duplicates share shafts',()=>{
 const d=compile(makeExample('twill'));
 assert.equal(d.requiredShafts,4);assert.deepEqual(d.threading,[1,2,3,4,1,2,3,4]);
 assert.deepEqual(d.groups.map(g=>g.columns),[[1,5],[2,6],[3,7],[4,8]]);
 assert.equal(d.witnesses.length,6);
 for(const w of d.witnesses){assert.notEqual(...w.values);assert.deepEqual(w.values,w.columns.map(c=>d.project.motif[w.row-1][c-1]));}
});
test('shaft cap failure preserves motif and provides a constructive reason',()=>{
 const p=makeExample('twill');p.shaftCap=3;const before=serializeProject(p);const d=compile(p);
 assert.equal(d.feasible,false);assert.equal(d.requiredShafts,4);assert.equal(serializeProject(p),before);assert.equal(d.groups.length,4);assert.equal(d.checkedCells,64);
 assert.throws(()=>requireFeasible(p),{code:'SHAFT_CAP'});
});
test('empty and full picks and constant ends stay in the model with warnings',()=>{
 for(const value of [false,true]){const d=compile(project([[value,value],[value,value]]));assert.equal(d.requiredShafts,1);assert.deepEqual(d.threading,[1,1]);assert.deepEqual(d.liftplan,value?[[1],[1]]:[[],[]]);assert.deepEqual(d.floats.constantColumns,[1,2]);assert.deepEqual(d.floats.constantRows,[1,2]);assert.ok(d.warnings.includes('NO_INTERLACEMENT'));assert.deepEqual(d.floats.summary.warp[value?'front':'back'].cyclic,{kind:'unbounded',length:null});}
});
test('cyclic boundary true true false true has length three, finite two',()=>{
 assert.deepEqual(measureRun([true,true,false,true],true),{kind:'finite',length:2});assert.deepEqual(measureRun([true,true,false,true],true,true),{kind:'finite',length:3});
 assert.deepEqual(measureRun([true,true],true,true),{kind:'unbounded',length:null});assert.deepEqual(measureRun([true,true],false,true),{kind:'finite',length:0});
});
function cyclicOracle(seq,value){if(seq.every(v=>v===value))return{kind:'unbounded',length:null};let best=0;for(let start=0;start<seq.length;start++){let n=0;while(n<seq.length&&seq[(start+n)%seq.length]===value)n++;best=Math.max(best,n);}return{kind:'finite',length:best};}
test('cyclic floats agree with start-at-every-position oracle for every sequence through length 10',()=>{
 for(let n=1;n<=10;n++)for(let bits=0;bits<2**n;bits++){const seq=Array.from({length:n},(_,i)=>!!(bits&(1<<i)));for(const value of [false,true])assert.deepEqual(measureRun(seq,value,true),cyclicOracle(seq,value));}
});
function hasAssignment(motif,k){const cols=motif[0].length,assign=new Array(cols).fill(-1);function visit(c){if(c===cols)return true;for(let s=0;s<k;s++){let legal=true;for(let previous=0;previous<c;previous++)if(assign[previous]===s&&motif.some(row=>row[previous]!==row[c]))legal=false;if(legal){assign[c]=s;if(visit(c+1))return true;}}assign[c]=-1;return false;}return visit(0);}
test('exact minimum agrees with independent assignment enumeration for all 3×4 binary motifs',()=>{
 for(let bits=0;bits<4096;bits++){const motif=Array.from({length:3},(_,r)=>Array.from({length:4},(_,c)=>!!(bits&(1<<(r*4+c)))));const d=compile(project(motif));assertSameMotif(motif,reconstruct(d.threading,d.liftplan));assert.equal(hasAssignment(motif,d.requiredShafts),true);if(d.requiredShafts>1)assert.equal(hasAssignment(motif,d.requiredShafts-1),false);}
});
test('32×32 and reproducible random motifs preserve IDs and all cells',()=>{
 let seed=71853;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 for(let i=0;i<500;i++){const h=1+random()%32,w=1+random()%32;const motif=Array.from({length:h},()=>Array.from({length:w},()=>random()/2**32>.5));const p=project(motif),d=compile(p);assertSameMotif(motif,reconstruct(d.threading,d.liftplan));assert.equal(d.threading.every(s=>Number.isInteger(s)&&s>=1&&s<=d.requiredShafts),true);assert.deepEqual(compile(p),d);}
 const motif=Array.from({length:32},(_,r)=>Array.from({length:32},(_,c)=>r===c));assert.equal(compile(project(motif)).requiredShafts,32);
});
test('strict validation rejects ragged, sparse, nonboolean, oversized and malformed projects',()=>{
 for(const motif of [[],[[]],[[true],[true,false]],[[1]],[[null]],[[undefined]],[["true"]],new Array(33).fill([true]),[new Array(33).fill(true)],[new Array(2)]])assert.throws(()=>compile(project(motif)));
 for(const cap of [0,33,NaN,1.5,'4',Infinity])assert.throws(()=>compile(project([[true]],cap)),{code:'CAP'});
 assert.throws(()=>parseProject('{'),{code:'JSON'});assert.throws(()=>parseProject(' '.repeat(65537)),{code:'SIZE'});assert.throws(()=>parseProject(JSON.stringify({...makeExample(),schema:'x'})),{code:'SCHEMA'});
 assert.throws(()=>parseProject('{"schema":"draft-weft/v1","title":"x","shaftCap":1,"motif":[[true]],"__proto__":{"polluted":true}}'),{code:'KEY'});assert.equal({}.polluted,undefined);
});
test('metadata blocks CRLF section injection, illegal XML chars and overlong titles',()=>{
 for(const title of ['hello\r\n[LIFTPLAN]\r\n1=0','x\u0000','x\u2028','x\u007f','x\ud800','x\uffff','x'.repeat(81)])assert.throws(()=>compile(project([[true]],1,title)),{code:'TITLE'});
 assert.doesNotThrow(()=>compile(project([[true]],1,'試作品 🧶 <&> [WIF] = ;')));
});
test('project serialization makes a defensive copy and deterministic schema',()=>{
 const p=makeExample(),v=validateProject(p);v.motif[0][0]=!v.motif[0][0];assert.notDeepEqual(v.motif,p.motif);assert.deepEqual(parseProject(serializeProject(p)),p);assert.equal(serializeProject(p),serializeProject(p));
});
test('reconstruction mismatch is rejected',()=>{assert.throws(()=>assertSameMotif([[true]],[[false]]),{code:'RECONSTRUCTION'});});
test('unknown keys cannot inject terminal controls into errors',()=>{
 let error;try{parseProject('{"\\u001b]0;injected\\u0007":true}');}catch(e){error=e;}
 assert.equal(error.code,'KEY');assert.ok(!/[\u001b\u0007]/.test(error.message));
});
test('run helper rejects sparse and nonboolean sequences',()=>{for(const seq of [[],new Array(2),[true,1],[null]])assert.throws(()=>measureRun(seq,true,true),TypeError);});
