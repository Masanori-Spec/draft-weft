import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const run=(...args)=>spawnSync(process.execPath,['src/cli.mjs',...args],{encoding:'utf8'});
test('CLI examples, check, export, overwrite refusal, cap failure and bad input',async()=>{
 const root=await mkdtemp(join(tmpdir(),'draft-weft-'));
 try{const fixture=join(root,'project.json'),out=join(root,'output');const example=run('example','plain');assert.equal(example.status,0);await writeFile(fixture,example.stdout);const checked=run('check',fixture);assert.equal(checked.status,0);assert.equal(JSON.parse(checked.stdout).requiredShafts,2);const exp=run('export',fixture,out);assert.equal(exp.status,0,exp.stderr);assert.equal((await readdir(out)).length,5);assert.equal(run('export',fixture,out).status,1);assert.ok((await readFile(join(out,'draft-weft.wif'),'utf8')).includes('[WIF]'));const bad=JSON.parse(example.stdout);bad.shaftCap=1;await writeFile(fixture,JSON.stringify(bad));assert.equal(run('export',fixture,join(root,'capfail')).status,2);await writeFile(fixture,'{');assert.equal(run('check',fixture).status,1);assert.equal(run('unknown').status,1);assert.equal(run('check',fixture,'extra').status,1);assert.equal(run('--help').status,0);}finally{await rm(root,{recursive:true,force:true});}
});
