import { randomBytes } from 'node:crypto';

const capacity = 50;
const initialVisitMs = 15 * 60_000;
const sampleLimit = 40;
const validKey = value => typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value);
const fail = (status, message) => Object.assign(new Error(message), {status});
const expired = () => fail(410, '候位已结束，请重新入馆。');

// All decisions are synchronous and use the live map size. With k vacancies the
// first k people in line each have a place, even if their polls arrive out of order.
export function createAdmission({occupancy, admit, remove, now, queueTtlMs, queueLimit=500, requestLimit=8192}) {
  const byKey = new Map(), byTicket = new Map(), waiting = new Set();
  const retired = new Map(), visits = [];
  let lastReleasedAt = null;

  const busy = () => fail(503, '候位登记已满，请稍后再试。已有排位继续有效。');
  // An accepted request occupies one slot either as a live registration or as
  // its short-lived cancellation marker. Retiring it never needs another slot.
  const hasRecordSlot = () => byKey.size + retired.size < requestLimit;

  function retire(record) {
    waiting.delete(record);
    byKey.delete(record.key);
    byTicket.delete(record.ticket);
    retired.set(record.key, now() + queueTtlMs);
  }

  function expire() {
    const time = now();
    for (const record of waiting) {
      if (time - record.seenAt >= queueTtlMs) retire(record);
    }
    // Every marker has the same TTL and is inserted only once, in expiry order.
    for (const [key, until] of retired) {
      if (until > time) break;
      retired.delete(key);
    }
  }

  function room() {
    expire();
    return {occupancy: occupancy(), capacity, waiting: waiting.size};
  }

  function resolve(record) {
    if (record.person) return {person: record.person};
    record.seenAt = now();
    let ahead = 0;
    for (const other of waiting) {
      if (other === record) break;
      ahead++;
    }
    const occupied = occupancy();
    const departuresNeeded = ahead + 1 - (capacity - occupied);
    if (departuresNeeded <= 0) {
      waiting.delete(record);
      record.person = admit(record.profile, record.pose, record.legacy);
      record.person.admission = record;
      return {person: record.person};
    }
    const estimatingFromHistory = visits.length >= 3;
    const expectedVisit = estimatingFromHistory
      ? visits.reduce((total, duration) => total + duration, 0) / visits.length
      : initialVisitMs;
    const lastChange = Math.max(record.enqueuedAt, lastReleasedAt ?? record.enqueuedAt);
    // Wait through this many departures at the estimated rate. When an
    // estimate expires, only the oldest expected departure is overdue.
    const interval = expectedVisit / capacity;
    const elapsed = Math.min(interval, Math.max(0, now() - lastChange));
    const etaSeconds = Math.max(0, Math.ceil((interval * departuresNeeded - elapsed) / 1000));
    return {queued: true, ticket: record.ticket, ahead, etaSeconds, estimatingFromHistory, occupancy: occupied, capacity};
  }

  function join(key, profile, pose, legacy) {
    expire();
    if (key === undefined) {
      // Older entry pages cannot keep a queue ticket alive.
      if (occupancy() + waiting.size >= capacity) throw fail(503, '当前名额已满，请刷新入馆页后排队。');
      return {person: admit(profile, pose, legacy)};
    }
    if (!validKey(key)) throw fail(400, '入馆请求编号无效。');
    if (retired.has(key)) throw expired();
    const existing = byKey.get(key);
    if (existing) {
      if (existing.profile.name !== profile.name || existing.profile.avatarId !== profile.avatarId)
        throw fail(409, '此入馆请求的名字或形象已改变。');
      return resolve(existing);
    }
    // Existing tickets above continue to resolve even when new arrivals must wait.
    if (!hasRecordSlot() || waiting.size >= queueLimit) throw busy();
    const record = {key, ticket: randomBytes(24).toString('base64url'), profile, pose, legacy,
      enqueuedAt: now(), seenAt: now(), person: null};
    byKey.set(key, record);
    byTicket.set(record.ticket, record);
    waiting.add(record);
    return resolve(record);
  }

  function status(ticket) {
    expire();
    const record = byTicket.get(ticket);
    if (!record) throw expired();
    return resolve(record);
  }

  function cancel(ticket, key) {
    expire();
    if (!ticket && !validKey(key)) throw fail(400, '缺少有效的候位编号。');
    const record = ticket ? byTicket.get(ticket) : byKey.get(key);
    if (!record) {
      // A cancel can beat the initial join request.
      if (!ticket && !retired.has(key)) {
        if (!hasRecordSlot()) throw busy();
        retired.set(key, now() + queueTtlMs);
      }
      return;
    }
    if (record.person) {
      if (!record.person.acknowledged) remove(record.person);
    } else retire(record);
  }

  function departed(person, endTime) {
    if (person.admission) retire(person.admission);
    const duration = endTime - person.admittedAt;
    if (person.acknowledged && duration > 0) {
      if (visits.length === sampleLimit) visits.shift();
      visits.push(duration);
    }
    lastReleasedAt = now();
  }

  return {join, status, cancel, departed, room, expire};
}
