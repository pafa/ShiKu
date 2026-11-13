import {rowCenters,bayLayout} from './cave-program.js';
import {halls} from './dynasty-exhibition.js';
// Positions and dimensions in metres. The long glazed court and the nine rooms
// form one plan. Local +z is south; each doorway is centred on its court wall.
const rows=rowCenters();
export const court = {halfWidth:3.4,north:rows.at(-1)-Math.max(15,bayLayout(8).before),south:Math.max(14,bayLayout(0).after,bayLayout(1).after),doorHalfWidth:2.4};
const rooms = [
  ['石柱造像厅','巨像与石柱之间留出长视距，走近外墙可看云冈第20窟局部扫描。',12.8,9.2,'#a28a74'],
  ['山林禅室','方室向上收作四披覆斗，侧窗的光落在讲述山林与神灵的壁画上。',8.7,8.8,'#ac826e'],
  ['七间崖阁','木柱分出七间，沿檐下长凳看麦积山崖阁的柱列与造像。',10.2,7.7,'#af7151'],
  ['方井绘殿','从方厅抬头，层层收束的藻井呼应窟顶与中心塔柱的几何秩序。',8.4,8.4,'#758880'],
  ['重檐正厅','沿挑檐下的侧廊进入高厅，退到柱间比较唐代经变画与大型造像。',11.4,9.7,'#a9634c'],
  ['八向光厅','高窗环绕八向辐射的屋顶，为中心与四壁的大像、诸佛和罗汉留出视线。',8.8,8.8,'#9b8051'],
  ['山水画斋','在低坡屋顶下沿长墙横向读图，把五台山图当作一段逐步展开的山路。',10.7,6.7,'#83937f'],
  ['经函书阁','重梁下的经函架与书案对应藏经洞里的写本、寺院与收藏史。',7.5,8.7,'#9b775a'],
  ['断代研读室','锯齿天窗照亮工作台和标本柜，可比较洞窟初建、续刻与重修的证据。',10.5,8.1,'#7f9094']
];
export const plans=rooms.map(([title,description,halfWidth,halfDepth,color],index)=>{
  const side=index%2===0?-1:1;
  const usableWidth=Math.max(halfWidth*1.42,(Math.ceil(halls[index].scenes.length/2)*3.05+2.8)/2);
  const roomDepth=halfDepth*1.27;
  return {index,ordinal:index,title,description,halfWidth:usableWidth,halfDepth:roomDepth,color,side,doorSide:-side,
    centerX:side*(court.halfWidth+usableWidth),centerZ:rows[Math.floor(index/2)]};
});
export function threshold(plan, inside=0){
  return {x:plan.side*(court.halfWidth+inside),z:plan.centerZ};
}
export function roomAt(point){
  return plans.find(p=>Math.abs(point.x-p.centerX)<=p.halfWidth &&
    Math.abs(point.z-p.centerZ)<=p.halfDepth)?.index ?? -1;
}
export function wallStations(plan, count){
  const usable=2*plan.halfWidth-2.25;
  const reliefIndex=halls[plan.index]?.scenes.findIndex(work=>work.id==='longmen-met-35146')??-1;
  return Array.from({length:count},(_,index)=>{
    const south=index%2!==0,sign=south?-1:1,slots=south?Math.floor(count/2):Math.ceil(count/2);
    const slot=Math.floor(index/2);
    const reliefOnWall=reliefIndex>=0 && reliefIndex<count && reliefIndex%2===index%2 && slots>1;
    // One dedicated bay holds the four-metre relief and the comparison print.
    const reserved=5.50;
    const spacing=reliefOnWall?(usable-reserved)/(slots-1):usable/slots;
    const reliefSlot=Math.floor(reliefIndex/2),isRelief=index===reliefIndex;
    let fromEnd=(slot+.5)*spacing;
    if(reliefOnWall&&slot>=reliefSlot)fromEnd+=(reserved-spacing)*(isRelief?.5:1);
    const localX=plan.doorSide*(plan.halfWidth-1.125-fromEnd)-(isRelief?sign*.49:0);
    const localZ=(south?1:-1)*(plan.halfDepth-.34);
    return {index,localX,localZ,x:plan.centerX+localX,z:plan.centerZ+localZ,
      inwardZ:sign,width:isRelief?3.937:Math.min(3.85,spacing-.42),height:isRelief?2.083:slots>6?1.64:2.06};
  });
}
