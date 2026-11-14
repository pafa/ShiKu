// Floor plan and pedestrian controller in metres, seconds and radians.
// A visitor moves along their heading; gait uses the displacement AFTER collision.
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
const hypot = (a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const inside=(p,b)=>p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1;
const principal = a=>Math.atan2(Math.sin(a),Math.cos(a));
const RATE=1.28, ACCEL=1.75, BRAKE=2.65;
// Keep normal elapsed time down to four frames per second. A suspended tab or
// debugger pause must never send the visitor metres across the room on resume.
export const MAX_FRAME_SECONDS = .25;
export function galleryFloor(width,pitch,end,scan,benchBoxes=null){
  const limit={x0:-width+1.33,x1:width-1.33,z0:end+.66,z1:7.9};
  const barriers=benchBoxes?benchBoxes.map(b=>({x0:b.x-b.halfX-.28,x1:b.x+b.halfX+.28,z0:b.z-b.halfZ-.29,z1:b.z+b.halfZ+.29})):Array.from({length:4},(_,i)=>{
    const x=(i%2?-1:1)*(width-1.72),z=-i*pitch-3;
    return {x0:x-.62,x1:x+.62,z0:z-1.18,z1:z+1.18};
  });
  const half=(scan?5.8:3.86)*.5+.53;
  barriers.push({x0:-half,x1:half,z0:end-.5,z1:end+(scan?3.4:1.85)});
  const bound=p=>({x:clamp(p.x,limit.x0,limit.x1),z:clamp(p.z,limit.z0,limit.z1)});
  const free=p=>p.x>=limit.x0&&p.x<=limit.x1&&p.z>=limit.z0&&p.z<=limit.z1&&!barriers.some(b=>inside(p,b));
  function snap(raw){
    let p=bound(raw);
    for(const b of barriers)if(inside(p,b)){
      const candidates=[{x:b.x0-.012,z:p.z},{x:b.x1+.012,z:p.z},{x:p.x,z:b.z0-.012},{x:p.x,z:b.z1+.012}].filter(free);
      if(candidates.length)p=candidates.sort((u,v)=>hypot(u,p)-hypot(v,p))[0];
    }
    return p;
  }
  function blocked(a,b,r){
    let lo=0,hi=1;
    for(const [axis,min,max] of [['x','x0','x1'],['z','z0','z1']]){
      const p=a[axis],d=b[axis]-p;
      if(Math.abs(d)<1e-9){if(p<r[min]||p>r[max])return false;continue}
      let t0=(r[min]-p)/d,t1=(r[max]-p)/d;if(t0>t1)[t0,t1]=[t1,t0];
      lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;
    }
    return true;
  }
  const clear=(a,b)=>!barriers.some(r=>blocked(a,b,r));
  function route(from,raw){
    const goal=snap(raw);if(clear(from,goal))return [goal];
    const pts=[from,goal];for(const b of barriers){for(const x of [b.x0-.065,b.x1+.065])for(const z of [b.z0-.065,b.z1+.065]){const p={x,z};if(free(p))pts.push(p)}}
    const dist=pts.map(()=>Infinity),via=pts.map(()=>-1),used=new Set();dist[0]=0;
    for(;;){let u=-1;for(let i=0;i<pts.length;i++)if(!used.has(i)&&Number.isFinite(dist[i])&&(u<0||dist[i]<dist[u]))u=i;
      if(u<0||u===1)break;used.add(u);
      for(let i=1;i<pts.length;i++){const d=dist[u]+hypot(pts[u],pts[i]);if(!used.has(i)&&d<dist[i]&&clear(pts[u],pts[i])){via[i]=u;dist[i]=d}}
    }
    if(via[1]<0)return [];const path=[];for(let i=1;i>0;i=via[i])path.unshift(pts[i]);return path;
  }
  function slide(p,dx,dz){const q=bound({x:p.x+dx,z:p.z+dz});if(free(q))return q;
    const a={x:q.x,z:p.z},b={x:p.x,z:q.z};return Math.abs(dx)>Math.abs(dz)?(free(a)?a:free(b)?b:p):(free(b)?b:free(a)?a:p);
  }
  return {limit,barriers,free,snap,route,slide};
}
export function makeWalker(floor){
  const state={x:0,z:0,heading:0,speed:0};
  let path=[],blockedTime=0,turnSpeed=0;
  function reset(x,z,heading){Object.assign(state,floor.snap({x,z}),{heading,speed:0});path=[];blockedTime=0;turnSpeed=0}
  function go(p){path=floor.route(state,p);blockedTime=0;return path.at(-1)||null}
  function turnToward(angle,dt){
    // Build angular momentum over the first weight shift, then slow into the
    // new heading. A quick tap in the opposite direction no longer snaps the hips.
    const angularAcceleration=14;
    const desired=Math.sign(angle)*Math.min(3.6,Math.sqrt(2*angularAcceleration*Math.abs(angle)));
    turnSpeed+=clamp(desired-turnSpeed,-angularAcceleration*dt,angularAcceleration*dt);
    const rotation=turnSpeed*dt;
    if(Math.sign(rotation)===Math.sign(angle)&&Math.abs(rotation)>=Math.abs(angle)){
      turnSpeed=0;
      return angle;
    }
    return rotation;
  }
  function step(dt,input=null,pace=1){
    dt=clamp(dt,0,MAX_FRAME_SECONDS);let distance=0,turnDelta=0;
    if(input){path=[];blockedTime=0}
    // Substeps keep stopping distances and corner clearance consistent at low frame rates.
    const count=Math.max(1,Math.ceil(dt/(1/90))),h=dt/count;
    for(let j=0;j<count;j++){
      let dir=input,remaining=Infinity,corner=false;
      while(path.length&&hypot(state,path[0])<(path.length===1?.033:.0002)){path.shift()}
      if(!dir&&path.length){const p=path[0];remaining=hypot(state,p);dir={x:p.x-state.x,z:p.z-state.z};corner=path.length>1}
      const norm=dir?Math.hypot(dir.x,dir.z):0;
      let target=0,alignment=1;
      if(norm>.00001){const goal=Math.atan2(-dir.x,-dir.z),angle=principal(goal-state.heading);
        const rot=turnToward(angle,h);state.heading=principal(state.heading+rot);turnDelta+=rot;
        // Plant and pivot on reversals instead of translating sideways through the turn.
        const facing=Math.cos(angle);alignment=path.length?clamp((facing-.94)/.06,0,1):1;
        const speedLimit=Math.min(RATE,floor.speedLimit?.(state)??RATE);
        target=speedLimit*(path.length?alignment:clamp(pace,0,1)*clamp((facing-.38)/.62,0,1));
        if(path.length)target=Math.min(target,Math.sqrt(2*BRAKE*Math.max(0,remaining-(corner?0:.019))));
      }else turnSpeed=0;
      const s=state.speed;state.speed+=clamp(target-s,-BRAKE*h,ACCEL*h);
      const delta=Math.min((s+state.speed)*.5*h,remaining);
      // For an automatic route, follow the proven clear segment to its corner.
      // Integrating a turning arc here could clip the inside of the next case.
      const following=path.length&&norm>0;
      const dx=following?dir.x/norm*alignment:-Math.sin(state.heading);
      const dz=following?dir.z/norm*alignment:-Math.cos(state.heading);
      const v=floor.slide(state,dx*delta,dz*delta);
      const actual=hypot(v,state);distance+=actual;state.x=v.x;state.z=v.z;
      if(delta>1e-5&&alignment>.75&&actual<delta*.12){state.speed=Math.min(state.speed,actual/h);if(path.length)blockedTime+=h}
      else if(actual>.0001)blockedTime=0;
      if(blockedTime>.45){path=[];blockedTime=0}
    }
    return {dt,distance,speed:dt?distance/dt:0,turnDelta};
  }
  return {state,reset,go,step,moving:()=>!!path.length||state.speed>.002,hasPath:()=>!!path.length,stop(){path=[];state.speed=0;blockedTime=0;turnSpeed=0}};
}
