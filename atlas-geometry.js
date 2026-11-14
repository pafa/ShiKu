// Floor plans and people share the walking controller's metre coordinates.
import {court, plans, roomAt} from './building-plan.js';
import {caves, caveAt, wingAt} from './cave-plan.js';
import {halls} from './dynasty-exhibition.js';
import {VISITORS} from './visitor-roster.js';

const styles = new Map(VISITORS.map(entry => [entry.id,entry]));
export const visitorColors = {male:'#3288ce',female:'#cd4e54'};
export function markerColor(avatarId) {
  return visitorColors[styles.get(avatarId)?.gender] || '#8b7b68';
}
export function locationName(p) {
  const c = caveAt(p);
  if(c) return c.id==='mogao-bl-or8210-p2'?'藏经洞书房':c.work.siteName+' · '+c.work.number;
  const index = roomAt(p);
  if(index>=0) return halls[index].name+' · '+plans[index].title;
  const wing = wingAt(p);
  return wing ? halls[wing.plan.index].name+' · 崖廊' : '中央步廊';
}
// In the landscape view north points right. The compact view has north at the top.
export function project(x,z,vertical=false) { return vertical ? [x,z] : [-z,x]; }
export function projectBox(box,vertical=false) {
  const a=project(box.x0,box.z0,vertical),b=project(box.x1,box.z1,vertical);
  return {x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),width:Math.abs(b[0]-a[0]),height:Math.abs(b[1]-a[1])};
}
export const courtBox={x0:-court.halfWidth,x1:court.halfWidth,z0:court.north,z1:court.south};
export const worldBox = {
  x0:Math.min(courtBox.x0,...caves.map(c=>c.floorBox.x0)),x1:Math.max(courtBox.x1,...caves.map(c=>c.floorBox.x1)),
  z0:Math.min(court.north,...caves.map(c=>c.floorBox.z0)),z1:Math.max(court.south,...caves.map(c=>c.floorBox.z1))
};
export const hallBox=p=>({x0:p.centerX-p.halfWidth,x1:p.centerX+p.halfWidth,z0:p.centerZ-p.halfDepth,z1:p.centerZ+p.halfDepth});
export const goodPoint=p=>p && Number.isFinite(p.x) && Number.isFinite(p.z);
export function trailPath(points,xy,visible=()=>true) {
  let path='',nextMove=true;
  for(const point of points || []) {
    if(!goodPoint(point)||!visible(point)){nextMove=true;continue;}
    const [u,v]=xy(point.x,point.z);
    path+=(nextMove||point.break?'M':'L')+u.toFixed(2)+' '+v.toFixed(2);
    nextMove=false;
  }
  return path;
}
export const svgNode=(tag,attrs={},text='')=>{
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);
  if(text)el.textContent=text;
  return el;
};
