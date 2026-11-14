import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReport} from './check-visit-metrics.mjs';

const record=(event,extra={})=>({kind:'visit_metric',schema:2,version:'local',entry:'hall',device:'touch',event,elapsedBucket:1000,...extra});
function events(count,event,extra){return Array.from({length:count},()=>record(event,extra));}
const normal=(count,extra)=>[...events(count,'submitted',extra),...events(count,'admitted',extra),...events(count,'ready',extra)];

test('separate complete windows yield an alert and a recovery for the same release and entrance',()=>{
  const failures=[...events(30,'submitted'),...events(30,'admitted'),...events(26,'ready'),...events(4,'timeout')];
  const alert=buildReport(failures.map(x=>JSON.stringify({source:x})).join('\n'));
  assert.equal(alert.status,'ALERT');
  assert.equal(alert.groups[0].readyRate,26/30);
  assert.equal(alert.groups[0].timeoutRate,4/30);
  const messages=normal(40).map(event=>JSON.stringify(event));
  const recovered=buildReport(JSON.stringify({result:{events:[{Logs:[{Message:messages}]}]}}));
  assert.equal(recovered.status,'OK');
  assert.equal(recovered.groups[0].readyRate,1);
});
test('no returned outcomes and a timeout-only threshold breach are both visible',()=>{
  const silent=buildReport(JSON.stringify(events(30,'submitted')));
  assert.equal(silent.status,'ALERT');assert.equal(silent.groups[0].unresolvedBalance,30);
  const slow=[...normal(94),...events(6,'submitted'),...events(6,'timeout')];
  assert.equal(buildReport(JSON.stringify(slow)).status,'ALERT');
});
test('small groups, old schemas and windows crossing boundaries cannot produce a green result',()=>{
  const v='1822d304-75fe-4334-afc8-d37ec65cf5ef';
  const rows=[...normal(20),...normal(20,{entry:'work'}),...normal(20,{device:'desktop'}),...normal(20,{version:v})];
  assert.equal(buildReport(JSON.stringify(rows)).status,'INSUFFICIENT');
  assert.equal(buildReport('[]').status,'INSUFFICIENT');
  assert.equal(buildReport(JSON.stringify([...normal(30),...normal(2,{entry:'cave'})])).status,'PARTIAL');
  const legacy=buildReport(JSON.stringify(normal(40,{schema:undefined})));
  assert.equal(legacy.groups[0].timeoutRate,null);assert.equal(legacy.status,'PARTIAL');
  const skewed=buildReport(JSON.stringify([...normal(40),record('ready')]));
  assert.equal(skewed.groups[0].status,'INCONCLUSIVE');assert.equal(skewed.groups[0].readyRate,null);
});
test('invalid input fails without exposing the source record; unrelated envelope fields are omitted',()=>{
  assert.throws(()=>buildReport('{"test-field":"private"}\nmalformed'),/line 2/);
  assert.throws(()=>buildReport(JSON.stringify([record('submitted',{version:'not-a-version'})])),/Malformed/);
  assert.throws(()=>buildReport('[]',{minimum:0}),/minimum sample/);
  assert(!JSON.stringify(buildReport(JSON.stringify([{source:record('ready'),testField:'example-private'}]))).includes('example-private'));
});
