import test from 'node:test';
import assert from 'node:assert/strict';
import { makeExample, SCHEMA } from '../src/project.mjs';
import { exportWif, exportSvg, exportBundle, exportThreading } from '../src/export.mjs';
import { verifyWifBytes } from '../src/wif-readback.mjs';
import { spawnSync } from 'node:child_process';
const p=(motif,title='Export')=>({schema:SCHEMA,title,shaftCap:32,motif});
test('WIF includes identity, CONTENTS, palette and direct-liftplan only',()=>{
 const input=makeExample(),text=exportWif(input);assert.ok(text.startsWith('[WIF]\r\nVersion=1.1\r\n'));
 for(const token of ['Developers=DraftWeft contributors','Source Program=DraftWeft','[CONTENTS]','COLOR PALETTE=true','LIFTPLAN=true','[COLOR PALETTE]','Entries=2','Range=0,255','[THREADING]','[LIFTPLAN]','Treadles=0','Rising Shed=true'])assert.ok(text.includes(token),token);
 assert.ok(!text.includes('[TIEUP]')&&!text.includes('[TREADLING]'));assert.ok(!/(?<!\r)\n/.test(text));assert.equal(verifyWifBytes(text,input.motif).checkedCells,64);
});
test('all 2×4 motifs roundtrip exported bytes independently, including zero lifts',()=>{
 for(let bits=0;bits<256;bits++){const motif=Array.from({length:2},(_,r)=>Array.from({length:4},(_,c)=>!!(bits&(1<<(r*4+c)))));assert.deepEqual(verifyWifBytes(exportWif(p(motif)),motif).motif,motif);}
 assert.ok(exportWif(p([[false],[true]])).includes('[LIFTPLAN]\r\n1=0\r\n2=1'));
});
test('tampered sections, counts, IDs, duplicate keys and wrong cells fail readback',()=>{
 const input=makeExample('plain'),s=exportWif(input);
 for(const bad of [s.replace('[WIF]','[OTHER]'),s.replace('LIFTPLAN=true','LIFTPLAN=false'),s.replace('Shafts=2','Shafts=33'),s.replace('Rising Shed=true','Rising Shed=false'),s.replace('Treadles=0','Treadles=1'),s.replace('[THREADING]\r\n1=1','[THREADING]\r\n1=0'),s.replace('[THREADING]\r\n1=1','[THREADING]\r\n1=2'),s.replace('[LIFTPLAN]\r\n1=1','[LIFTPLAN]\r\n1=1,1'),s+'[WIF]\r\nVersion=1.1',s.replace('Entries=2','Entries=3'),s.replace('Range=0,255','Range=0,0'),s.replace('1=31,71,73','1=300,71,73')])assert.throws(()=>verifyWifBytes(bad,input.motif));
});
test('all exports are deterministic and cap failure blocks draft artifacts',()=>{
 const input=makeExample();assert.deepEqual(exportBundle(input),exportBundle(input));input.shaftCap=1;
 for(const f of [exportBundle,exportWif,exportSvg,exportThreading])assert.throws(()=>f(input),{code:'SHAFT_CAP'});
});
test('SVG is escaped valid XML; Unicode project titles are never executable',()=>{
 const input=p([[true,false],[false,true]],'<script>alert("x")</script> & 試作');const svg=exportSvg(input);
 assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(svg.includes('&amp;'));
 const parsed=spawnSync('python',['-c','import sys,xml.etree.ElementTree as ET; r=ET.fromstring(sys.stdin.read()); assert r.tag.endswith("svg"); assert not any(e.tag.endswith("script") for e in r.iter()); print("valid")'],{input:svg,encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);
 const wif=exportWif(input);assert.ok(!/[^\x00-\x7f]/.test(wif));assert.ok(wif.includes('??'));assert.equal(verifyWifBytes(wif,input.motif).checkedCells,4);
});
test('numbered print SVG and text include orientation and every end and pick',()=>{
 const input=makeExample(),text=exportThreading(input),svg=exportSvg(input);
 assert.ok(text.includes('WARP END -> SHAFT'));assert.ok(text.includes('8 -> 4'));assert.ok(text.includes('PICK -> RAISED SHAFTS'));assert.ok(svg.includes('THREADING'));assert.ok(svg.includes('LIFTPLAN'));assert.ok(svg.includes('3 × 3 REPEAT'));assert.ok(svg.includes('Warp 1 = left; pick 1 = top'));
});
