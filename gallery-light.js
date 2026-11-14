import * as THREE from 'three';
import {court,plans} from './building-plan.js';
import {wings} from './cave-plan.js';

export function galleryLight(scene){
  // A finite light pool keeps the shader cost constant. Every source is fixed to
  // an opening or a gallery fitting; unoccupied bays need no dynamic lighting.
  const sources=[];
  function source(x,y,z,color,power,range){sources.push({x,y,z,color,power,range,score:0});}
  for(const p of plans){
    source(p.side*(court.halfWidth+.28),3.75,p.centerZ,0xe1ebf3,58,14);
    for(const sign of [-1,1]){
      source(p.centerX+sign*p.halfWidth*.48,4.15,p.centerZ-p.side*p.halfDepth*.35,0xffead2,44,11);
    }
  }
  for(const wing of wings){
    for(const c of wing.caves){
      const open=c.id==='longmen-1280'||c.id==='yungang-20';
      source(c.mouth.x+c.side*.45,open?4.7:2.65,c.mouth.z,open?0xe1eaf3:0xffe4be,open?66:22,open?15:9);
    }
  }
  for(let z=court.north+3;z<court.south;z+=10.5)source(-2.95,4.2,z,0xe1ebed,65,13);
  const slots=Array.from({length:4},()=>{
    const lamp=new THREE.PointLight(0xffffff,0,12,2);scene.add(lamp);return {lamp,source:null};
  });
  let lastX=Infinity,lastZ=Infinity,chosen=[];
  function update(x,z,dt){
    const travel=Math.hypot(x-lastX,z-lastZ);
    if(travel>.45){
      lastX=x;lastZ=z;
      for(const s of sources){const d=(x-s.x)**2+(z-s.z)**2;s.score=d<25**2?s.power/(8+d+s.y*s.y):0;}
      chosen=sources.filter(s=>s.score>0).sort((a,b)=>b.score-a.score).slice(0,slots.length);
    }
    const blend=travel>5?1:1-Math.exp(-Math.min(dt,1)*7);
    for(const slot of slots){
      if(slot.source&&!chosen.includes(slot.source)){
        slot.lamp.intensity*=1-blend;
        if(slot.lamp.intensity>.24)continue;
        slot.source=null;
      }
      if(!slot.source){
        const s=chosen.find(c=>!slots.some(v=>v.source===c));if(!s)continue;
        slot.source=s;slot.lamp.position.set(s.x,s.y,s.z);slot.lamp.color.setHex(s.color);slot.lamp.distance=s.range;
      }
      const s=slot.source,falloff=1-THREE.MathUtils.smoothstep(Math.hypot(x-s.x,z-s.z),15,25);
      slot.lamp.intensity+=(s.power*falloff-slot.lamp.intensity)*blend;
    }
  }
  return {update};
}
