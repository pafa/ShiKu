import {plans} from './building-plan.js';
import {halls} from './dynasty-exhibition.js';
import {bayLayout,terraceDepth,galleryGates} from './cave-program.js';

export const wings=plans.map(p=>{
  const layout=bayLayout(p.index),outer=p.centerX+p.side*p.halfWidth;
  const innerZ=p.centerZ-Math.max(p.halfDepth,layout.before),outerZ=p.centerZ+Math.max(p.halfDepth,layout.after);
  const entryX=outer+p.side*terraceDepth;
  const caves=layout.slots.map(([raw,offset],order)=>{
    const work=halls[p.index].scenes.find(s=>s.id===raw.id);
    const bound={x:entryX,z:p.centerZ+offset};
    return {...raw,work,hallIndex:p.index,order,side:p.side,mouth:bound,
      floorBox:worldRect(bound,p.side,{x0:-raw.width/2,x1:raw.width/2,z0:-raw.depth,z1:0})};
  });
  return {plan:p,outer,entryX,caves,gates:galleryGates(p.index,p.halfDepth).map(g=>({...g,z:p.centerZ+g.offset})),
    terrace:{x0:Math.min(outer,entryX),x1:Math.max(outer,entryX),z0:innerZ,z1:outerZ}};
});
export const caves=wings.flatMap(wing=>wing.caves);
export const caveById=new Map(caves.map(c=>[c.id,c]));

function worldRect(origin,side,b){
  const a=origin.x-side*b.z0,bx=origin.x-side*b.z1;
  const c=origin.z+side*b.x0,d=origin.z+side*b.x1;
  return {x0:Math.min(a,bx),x1:Math.max(a,bx),z0:Math.min(c,d),z1:Math.max(c,d)};
}
export function toWorld(c,x,y,z){return {x:c.mouth.x-c.side*z,y,z:c.mouth.z+c.side*x};}
export function toCave(c,p){return {x:c.side*(p.z-c.mouth.z),z:-c.side*(p.x-c.mouth.x)};}
export function isInside(point,box){return point.x>=box.x0&&point.x<=box.x1&&point.z>=box.z0&&point.z<=box.z1;}
export const caveFurniture=caves.flatMap(c=>c.obstacles.map(b=>worldRect(c.mouth,c.side,b)));
export function caveAt(p){return caves.find(c=>isInside(p,c.floorBox))||null;}
export function wingAt(p){return wings.find(w=>isInside(p,w.terrace))||null;}
export function caveDoorWidth(c){return Math.min(c.width-.35,c.mouthWidth||3.6);}
