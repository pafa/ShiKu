import {plans,court} from './building-plan.js';
import {goodPoint,markerColor,trailPath} from './atlas-geometry.js';
import {wings,caves,caveAt,toCave,caveDoorWidth} from './cave-plan.js';

const ns='http://www.w3.org/2000/svg';
function node(tag,attributes){
  const n=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attributes))n.setAttribute(key,value);
  return n;
}
export function livePlan(button){
  const minX=Math.min(...caves.map(c=>c.floorBox.x0))-2,maxX=Math.max(...caves.map(c=>c.floorBox.x1))+2;
  const overview=[-3,minX,court.south-court.north+6,maxX-minX].join(' ');
  const surface=node('svg',{viewBox:overview,'aria-hidden':'true'});
  const museum=node('g',{}),caveLayer=node('g',{}),position=node('g',{});
  const horizontal=z=>court.south-z;
  function box(b,cls){return node('rect',{x:horizontal(b.z1),y:b.x0,width:b.z1-b.z0,height:b.x1-b.x0,class:cls});}
  museum.append(node('rect',{x:0,y:-court.halfWidth,width:court.south-court.north,height:court.halfWidth*2,class:'court'}));
  const blocks=plans.map(p=>{const shape=box({x0:p.centerX-p.halfWidth,x1:p.centerX+p.halfWidth,z0:p.centerZ-p.halfDepth,z1:p.centerZ+p.halfDepth},'wing');museum.append(shape);return shape;});
  for(const w of wings){museum.append(box(w.terrace,'mini-terrace'));w.caves.forEach(c=>museum.append(box(c.floorBox,'mini-cave')));}
  position.append(node('path',{d:'M 2 -1.3 L 9 0 L 2 1.3 Z',fill:'#ffe3a3'}),
    node('circle',{r:2.4,fill:'#fff3cc',stroke:'#43321e','stroke-width':1}));
  const traffic=node('g',{'aria-hidden':'true'});
  surface.append(museum,caveLayer,traffic,position);button.prepend(surface);const caption=button.querySelector('span');
  let oldZone=-2,oldCave=undefined,seen=null;
  let presence={selfId:null,visitors:[]};
  function paintTraffic() {
    const c=oldCave;
    const xy=(x,z)=>{
      if(!c)return [horizontal(z),x];
      const local=toCave(c,{x,z});return [local.x,local.z];
    };
    const inside=point=>!c||caveAt(point)===c;
    const strokes=[],dots=[],unit=c?Math.max(.11,Math.min(.27,c.width*.013)):1;
    let count=0;
    for(const visitor of presence.visitors){
      if(!goodPoint(visitor))continue;
      const self=visitor.id===presence.selfId,color=markerColor(visitor.avatarId);
      const d=trailPath(visitor.trail,xy,inside);
      if(d)strokes.push(node('path',{d,fill:'none',stroke:color,'stroke-width':1.25*unit,opacity:.78}));
      if(self){position.lastElementChild.setAttribute('fill',color);continue;}
      if(!inside(visitor))continue;
      const [cx,cy]=xy(visitor.x,visitor.z);
      dots.push(node('circle',{cx,cy,r:2.4*unit,fill:color,stroke:'#fff0d1','stroke-width':.55*unit}));count++;
    }
    traffic.replaceChildren(...strokes,...dots);
    const captionText=(c?'窟内方位':'全馆方位')+(count?' · 另 '+count+' 人':'');
    if(caption.textContent!==captionText)caption.textContent=captionText;
  }
  function update(p,yaw,zone){
    if(!goodPoint(p))return;
    seen=p;
    const c=caveAt(p),changed=c!==oldCave;
    if(changed){
      oldCave=c;museum.style.display=c?'none':'';caveLayer.replaceChildren();
      surface.setAttribute('viewBox',c?[-c.width/2-1,-c.depth-.7,c.width+2,c.depth+2.6].join(' '):overview);
      if(c){
        const w=c.width/2,d=c.depth,gate=caveDoorWidth(c)/2;
        caveLayer.append(node('path',{d:'M '+(-gate)+' 0 H '+(-w)+' V '+(-d)+' H '+w+' V 0 H '+gate,fill:'#b69b6e24',stroke:'#ceba92','stroke-width':.14}));
        for(const b of c.obstacles)caveLayer.append(node('rect',{x:b.x0,y:b.z0,width:b.x1-b.x0,height:b.z1-b.z0,fill:'#ab94774f'}));
        for(const item of c.details)caveLayer.append(node('circle',{cx:item.stand[0],cy:item.stand[1],r:Math.max(.13,c.width*.014),fill:'#cfb988'}));
      }
    }
    if(changed)paintTraffic();
    if(c){const local=toCave(c,p),dir=yaw*180/Math.PI+(c.side>0?180:0);
      position.setAttribute('transform','translate('+local.x.toFixed(2)+' '+local.z.toFixed(2)+') rotate('+dir.toFixed(1)+') scale('+Math.max(.11,Math.min(.27,c.width*.013))+')');
    }else{
      if(oldZone!==zone){blocks.forEach((shape,i)=>shape.classList.toggle('active',i===zone));oldZone=zone;}
      position.setAttribute('transform','translate('+horizontal(p.z).toFixed(2)+' '+p.x.toFixed(2)+') rotate('+(yaw*180/Math.PI).toFixed(1)+')');
    }
  }
  update.setPresence=snapshot=>{
    presence=snapshot||{selfId:null,visitors:[]};
    if(!presence.selfId)position.lastElementChild.setAttribute('fill','#fff3cc');
    if(seen)paintTraffic();
  };
  update.updatePeers=update.setPresence;
  return update;
}
