// Viewing order follows the room's curatorial route. The first cave opens on the
// axis of its gallery; the two lateral doors belong to the same physical terrace.
import {records as east} from './cave-east-records.js';
import {records as mogao} from './cave-mogao-records.js';
import {records as maiji} from './cave-maiji-records.js';

import {records as newMogao} from './experience-mogao-records.js';
import {records as newEast} from './experience-east-records.js';
import {records as newMaiji} from './experience-maiji-records.js';
import {records as press} from './experience-press-records.js';

import {records as nirvana} from './walk-nirvana-records.js';
import {records as fengxian} from './walk-fengxian-records.js';

export const caveSelection=[
  ['yungang-20','yungang-6','mogao-257','yungang-12','longmen-712'],
  ['mogao-285','maijishan-44','mogao-249'],
  ['maijishan-4','maijishan-9','mogao-296'],
  ['mogao-302','mogao-401','maijishan-13','mogao-407'],
  ['longmen-1280','longmen-543','mogao-217','mogao-320','mogao-bl-or8210-p2','mogao-158'],
  ['mogao-96','mogao-335','longmen-435'],
  ['mogao-61','mogao-98','mogao-146'],
  ['maijishan-165','maijishan-59','mogao-55'],
  ['yungang-3','longmen-1387','maijishan-120','maijishan-133']
];
export const caveRecords={...east,...mogao,...maiji,...newMogao,...newEast,...newMaiji,...press,...nirvana,...fengxian};
const rockPier=1.55;
export const terraceDepth=4.65;
export function bayLayout(index){
  const rooms=caveSelection[index].map(id=>({...caveRecords[id],id}));
  let before=rooms[0].width/2,after=before;
  const slots=[[rooms[0],0]];
  for(let i=1;i<rooms.length;i++){
    const c=rooms[i],left=i%2===1;
    const offset=(left?-1:1)*((left?before:after)+rockPier+c.width/2);
    slots.push([c,offset]);if(left)before+=rockPier+c.width;else after+=rockPier+c.width;
  }
  return {before:before+.6,after:after+.6,slots};
}
export function rowCenters(){
  const rows=[];let lastBack=0;
  for(let i=0;i<caveSelection.length;i+=2){
    const wings=[bayLayout(i)];if(i+1<caveSelection.length)wings.push(bayLayout(i+1));
    const south=Math.max(...wings.map(w=>w.after)),north=Math.max(...wings.map(w=>w.before));
    const center=i===0?0:rows.at(-1)-Math.max(32,lastBack+south+2.8);
    rows.push(center);lastBack=north;
  }
  return rows;
}
export function galleryGates(index,halfDepth){
  if(index===0)return [{offset:0,width:6.4}];
  const edge=halfDepth-1.54;
  return [-edge,edge].map(offset=>({offset,width:2.55}));
}
