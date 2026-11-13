import assert from 'node:assert/strict';
import {makeWalker} from '../walking.js';
import {buildingFloor} from '../building-floor.js';
import {plans,threshold,roomAt,wallStations} from '../building-plan.js';
import {halls} from '../dynasty-exhibition.js';
import {treadHeight} from '../approach-stairs.js';

const furniture=[{x0:-1,x1:1,z0:-14,z1:-13}];
const floor=buildingFloor(furniture),walker=makeWalker(floor);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
for(const fps of [5,8,10,15,30,60,120]){
  walker.reset(0,6,0);
  let run=0,brake=0;
  for(let i=0;i<fps*3;i++)run+=walker.step(1/fps,{x:0,z:-1}).distance;
  for(let i=0;walker.moving()&&i<fps*3;i++)brake+=walker.step(1/fps).distance;
  assert.ok(Math.abs(run-3.372)<.003&&brake>.30&&brake<.315);
}

// A light touch on the stick changes pace while the visitor still turns in
// real time. The first tenth of a reversal is a weight shift in place.
for(const fps of [10,30,60,120]){
  walker.reset(0,6,0);
  const reverse={x:0,z:1};
  for(let i=0;i<fps/10;i++)walker.step(1/fps,reverse,.3);
  assert.ok(Math.abs(walker.state.heading)<.12);
  assert.equal(walker.state.z,6);
  for(let i=0;i<fps*1.5;i++)walker.step(1/fps,reverse,.3);
  assert.ok(Math.abs(Math.abs(walker.state.heading)-Math.PI)<.001);
  assert.ok(Math.abs(walker.state.speed-1.28*.3)<.001);
}
for(const [depth,height] of [[2.99,0],[3.01,.12],[3.39,.12],[3.41,.24],[9,1.44],[11.11,1.8],[16,2.88]]) {
  assert.ok(Math.abs(treadHeight(depth)-height)<1e-6,'shoe support at '+depth);
}

function walk(goal){
  const target=walker.go(goal);assert.ok(target,'unreachable '+JSON.stringify(goal));
  const entered=new Set([roomAt(walker.state)]);
  let ticks=0;
  while(walker.moving()&&ticks++<7500){
    const before={...walker.state};walker.step(1/30);
    assert.ok(distance(walker.state,before)<.044,'nonphysical displacement');
    assert.ok(floor.free(walker.state),'crossed a wall or furniture');
    entered.add(roomAt(walker.state));
  }
  assert.ok(distance(walker.state,target)<.06,'walk did not arrive');
  return entered;
}
let stations=0;
walker.reset(-9.3,2.6,1.36);
for(const [i,p] of plans.entries()){
  const transitions=walk(threshold(p,2.9));
  if(i>0){assert.ok(transitions.has(-1)&&transitions.has(i)&&transitions.has(i-1),'room change bypassed atrium');}
  const door=threshold(p),wall={...door,z:door.z+3.5};
  assert.ok(floor.free(door)&&!floor.free(wall),'door opening and adjacent solid wall');
  for(const s of wallStations(p,halls[i].scenes.length)){
    walk({x:s.x,z:s.z+s.inwardZ*3.05});stations++;
  }
}
walker.reset(0,-11,0);for(let i=0;i<150;i++)walker.step(1/30,{x:0,z:-1});
assert.ok(walker.state.z>-12.77&&walker.state.speed<.001,'obstruction did not stop walker');
for(let i=0;i<6;i++)walker.step(1/30,{x:1,z:0});
walk({x:0,z:-18});
assert.equal(stations,halls.reduce((sum,h)=>sum+h.scenes.length,0));
console.log('5–120 FPS 步速与刹停一致，9 处门槛与邻墙正确，穿中庭连续到达九馆及 '+stations+' 个展位，绕开实体障碍。');
