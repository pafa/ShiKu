// Paths and elevations use metres in the chamber's own coordinate system.
export function groundHeightAtDepth(profile, depth) {
  if (!profile?.length) return 0;
  let [previousDepth, previousHeight] = profile[0];
  if (depth <= previousDepth) return previousHeight;
  for (let i = 1; i < profile.length; i++) {
    const [nextDepth, nextHeight] = profile[i];
    if (depth <= nextDepth) {
      const fraction = (depth - previousDepth) / (nextDepth - previousDepth);
      return previousHeight + fraction * (nextHeight - previousHeight);
    }
    previousDepth = nextDepth;
    previousHeight = nextHeight;
  }
  return previousHeight;
}

// A bend can be visited twice on a loop. Match stops in walking order so that
// a returning visitor doesn't hear the entry story again at the final bend.
export function strollWaypoints(cave) {
  const path = cave.stroll?.path;
  const stages = cave.experience?.stages;
  if (!Array.isArray(path) || !Array.isArray(stages) || !stages.length) return [];
  if (!path.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) return [];
  const points = path.map(p => ({position:p, stage:-1, detail:-1}));
  let previous = -1;
  for (const [stage, reference] of stages.entries()) {
    const detail = cave.details.findIndex(d => d.id === reference.detail);
    if (detail < 0) return [];
    const [x, z] = cave.details[detail].stand;
    const index = points.findIndex((p, i) => i > previous && Math.hypot(p.position[0] - x, p.position[1] - z) < .025);
    if (index < 0) return [];
    Object.assign(points[index], {stage, detail});
    previous = index;
  }
  return points;
}

export function readingSeconds(detail) {
  // Allow time to turn from the direction of travel to the object, then read.
  const length = Array.from(detail.text || '').length;
  return Math.min(34, Math.max(8, 2.4 + length / 6));
}

// Require a stable candidate when walking freely past two neighbouring stops.
// Manual detail selection and guided stops arrive explicitly and bypass this delay.
export function proximityGate() {
  let pending, since = 0;
  return {
    reset() { pending = undefined; },
    select(current, next, now) {
      if (next === current) { pending = undefined; return current; }
      if (pending !== next) { pending = next; since = now; }
      if (now - since < (next < 0 ? 560 : 190)) return current;
      pending = undefined;
      return next;
    }
  };
}

const idle = () => ({id:null, status:'idle', index:-1, total:0, detailIndex:-1, returning:false});
export function makeStrollController({move, halt, distance, focus, notify, narrating}) {
  let cave = null, steps = [], cursor = 0, hold = 0, pausedFrom = null;
  let state = idle();
  const snapshot = () => ({...state});

  function publish(status, point) {
    state = {id:cave.id, status, index:point.stage, total:cave.experience.stages.length,
      detailIndex:point.detail, returning:status === 'walking' && !steps.slice(cursor).some(s => s.stage >= 0)};
    notify?.(snapshot());
  }
  function nextStop() {
    return steps.slice(cursor).find(p => p.stage >= 0) || steps.findLast(p => p.stage >= 0);
  }
  function stop() {
    if (!cave) return false;
    halt();
    cave = null;
    steps = [];
    pausedFrom = null;
    state = idle();
    notify?.(snapshot());
    return true;
  }
  function pause() {
    if (state.status !== 'walking' && state.status !== 'reading') return false;
    pausedFrom = state.status;
    halt();
    publish('paused', nextStop());
    return true;
  }
  function issueWalk() {
    const next = nextStop();
    if (cursor === steps.length) {
      halt();
      publish('complete', next);
      return true;
    }
    if (state.status !== 'walking' || state.index !== next.stage || state.id !== cave.id ||
        state.returning !== !steps.slice(cursor).some(p => p.stage >= 0)) publish('walking', next);
    const point = steps[cursor];
    if (distance(cave, point.position) < .08) {
      arrive();
      return true;
    }
    if (move(cave, point.position)) return true;
    pause();
    return false;
  }
  function arrive() {
    const point = steps[cursor];
    if (point.stage < 0) { cursor++; issueWalk(); return; }
    halt();
    hold = readingSeconds(cave.details[point.detail]);
    // The reading event can begin narration. The actual object must already
    // be the active detail when a listener handles that event.
    focus(cave, point.detail);
    publish('reading', point);
  }
  function start(record, at = 0) {
    const route = strollWaypoints(record);
    if (!route.length) return false;
    if (cave) stop();
    cave = record;
    steps = route;
    const startAt = Number.isInteger(at) && at >= 0 && at < cave.experience.stages.length ? at : 0;
    cursor = startAt ? steps.findIndex(p => p.stage === startAt) : 0;
    return issueWalk();
  }
  function resume() {
    if (state.status !== 'paused') return false;
    const point = steps[cursor];
    if (pausedFrom === 'reading' && distance(cave, point.position) < .5) {
      focus(cave, point.detail);
      publish('reading', point);
      return true;
    }
    return issueWalk();
  }
  function tick(seconds, moving) {
    if (state.status === 'walking') {
      const point = steps[cursor];
      const gap = distance(cave, point.position);
      if (gap < (point.stage < 0 ? .16 : .065)) arrive();
      else if (!moving) {
        if (gap < .18) arrive();
        else pause();
      }
    } else if (state.status === 'reading') {
      hold -= seconds;
      if (hold <= 0 && !narrating?.(state.id, state.detailIndex)) { cursor++; issueWalk(); }
    }
  }
  return {start, pause, resume, stop, tick, snapshot, get state() {return state;}};
}
