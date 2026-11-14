import {wings,caveFurniture,caveDoorWidth,caveById,toCave} from './cave-plan.js';
import {court,plans} from './building-plan.js';
import {stairSpeedLimit} from './approach-stairs.js';

const radius=.31;
const spacing=.45;
const limit=(n,a,b)=>Math.max(a,Math.min(b,n));
const within=(p,r)=>p.x>=r.x0 && p.x<=r.x1 && p.z>=r.z0 && p.z<=r.z1;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

function crossing(a,b,r) {
  let low=0,high=1;
  for(const [v,min,max] of [['x','x0','x1'],['z','z0','z1']]){
    const delta=b[v]-a[v];
    if(Math.abs(delta)<1e-8){if(a[v]<r[min]||a[v]>r[max])return null;continue;}
    const t0=(r[min]-a[v])/delta,t1=(r[max]-a[v])/delta;
    low=Math.max(low,Math.min(t0,t1));high=Math.min(high,Math.max(t0,t1));
    if(low>high)return null;
  }
  return [low,high];
}

export function buildingFloor(furniture=[]){
  const rects=[{x0:-court.halfWidth+radius,x1:court.halfWidth-radius,z0:court.north+radius,z1:court.south-radius}];
  for(const p of plans){
    rects.push({x0:p.centerX-p.halfWidth+radius,x1:p.centerX+p.halfWidth-radius,
      z0:p.centerZ-p.halfDepth+radius,z1:p.centerZ+p.halfDepth-radius});
    const x=p.side*court.halfWidth,half=court.doorHalfWidth-radius;
    rects.push({x0:x-radius-.03,x1:x+radius+.03,z0:p.centerZ-half,z1:p.centerZ+half});
  }
  // Bridge the inset walking polygons only across actual openings. The court,
  // rock terrace and cave interiors use one continuous navigation mesh.
  const inset=b=>({x0:b.x0+radius,x1:b.x1-radius,z0:b.z0+radius,z1:b.z1-radius});
  function thresholdBox(x,z,width){return {x0:x-radius-.055,x1:x+radius+.055,z0:z-width/2+radius,z1:z+width/2-radius};}
  for(const wing of wings){
    rects.push(inset(wing.terrace));
    for(const gate of wing.gates)rects.push(thresholdBox(wing.outer,gate.z,gate.width));
    for(const cave of wing.caves){
      rects.push(inset(cave.floorBox),thresholdBox(cave.mouth.x,cave.mouth.z,caveDoorWidth(cave)));
    }
  }
  const obstacles=[...furniture,...caveFurniture].map(b=>({x0:b.x0-radius,x1:b.x1+radius,z0:b.z0-radius,z1:b.z1+radius}));
  // Index nearby walls and obstacles once. A route between distant wings can
  // touch thousands of grid edges, most of which are entirely inside one room.
  const bucketSize=6;
  const tile=x=>Math.floor(x/bucketSize);
  const index=(i,j)=>(i+1200)*4096+j+1200;
  function bin(list){
    const cells=new Map();
    for(const r of list)for(let i=tile(r.x0);i<=tile(r.x1);i++)for(let j=tile(r.z0);j<=tile(r.z1);j++){
      const key=index(i,j);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(r);
    }
    return cells;
  }
  const surfaces=bin(rects),fittings=bin(obstacles),empty=[];
  const free=p=>{
    const key=index(tile(p.x),tile(p.z));
    return (surfaces.get(key)||empty).some(r=>within(p,r))&&!(fittings.get(key)||empty).some(r=>within(p,r));
  };
  function clear(a,b) {
    const key=index(tile(a.x),tile(a.z)),local=key===index(tile(b.x),tile(b.z));
    const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),z0=Math.min(a.z,b.z),z1=Math.max(a.z,b.z);
    const overlaps=r=>r.x0<=x1&&r.x1>=x0&&r.z0<=z1&&r.z1>=z0;
    const barriers=local?(fittings.get(key)||empty):obstacles;
    if(barriers.some(r=>overlaps(r)&&crossing(a,b,r)))return false;
    const rooms=local?(surfaces.get(key)||empty):rects;
    if(rooms.some(r=>r.x0<=x0&&r.x1>=x1&&r.z0<=z0&&r.z1>=z1))return true;
    const intervals=[];for(const r of rooms)if(overlaps(r)){const interval=crossing(a,b,r);if(interval)intervals.push(interval);}
    intervals.sort((l,r)=>l[0]-r[0]);let covered=0;
    for(const [start,end] of intervals){if(start>covered+1e-6)return false;covered=Math.max(covered,end);if(covered>=1)return true;}
    return false;
  }
  const left=Math.floor(Math.min(...rects.map(r=>r.x0)))-1;
  const top=Math.floor(Math.min(...rects.map(r=>r.z0)))-1;
  const columns=Math.ceil((Math.max(...rects.map(r=>r.x1))-left)/spacing)+2;
  const rows=Math.ceil((Math.max(...rects.map(r=>r.z1))-top)/spacing)+2;
  const count=columns*rows;
  const point=k=>({x:left+(k%columns)*spacing,z:top+Math.floor(k/columns)*spacing});
  const mask=Uint8Array.from({length:count},(_,k)=>Number(free(point(k))));
  function nearest(p,visible=false) {
    const col=limit(Math.round((p.x-left)/spacing),0,columns-1);
    const row=limit(Math.round((p.z-top)/spacing),0,rows-1);
    let best=-1,bestDistance=Infinity;
    for(let ring=0;ring<Math.max(columns,rows);ring++){
      for(let j=Math.max(0,row-ring);j<=Math.min(rows-1,row+ring);j++){
        for(let i=Math.max(0,col-ring);i<=Math.min(columns-1,col+ring);i++){
          if(Math.max(Math.abs(j-row),Math.abs(i-col))!==ring)continue;
          const k=j*columns+i;
          if(!mask[k]||(visible&&!clear(p,point(k))))continue;
          const d=distance(p,point(k));if(d<bestDistance){best=k;bestDistance=d;}
        }
      }
      if(best>=0)return best;
    }
    return best;
  }
  const snap=p=>free(p)?{x:p.x,z:p.z}:point(nearest(p));
  function route(from,raw){
    const goal=snap(raw);
    if(clear(from,goal))return [goal];
    const first=nearest(from,true),last=nearest(goal,true);
    if(first<0||last<0)return [];
    const costs=new Float64Array(count).fill(Infinity),parents=new Int32Array(count).fill(-1);
    const visited=new Uint8Array(count),queue=[];
    function push(id,priority){
      const entry={id,priority};let i=queue.length;queue.push(entry);
      while(i>0){const parent=(i-1)>>1;if(queue[parent].priority<=priority)break;queue[i]=queue[parent];i=parent;}
      queue[i]=entry;
    }
    function pop(){
      const first=queue[0],tail=queue.pop();if(!queue.length)return first.id;let i=0;
      while(i*2+1<queue.length){let child=i*2+1;if(child+1<queue.length&&queue[child+1].priority<queue[child].priority)child++;
        if(tail.priority<=queue[child].priority)break;queue[i]=queue[child];i=child;}
      queue[i]=tail;return first.id;
    }
    costs[first]=0;push(first,0);
    while(queue.length){
      const id=pop();if(visited[id])continue;if(id===last)break;visited[id]=1;
      const col=id%columns;
      for(const [dx,dz] of directions){
        if(col+dx<0||col+dx>=columns)continue;
        const next=id+dz*columns+dx;if(!mask[next]||visited[next])continue;
        if(dx&&dz&&(!mask[id+dx]||!mask[id+dz*columns]))continue;
        const cost=costs[id]+(dx&&dz?Math.SQRT2:1)*spacing;
        if(cost>=costs[next])continue;
        if(!clear(point(id),point(next)))continue;
        costs[next]=cost;parents[next]=id;push(next,cost+distance(point(next),goal));
      }
    }
    if(last!==first&&parents[last]<0)return [];
    const path=[];for(let k=last;k>=0;k=parents[k]){path.push(point(k));if(k===first)break;}
    path.reverse();path.push(goal);
    const smooth=[];let anchor=from;
    for(let i=0;i<path.length;){let j=i;while(j+1<path.length&&clear(anchor,path[j+1]))j++;smooth.push(path[j]);anchor=path[j];i=j+1;}
    return smooth;
  }
  function slide(p,dx,dz){
    const next={x:p.x+dx,z:p.z+dz};if(free(next))return next;
    const x={x:next.x,z:p.z},z={x:p.x,z:next.z};
    if(Math.abs(dx)>Math.abs(dz))return free(x)?x:free(z)?z:p;
    return free(z)?z:free(x)?x:p;
  }
  const approach=caveById.get('longmen-1280');
  function speedLimit(p) {
    return within(p,approach.floorBox) ? stairSpeedLimit(-toCave(approach,p).z) : Infinity;
  }
  return {free,clear,snap,route,slide,speedLimit,rects,obstacles};
}
