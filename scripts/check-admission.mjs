// Run against disposable museum instances on loopback. Exercise the same HTTP
// endpoints as the registration dialog and the same snapshot as the visitors map.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createMuseumServer } from '../server/museum.mjs';
import { createAdmission } from '../server/admission.mjs';
import { roomAt } from '../building-plan.js';

const profile = name => ({ name, avatarId: 'qing', rosterVersion: 2, admissionKey: randomUUID() });

async function withMuseum(options, run) {
  const server = createMuseumServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const api = 'http://127.0.0.1:' + server.address().port + '/api/';
  async function post(endpoint, { body = {}, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch(api + endpoint, {
      method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(5000)
    });
    return { status: response.status, data: await response.json() };
  }
  async function room() {
    const response = await fetch(api + 'room', { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    return response.json();
  }
  async function mapSnapshot(token) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(api + 'stream', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: '{}', signal: controller.signal
      });
      assert.equal(response.status, 200);
      const decoder = new TextDecoder();
      let pending = '';
      for await (const chunk of response.body) {
        pending += decoder.decode(chunk, { stream: true });
        if (!pending.includes('\n')) continue;
        const first = JSON.parse(pending.slice(0, pending.indexOf('\n')));
        assert.equal(first.type, 'snapshot');
        return first.visitors;
      }
      assert.fail('stream closed without a map snapshot');
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  }
  try {
    await run({ room, mapSnapshot, post,
      join: body => post('join', { body }),
      status: token => post('queue/status', { token }),
      cancel: token => post('queue/cancel', { token }),
      leave: token => post('leave', { token })
    });
  } finally {
    const closed = once(server, 'close');
    server.close();
    server.closeAllConnections();
    await closed;
  }
}

function queued(result) {
  assert.equal(result.status, 202, JSON.stringify(result.data));
  const state = result.data;
  assert.equal(state.queued, true);
  assert.equal(typeof state.ticket, 'string');
  assert(Number.isSafeInteger(state.ahead) && state.ahead >= 0);
  assert(Number.isFinite(state.etaSeconds) && state.etaSeconds >= 0);
  assert.equal(typeof state.estimatingFromHistory, 'boolean');
  assert(!('visitors' in state) && !('token' in state) && !('selfId' in state));
  return state;
}
function admitted(result) {
  assert.equal(result.status, 201, JSON.stringify(result.data));
  const session = result.data;
  assert.equal(typeof session.token, 'string');
  assert(session.visitors.some(visitor => visitor.id === session.selfId));
  return session;
}

await withMuseum({}, async ({ room, mapSnapshot, join, status, cancel, leave, post }) => {
  const entrants = Array.from({ length: 58 }, (_, i) => profile('访客' + i));
  const arrivals = await Promise.all(entrants.map(async guest => ({ guest, result: await join(guest) })));
  const inside = arrivals.filter(x => x.result.status === 201).map(x => ({ ...x, session: admitted(x.result) }));
  const line = arrivals.filter(x => x.result.status === 202)
    .map(x => ({ ...x, position: queued(x.result) })).sort((a, b) => a.position.ahead - b.position.ahead);
  assert.equal(inside.length, 50);
  assert.equal(line.length, 8);
  const arrivalsById=inside.map(({session})=>session.visitors.find(person=>person.id===session.selfId));
  assert.equal(new Set(arrivalsById.map(roomAt)).size,9);
  for(const [i,a] of arrivalsById.entries()){
    assert(roomAt(a)>=0);
    for(const b of arrivalsById.slice(0,i))assert(Math.hypot(a.x-b.x,a.z-b.z)>=1.25);
  }
  assert.equal(new Set(inside.map(x => x.session.selfId)).size, 50);
  assert.equal(new Set(line.map(x => x.position.ticket)).size, 8);
  assert.deepEqual(line.map(x => x.position.ahead), [0,1,2,3,4,5,6,7]);
  for (const { position } of line) {
    assert.equal(position.capacity, 50);
    assert.equal(position.occupancy, 50);
    assert.equal(position.estimatingFromHistory, false);
  }
  assert(line[0].position.etaSeconds >= 17 && line[0].position.etaSeconds <= 18);
  assert(line[7].position.etaSeconds > line[0].position.etaSeconds);
  const full = await room();
  assert.equal(full.capacity, 50);
  assert.equal(full.occupancy, 50);
  assert.equal(full.waiting, 8);
  assert.deepEqual((await mapSnapshot(inside[0].session.token)).map(v => v.name).sort(),
    inside.map(x => x.guest.name).sort(), 'only admitted visitors appear on the map');

  const duplicate = admitted(await join(inside[0].guest));
  assert.equal(duplicate.selfId, inside[0].session.selfId);
  const head = line[0], second = line[1], third = line[2];
  for (const retry of await Promise.all([join(head.guest), join(head.guest), status(head.position.ticket)])) {
    const current = queued(retry);
    assert.equal(current.ticket, head.position.ticket);
    assert.equal(current.ahead, 0);
  }
  assert.equal((await room()).waiting, 8);
  const legacy = { name: '旧版访客', avatarId: 'maya' };
  assert.equal((await join(legacy)).status, 503);
  assert.equal((await room()).waiting, 8);

  assert.equal((await cancel(second.position.ticket)).status, 200);
  assert.equal(queued(await status(third.position.ticket)).ahead, 1);
  assert((await status(second.position.ticket)).status >= 400);
  assert.equal((await leave(inside[1].session.token)).status, 200);

  // An arrival and a later waiter both act before the head's next poll.
  const [late, impatient] = await Promise.all([join(profile('后到者')), status(third.position.ticket)]);
  queued(late);
  queued(impatient);
  const claims = await Promise.all([status(head.position.ticket), status(head.position.ticket), join(head.guest)]);
  const sessions = claims.map(admitted);
  assert.equal(new Set(sessions.map(x => x.selfId)).size, 1);
  assert.equal(new Set(sessions.map(x => x.token)).size, 1);
  assert.equal((await room()).occupancy, 50);

  // A cancelled request may race a successful claim in the browser. Before
  // the first room heartbeat/stream, cancelling that claim must free its seat.
  assert.equal((await cancel(head.position.ticket)).status, 200);
  const next = admitted(await status(third.position.ticket));
  assert.equal(next.visitors.find(v => v.id === next.selfId).name, third.guest.name);
  assert.equal((await post('pulse', { token: next.token })).status, 200);
  await cancel(third.position.ticket);
  assert.equal((await post('pulse', { token: next.token })).status, 200,
    'a delayed queue cancellation removed an already connected visitor');
  assert.equal((await room()).occupancy, 50);

  const [nextHead, nextSecond, nextThird] = line.slice(3, 6);
  await Promise.all(inside.slice(2, 4).map(x => leave(x.session.token)));
  queued(await status(nextThird.position.ticket));
  admitted(await status(nextSecond.position.ticket));
  queued(await status(nextThird.position.ticket));
  admitted(await status(nextHead.position.ticket));
  assert.equal((await room()).occupancy, 50);
  console.log('58 人并发到达时只接待 50 人。排队访客不上图，后来者无法抢占空位，重复领取与取消竞态均通过。');
});

const minute = 60_000;
const startTime = Date.UTC(2030, 0, 1);
let clock = startTime;
await withMuseum({
  now: () => clock, queueTtlMs: 2 * minute,
  disconnectMs: 60 * minute, staleMs: 60 * minute, heartbeatMs: 1000
}, async ({ room, join, status, leave, post }) => {
  const guests = await Promise.all(Array.from({ length: 50 }, (_, i) => join(profile('周转' + i))));
  const sessions = guests.map(admitted);
  for (const s of sessions.slice(0, 3)) assert.equal((await post('pulse', { token: s.token })).status, 200);
  const departedAfter = 10 * minute;
  clock += departedAfter;
  for (const [i, guest] of sessions.slice(0, 3).entries()) {
    assert.equal((await leave(guest.token)).status, 200);
    admitted(await join(profile('替补' + i)));
  }
  const idle = queued(await join(profile('离开队列的浏览器')));
  const waiting = queued(await join(profile('持续等候的浏览器')));
  assert.equal(idle.estimatingFromHistory, true);
  assert.equal(waiting.estimatingFromHistory, true);
  assert(idle.etaSeconds > 0 && idle.etaSeconds < 18,
    'ten-minute completed visits should shorten the initial fifteen-minute fallback');
  assert(waiting.etaSeconds > idle.etaSeconds);
  clock += 80_000;
  assert.equal(queued(await status(waiting.ticket)).ahead, 1);
  clock += 70_000;
  assert.equal((await status(idle.ticket)).status, 410);
  assert.equal(queued(await status(waiting.ticket)).ahead, 0);
  assert.equal((await room()).waiting, 1);
  await leave(sessions[3].token);
  const admittedVisitor = admitted(await status(waiting.ticket));
  assert.equal(admittedVisitor.visitors.find(v => v.id === admittedVisitor.selfId).name, '持续等候的浏览器');
  console.log('已完成的访问更新等待估算，持续轮询的访客保留排位，过期候场者自动让位。');
});

clock = startTime;
await withMuseum({
  now: () => clock, disconnectMs: 10_000, staleMs: 120_000, heartbeatMs: 30
}, async ({ join, status, room }) => {
  admitted(await join(profile('意外离馆')));
  clock += 6000;
  await Promise.all(Array.from({ length: 49 }, (_, i) => join(profile('稍后入馆' + i)).then(admitted)));
  const witness = queued(await join(profile('候补入馆')));
  clock += 5000;
  let result = await status(witness.ticket);
  const deadline = Date.now() + 2000;
  while (result.status === 202 && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 20));
    result = await status(witness.ticket);
  }
  const session = admitted(result);
  assert(!session.visitors.some(v => v.name === '意外离馆'));
  assert.equal(session.visitors.length, 50);
  assert.equal((await room()).waiting, 0);
  console.log('馆内访客断线超时后，空位交给队首，地图仍为 50 人。');
});

// Exercise the allocation boundary with small fixture budgets. A queue can still
// be claimed at capacity and cancellation markers must survive delayed retries.
let occupied = 50, fixtureTime = 1000;
const bounded = createAdmission({
  occupancy: () => occupied,
  admit: guest => { occupied++; return {name:guest.name,acknowledged:false}; },
  remove: person => { occupied--; bounded.departed(person, fixtureTime); },
  now: () => fixtureTime, queueTtlMs:100, queueLimit:2, requestLimit:3
});
const firstGuest = profile('候位一'), secondGuest = profile('候位二'), lateGuest = profile('后来者');
const firstTicket = bounded.join(firstGuest.admissionKey, firstGuest).ticket;
const secondTicket = bounded.join(secondGuest.admissionKey, secondGuest).ticket;
assert.throws(() => bounded.join(lateGuest.admissionKey, lateGuest), {status:503});
const cancelKey = randomUUID();
bounded.cancel(null, cancelKey);
assert.throws(() => bounded.cancel(null, randomUUID()), {status:503});
assert.throws(() => bounded.join(cancelKey, lateGuest), {status:410});
assert.equal(bounded.status(secondTicket).ahead,1);
occupied--;
assert.equal(bounded.status(firstTicket).person.name,firstGuest.name);
bounded.cancel(firstTicket);
assert.throws(() => bounded.join(firstGuest.admissionKey, firstGuest), {status:410});
assert.equal(bounded.status(secondTicket).person.name,secondGuest.name);
fixtureTime += 101;
occupied--;
assert.equal(bounded.join(lateGuest.admissionKey,lateGuest).person.name,lateGuest.name);

clock = startTime;
await withMuseum({now:() => clock}, async ({join, post, leave}) => {
  const {token} = admitted(await join(profile('正常走动')));
  const walk = () => post('update', {body:{pose:{x:1,z:2,heading:0}}, token});
  for (let n=0; n<4; n++) assert.equal((await walk()).status,200);
  assert.equal((await walk()).status,429);
  for (let n=0; n<8; n++) {
    clock+=120;
    assert.equal((await walk()).status,200);
  }
  assert.equal((await leave(token)).status,200);
});
console.log('候位及短期请求记录达到预算后，已有票仍能补位，过期记录释放；正常步行更新和离馆可用。');
