// Isolated Node room only. The optional duration is in seconds; default is ten minutes.
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {performance} from 'node:perf_hooks';
import {createMuseumServer} from '../server/museum.mjs';

const seconds = Number(process.argv[2] ?? 600);
assert(Number.isInteger(seconds) && seconds >= 10 && seconds <= 600, '测试时长为 10–600 秒');
const room = createMuseumServer();
room.listen(0, '127.0.0.1');
await once(room, 'listening');
const base = 'http://127.0.0.1:' + room.address().port;
const controller = new AbortController();
const visitors = [], readers = [], queued = [], errors = [];
const sent = new Map(), latency = [];
let events = 0, updates = 0, polls = 0, highWater = 0;
async function post(endpoint, body, token, status = 200) {
  const headers = {'Content-Type':'application/json', Origin:base};
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + '/api/' + endpoint, {
    method:'POST', headers, body:JSON.stringify(body), signal:controller.signal
  });
  assert.equal(res.status, status, endpoint);
  return res;
}
async function join(i, status) {
  return (await post('join', {name:'展馆负载' + i, avatarId:i%2?'heng':'qing',
    admissionKey:crypto.randomUUID(), rosterVersion:2}, null, status)).json();
}
async function subscribe(session, witness) {
  const response = await post('stream', {}, session.token);
  const stream = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let pending = '';
  const drain = async () => {
    for (;;) {
      const part = await stream.read();
      if (part.done) break;
      pending += part.value;
      let end;
      while ((end = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0,end);
        pending = pending.slice(end+1);
        if (!line) continue;
        events++;
        if (!witness) continue;
        const event = JSON.parse(line);
        if (event.type === 'update' && event.id === visitors[0].selfId && sent.has(event.x)) {
          latency.push(performance.now()-sent.get(event.x));
          sent.delete(event.x);
        }
      }
    }
  };
  readers.push(drain().catch(err => {if (!controller.signal.aborted) errors.push(err.message);}));
}
try {
  visitors.push(...await Promise.all(Array.from({length:50}, (_,i)=>join(i,201))));
  await Promise.all(visitors.map((v,i)=>subscribe(v,i===1)));
  queued.push(await join(50,202),await join(51,202));
  assert.deepEqual(queued.map(q=>q.ahead),[0,1]);
  const start = performance.now();
  let round = 0, replaced = false;
  while (performance.now()-start < seconds*1000) {
    const tick = performance.now();
    const x = Number((6+round*.001).toFixed(3));
    sent.set(x,tick);
    await Promise.all(visitors.map((v,i)=>post('update', {
      pose:{x:i===0?x:6+Math.sin(round*.1+i),z:-i+.5*Math.cos(round*.2),heading:round*.03}
    },v.token).then(r=>r.arrayBuffer())));
    updates += visitors.length;
    if (round % 20 === 0) {
      const info = await (await fetch(base+'/api/room')).json();
      highWater = Math.max(highWater,info.occupancy);
      assert.equal(info.occupancy,50);
      if (!replaced && tick-start>=seconds*500) {
        await post('leave',{},visitors[49].token);
        assert.equal((await (await post('queue/status',{},queued[1].ticket,202)).json()).ahead,1);
        visitors[49] = await (await post('queue/status',{},queued[0].ticket,201)).json();
        await subscribe(visitors[49],false);
        await post('queue/cancel',{},queued[1].ticket);
        replaced=true;
      } else if (!replaced) {
        for (const q of queued) await post('queue/status',{},q.ticket,202);
      }
      polls++;
    }
    round++;
    await delay(Math.max(0,250-(performance.now()-tick)));
  }
  assert(replaced);assert.deepEqual(errors,[]);assert(latency.length>=round*.95);
  await Promise.all(visitors.map(v=>post('leave',{},v.token)));
  const end = await (await fetch(base+'/api/room')).json();
  assert.deepEqual([end.occupancy,end.waiting],[0,0]);
  latency.sort((a,b)=>a-b);
  console.log(JSON.stringify({runtime:'local Node',seconds,visitors:50,updates,events,occupancyChecks:polls,
    maximumObserved:highWater,queued:2,fifoReplacement:true,finalOccupancy:end.occupancy,
    witnessSamples:latency.length,witnessP95Ms:+latency[Math.ceil(latency.length*.95)-1].toFixed(1)}));
} finally {
  controller.abort();
  room.closeAllConnections();
  await new Promise(resolve=>room.close(resolve));
  await Promise.allSettled(readers);
}
