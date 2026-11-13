import {roomAt,wallStations} from './building-plan.js';
import {caveAt,toWorld} from './cave-plan.js';
import {displayAnchor} from './chamber-layout.js';

// Both the local visitor and someone seen by another participant use actual
// exhibit positions. Looking never takes movement control from the visitor.
export function exhibitionAttention(plans,halls,clearPath){
  const stations=plans.map(plan=>wallStations(plan,halls[plan.index].scenes.length));
  const caveTargets=new Map();
  function facing(person,x,z){
    const dx=x-person.x,dz=z-person.z,range=Math.hypot(dx,dz);
    return range>.16?(-Math.sin(person.heading)*dx-Math.cos(person.heading)*dz)/range:-1;
  }
  return function attention(person){
    const cave=caveAt(person);
    if(cave){
      let targets=caveTargets.get(cave.id);
      if(!targets){
        targets=cave.details.map((d,i)=>({stand:toWorld(cave,d.stand[0],0,d.stand[1]),
          art:{...toWorld(cave,...displayAnchor(cave,i)),kind:'art'},radius:d.radius??2.2}));
        caveTargets.set(cave.id,targets);
      }
      let chosen=null,score=Infinity;
      for(const {stand,art,radius} of targets){
        const distance=Math.hypot(stand.x-person.x,stand.z-person.z),dot=facing(person,art.x,art.z);
        const rank=distance-.84*dot;
        if(distance>radius+.6||dot<.04||rank>=score||!clearPath(person,stand))continue;
        score=rank;chosen=art;
      }
      return chosen;
    }
    const room=roomAt(person);if(room<0)return null;
    let best=null,score=Infinity;
    for(const station of stations[room]){
      const dx=station.x-person.x,dz=station.z-person.z,dist=Math.hypot(dx,dz);
      if(dist>4.1||-dz*station.inwardZ<.12)continue;
      const dot=facing(person,station.x,station.z),rank=dist-dot*1.35;
      if(dot<.18||rank>=score)continue;
      const stand={x:station.x,z:station.z+station.inwardZ*.86};
      if(!clearPath(person,stand))continue;
      best={x:station.x,y:1.92,z:station.z,kind:'art'};score=rank;
    }
    return best;
  };
}
