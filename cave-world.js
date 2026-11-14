import * as T from 'three';
import {wings,caves,toWorld} from './cave-plan.js';
import {evidenceAt} from './chamber-evidence.js';
import {displayAnchor} from './chamber-layout.js';
import {occluded} from './cave-sight.js';
import {caveHorizon} from './cave-horizon.js';
import {buildCaveTerrace} from './cave-terrace.js';

export async function buildChamber(c,ctx){
  if(c.spaceType==='studio'){
    const {buildCave}=await import('./experience-press.js');
    return buildCave(c,ctx);
  }
  const {buildPhotographicChamber}=await import('./photographic-chamber.js');
  return buildPhotographicChamber(c,ctx);
}
const distanceTo=(p,b)=>Math.hypot(Math.max(0,b.x0-p.x,p.x-b.x1),Math.max(0,b.z0-p.z,p.z-b.z1));
function resources(root,items){
  root.traverse(obj=>{
    if(!obj.isMesh)return;
    items.add(obj.geometry);if(obj.isInstancedMesh)items.add(obj);
    for(const m of [].concat(obj.material)){
      if(items.has(m))continue;
      items.add(m);for(const v of Object.values(m))if(v?.isTexture)items.add(v);
    }
  });
}
export function buildCaveWorld(scene,textures,manager,invalidate,report){
  const updateHorizon=caveHorizon(scene);
  const terraces=wings.map(w=>{
    const built=buildCaveTerrace(w,textures);scene.add(built.group);return {...built,wing:w};
  });
  const signs=terraces.flatMap(t=>t.signs);
  const slots=caves.map(c=>{
    const group=new T.Group();group.name=c.work.siteName+' '+c.work.number;
    group.position.set(c.mouth.x,0,c.mouth.z);group.rotation.y=-c.side*Math.PI/2;group.visible=false;scene.add(group);
    return {c,group,ready:false,pending:null,retryAt:0,lastSeen:0};
  });
  const byId=new Map(slots.map(s=>[s.c.id,s]));
  const loader=new T.TextureLoader(manager),spot=new T.SpotLight(0xffe2bb,0,55,1.03,.91,2);
  const cameraPos=new T.Vector3(),anchor=new T.Vector3(),lens=new T.Vector3(),dir=new T.Vector3(),ray=new T.Raycaster();
  let observing=null;
  let disposed=false,residents=0,lit=null;
  const capacity=matchMedia('(max-width: 700px)').matches?5:8;
  scene.add(spot,spot.target);
  function prepare(slot){
    if(slot.ready||slot.pending||performance.now()<slot.retryAt)return slot.pending;
    const ctx={THREE:T,textures,loader,manager,invalidate};
    slot.pending=buildChamber(slot.c,ctx).then(model=>{
      if(disposed)return;
      slot.model=model;
      slot.detailPrints=slot.c.details.map((_,i)=>model.userData.prints?.get(evidenceAt(slot.c,i)?.src));
      if(observing?.id===slot.c.id)model.userData.setExperience?.(observing.stage,observing.value);
      slot.group.add(model);slot.group.updateMatrixWorld(true);slot.ready=true;residents++;invalidate();
    }).catch(e=>{slot.retryAt=performance.now()+30000;console.error('窟室载入失败',slot.c.id,e);report?.(slot.c);}).finally(()=>{slot.pending=null;});
    return slot.pending;
  }
  function warm(point,zone,active){
    const now=performance.now();
    updateHorizon(point,wings[zone],active);
    for(const t of terraces)t.group.visible=distanceTo(point,t.wing.terrace)<68;
    for(const slot of slots){
      const d=distanceTo(point,slot.c.floorBox);
      const shouldSee=active?slot.c.id===active.id||d<17:(d<45&&(slot.c.hallIndex===zone||d<26));
      slot.group.visible=shouldSee;
      if(shouldSee){slot.lastSeen=now;prepare(slot);}
    }
    if(residents>capacity){
      const idle=slots.filter(s=>s.ready&&!s.group.visible).sort((a,b)=>a.lastSeen-b.lastSeen);
      if(idle.length){
        const keep=new Set(Object.values(textures)),released=new Set();
        for(const s of idle.slice(0,residents-capacity)){
          resources(s.group,released);s.group.clear();s.detailPrints=null;s.model=null;s.ready=false;residents--;
        }
        resources(scene,keep);
        for(const item of released)if(!keep.has(item))item.dispose();
      }
    }
    // Keep the source of the light at the opening, even when looking back at it.
    const bright=active||(zone>=0&&distanceTo(point,wings[zone].terrace)<16?wings[zone].caves[0]:null);
    if(bright?.id!==lit){
      lit=bright?.id;spot.visible=!!bright;
      if(bright){
        const c=bright,from=toWorld(c,-c.width*.14,Math.min(c.height*.73,9),1.4),at=toWorld(c,0,Math.min(3,c.height*.35),-c.depth*.69);
        spot.position.set(from.x,from.y,from.z);spot.target.position.set(at.x,at.y,at.z);
        spot.intensity=c.spaceType?12:Math.min(360,Math.max(95,c.depth*c.width*.75));spot.distance=c.depth*2.9+10;
      }
    }
  }
  function project(c,camera,focus){
    const slot=byId.get(c.id);if(!slot?.ready)return [];
    camera.getWorldPosition(cameraPos);
    const out=[];
    for(const [index,d] of c.details.entries()){
      const p=toWorld(c,...displayAnchor(c,index));anchor.set(p.x,p.y,p.z);lens.copy(anchor).project(camera);
      if(lens.z<=-1||lens.z>=1||Math.abs(lens.x)>.94||Math.abs(lens.y)>.90)continue;
      // A wall or a tower must hide a marker on the other side.
      dir.subVectors(anchor,cameraPos);
      const length=dir.length();ray.set(cameraPos,dir.normalize());ray.near=.08;ray.far=Math.max(.1,length-(index===focus?.75:.42));
      if(!occluded(slot.group,ray))out.push({index,x:(1+lens.x)*.5,y:(1-lens.y)*.5});
    }
    return out;
  }
  function setExperience(id,stage=-1,value=.5){
    if(observing&&observing.id!==id)byId.get(observing.id)?.model?.userData.setExperience?.(-1,.5);
    observing=id&&stage>=0?{id,stage,value}:null;
    if(id)byId.get(id)?.model?.userData.setExperience?.(stage,value);
    invalidate();
  }
  return {warm,project,signs,setExperience,
    async prepare(c){const slot=byId.get(c.id);await prepare(slot);return slot.ready;},
    printAt(c,index){
      return byId.get(c.id)?.detailPrints?.[index];
    },
    detailAtSurface(c,hit){
      const group=byId.get(c.id).group;
      let parent=hit.object;while(parent&&parent!==group)parent=parent.parent;
      if(!parent)return -1;
      let closest=-1,range=Math.max(.48,Math.min(2.2,c.width*.105));
      c.details.forEach((d,i)=>{
        const a=toWorld(c,...displayAnchor(c,i)),distance=Math.hypot(hit.point.x-a.x,hit.point.y-a.y,hit.point.z-a.z);
        if(distance<range){range=distance;closest=i;}
      });
      return closest;
    },
    rayObjects:()=>[...terraces.map(t=>t.group),...slots.map(s=>s.group)].filter(g=>g.visible),
    destroy(){disposed=true;}
  };
}
