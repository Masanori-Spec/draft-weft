import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkSession } from '../src/work-session.mjs';
function rig(){const workers=[],timers=new Map(),results=[],errors=[];let next=0;const session=new WorkSession({createWorker:()=>{const w={terminated:false,terminate(){this.terminated=true;},postMessage(msg){this.msg=msg;}};workers.push(w);return w;},onResult:r=>results.push(r),onError:e=>errors.push(e),timer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id)});return{workers,timers,results,errors,session};}
test('cancel terminates worker and ignores late result',()=>{const r=rig();r.session.start({a:1});const w=r.workers[0];r.session.cancel();w.onmessage({data:{id:w.msg.id,result:'old'}});assert.equal(w.terminated,true);assert.equal(r.results.length,0);assert.equal(r.timers.size,0);});
test('newer compile replaces prior worker, stale messages cannot replace results',()=>{const r=rig();r.session.start({a:1});const first=r.workers[0];r.session.start({a:2});const second=r.workers[1];first.onmessage({data:{id:first.msg.id,result:'old'}});second.onmessage({data:{id:second.msg.id,result:'new'}});first.onerror();assert.equal(first.terminated,true);assert.equal(second.terminated,true);assert.deepEqual(r.results.map(x=>x.result),['new']);assert.equal(r.errors.length,0);assert.equal(r.timers.size,0);});
test('budget cancellation emits one error, ignores worker afterwards',()=>{const r=rig();r.session.start({});const w=r.workers[0];[...r.timers.values()][0]();w.onmessage({data:{id:w.msg.id,result:'late'}});assert.equal(w.terminated,true);assert.equal(r.errors[0].code,'BUDGET');assert.equal(r.results.length,0);});
test('worker startup, postMessage and processing errors stop work',()=>{
 const errors=[];const s=new WorkSession({createWorker:()=>{throw Error('denied')},onResult:()=>assert.fail(),onError:e=>errors.push(e)});s.start({});assert.equal(errors[0].code,'WORKER');
 const r=rig();r.session.start({});r.workers[0].onerror();assert.equal(r.errors[0].code,'WORKER');assert.equal(r.timers.size,0);
 const x=rig();x.session.start({});const w=x.workers[0];w.onmessage({data:{id:w.msg.id,error:{code:'CAP'}}});assert.equal(x.errors[0].code,'CAP');
});
