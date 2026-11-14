import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildingFloor} from '../building-floor.js';
import {caveById, toWorld} from '../cave-plan.js';
import {makeWalker} from '../walking.js';
import {groundHeightAtDepth, makeStrollController, proximityGate, readingSeconds, strollWaypoints} from '../stroll-controller.js';

function checkControls() {
  const grade = [[0, 0], [3, 0], [7.8, 1.44], [10.3, 1.44]];
  assert.equal(groundHeightAtDepth(grade, -2), 0);
  assert.ok(Math.abs(groundHeightAtDepth(grade, 5.4) - .72) < 1e-9);
  assert.equal(groundHeightAtDepth(grade, 14), 1.44);
  assert.equal(groundHeightAtDepth(null, 14), 0);

  const gate = proximityGate();
  assert.equal(gate.select(0, 1, 50), 0);
  assert.equal(gate.select(0, 0, 170), 0);
  assert.equal(gate.select(0, 1, 220), 0);
  assert.equal(gate.select(0, 1, 415), 1);
  assert.equal(gate.select(1, -1, 500), 1);
  assert.equal(gate.select(1, -1, 1061), -1);

  const cave = {id:'wall',details:[{id:'entry',stand:[0,0],text:'入口'},{id:'mural',stand:[4,2],text:'壁画'}],
    stroll:{path:[[0,0],[1,1],[4,2],[0,0]]},experience:{stages:[{detail:'entry'},{detail:'mural'}]}};
  let here=[0,0],goal=null,speaking=true;
  const read=[];
  const engine=makeStrollController({
    move:(_,p)=>{goal=p;return true;},halt:()=>{goal=null;},
    distance:(_,p)=>Math.hypot(here[0]-p[0],here[1]-p[1]),
    focus:(_,i)=>read.push(i),narrating:()=>speaking
  });
  assert(engine.start(cave));
  assert.equal(engine.state.status,'reading');
  engine.tick(readingSeconds(cave.details[0])+1,false);
  assert.equal(engine.state.status,'reading','narration is still playing');
  assert(engine.pause());
  speaking=false;
  engine.tick(100,false);
  assert.equal(engine.state.status,'paused','no offscreen time advances a paused visit');
  assert(engine.resume());
  engine.tick(.1,false);
  assert.deepEqual(goal,[1,1]);
  assert(engine.pause());
  here=[0,1.9]; // walked away from the route by hand
  assert(engine.resume());
  assert.deepEqual(here,[0,1.9],'resume must start walking from the current position');
  here=goal;engine.tick(.01,true);
  assert.deepEqual(goal,[4,2]);
  here=goal;engine.tick(.01,true);
  assert.equal(engine.state.index,1);
  engine.tick(50,false);
  assert(engine.state.returning);
  here=goal;engine.tick(.01,true);
  assert.equal(engine.state.status,'complete');
  assert.deepEqual(read,[0,0,1],'the return to the threshold must not repeat its story');
  assert(engine.stop());
  assert.equal(engine.state.status,'idle');
  assert(engine.start(cave,1));
  assert.deepEqual(goal,[4,2]);
  assert(engine.stop());
  engine.tick(60,false);
  assert.equal(engine.state.id,null);
  const blocked=makeStrollController({move:()=>false,halt:()=>{},distance:()=>10,focus:()=>{}});
  assert.equal(blocked.start(cave),false);
  assert.equal(blocked.state.status,'paused','a blocked route cannot advance its stories');
}

export function checkStrolls(floor=buildingFloor()) {
  const result=[];
  for(const id of ['mogao-158','longmen-1280']) {
    const cave=caveById.get(id);
    assert(cave?.stroll,id+' is missing its walk');
    const expected=id==='mogao-158'
      ? ['threshold','cheek','kasyapa','assembly','guardians','royals','folds','east']
      : ['approach','cornice','assembly','vairocana','pedestal','attendants','guardians'];
    const stageDetails=cave.experience.stages.map(s=>s.detail);
    assert.deepEqual(stageDetails.filter(id=>expected.includes(id)),expected,'missing or reordered observation');

    const points=strollWaypoints(cave);
    assert(points.length>=cave.experience.stages.length,id+' has an unmapped story');
    const walker=makeWalker(floor), readings=[], elev=[];
    const absolute=p=>toWorld(cave,p[0],0,p[1]);
    const first=absolute(points[0].position);
    walker.reset(first.x,first.z,0);
    let elapsed=0, distanceTravelled=0;
    const engine=makeStrollController({
      move(_, p) {
        const to=absolute(p);assert(floor.free(to),'blocked route '+id+' '+p);
        return !!walker.go(to);
      },
      halt:()=>walker.stop(),
      distance(_, p) {const to=absolute(p);return Math.hypot(to.x-walker.state.x,to.z-walker.state.z);},
      focus(_, i) {
        const stand=absolute(cave.details[i].stand);
        assert(Math.hypot(walker.state.x-stand.x,walker.state.z-stand.z)<.18,'story started too far from its artwork');
        readings.push(cave.details[i].id);
        elev.push(groundHeightAtDepth(cave.ground,-cave.details[i].stand[1]));
      }
    });
    assert(engine.start(cave));
    while(engine.state.status!=='complete' && elapsed<720) {
      const step=.05;
      engine.tick(step,walker.moving());const motion=walker.step(step);
      assert(motion.distance<=1.28*step+.001 && floor.free(walker.state),'crossed the walkable surface');
      distanceTravelled+=motion.distance;elapsed+=step;
      assert.notEqual(engine.state.status,'paused',id+' route stalled');
    }
    assert.equal(engine.state.status,'complete',id+' never finished');
    assert.deepEqual(readings,cave.experience.stages.map(s=>s.detail),id+' chapters out of order');
    const end=absolute(points.at(-1).position);
    assert(Math.hypot(walker.state.x-end.x,walker.state.z-end.z)<.19);
    result.push({id,readings,distanceMetres:+distanceTravelled.toFixed(1),durationSeconds:+elapsed.toFixed(1),riseMetres:Math.max(...elev)-Math.min(...elev)});
  }
  return result;
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  checkControls();
  if (!process.argv.includes('--controls-only')) console.log(JSON.stringify(checkStrolls()));
}
