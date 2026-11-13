import * as THREE from 'three';
import {makeVisitor} from './visitor-gait.js';
import {VISITORS} from './visitor-roster.js';
import {peerWalk} from './visitor-playback.js';

const identities=new Map(VISITORS.map(v=>[v.id,v]));

function nameplate(name,gender){
  const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
  ctx.font='500 31px "PingFang SC","Microsoft YaHei",sans-serif';
  const width=Math.ceil(ctx.measureText(name).width)+78;
  canvas.width=width;canvas.height=62;
  ctx.fillStyle='rgba(36,33,27,.90)';ctx.beginPath();ctx.roundRect(1,1,width-2,60,22);ctx.fill();
  ctx.lineWidth=1.5;ctx.strokeStyle='rgba(230,207,167,.7)';ctx.stroke();
  ctx.fillStyle=gender==='male'?'#66aff0':'#f58183';
  ctx.beginPath();ctx.arc(24,31,6.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff4df';ctx.font='500 31px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textBaseline='middle';ctx.fillText(name,44,32);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false,toneMapped:false});
  const sprite=new THREE.Sprite(material);
  const height=Math.min(.19,1.72*62/width);
  sprite.scale.set(height*width/62,height,1);
  return sprite;
}
function releasePlate(label){label.material.map.dispose();label.material.dispose();label.removeFromParent();}

export function roomVisitors(scene,groundAt,shoeHeight,invalidate,lineOfSight,artAttention,detailed=false){
  const records=new Map(),group=new THREE.Group();group.name='同馆访客';scene.add(group);
  let active=true,detailClock=0;
  const localGlance={};
  function locate(r){
    r.actor.root.position.set(r.x,groundAt(r),r.z);
    r.actor.root.rotation.y=r.heading;
  }
  function labelFor(r){
    if(r.label)releasePlate(r.label);
    r.label=nameplate(r.name,identities.get(r.avatarId)?.gender);
    r.actor.root.add(r.label);r.label.position.y=r.labelY||1.96;
  }
  function fitLabel(r){
    const head=r.actor.root.getObjectByName('Head');
    if(!head)return;
    const p=head.getWorldPosition(new THREE.Vector3());
    r.labelY=THREE.MathUtils.clamp(p.y-r.actor.root.position.y+.31,1.73,2.12);
    r.label.position.y=r.labelY;
  }
  function attach(r){
    if(r.actor)return;
    const actor=makeVisitor(()=>active&&records.get(r.id)===r&&r.actor===actor,invalidate,r.avatarId,shoeHeight,!!r.detail);
    r.actor=actor;
    actor.root.name='访客 · '+r.name;
    actor.root.userData.visitorId=r.id;group.add(actor.root);locate(r);
    labelFor(r);r.label.visible=false;
    actor.ready.then(ok=>{
      if(r.actor===actor&&ok){r.label.visible=true;fitLabel(r);invalidate();}
    });
  }
  function detach(r){
    if(!r.actor)return;
    const actor=r.actor;r.actor=null;
    releasePlate(r.label);r.label=null;actor.dispose();
  }
  function accept({selfId,visitors}){
    const inRoom=new Set(),now=performance.now();let changed=false;
    for(const p of visitors){
      if(p.id===selfId)continue;
      inRoom.add(p.id);
      let r=records.get(p.id);
      if(!r){
        r={id:p.id,name:p.name,avatarId:p.avatarId,x:p.x,z:p.z,heading:p.heading,target:p,track:peerWalk(p,now),actor:null};
        records.set(p.id,r);changed=true;continue;
      }
      if(r.avatarId!==p.avatarId||r.name!==p.name){
        r.name=p.name;r.avatarId=p.avatarId;
        if(r.actor){
          const actor=r.actor;labelFor(r);
          actor.setAppearance(r.avatarId).then(ok=>{if(ok&&r.actor===actor){fitLabel(r);invalidate();}});
        }
        changed=true;
      }
      const tip=p.trail?.at(-1),moved=p.x!==r.target.x||p.z!==r.target.z;
      // A break remains in the map trail until the next trail point (~38 cm).
      // Reset only on its actual arrival, not repeatedly on those first steps.
      const jumped=moved&&tip?.break&&tip!==r.target.trail?.at(-1)&&tip.x===p.x&&tip.z===p.z;
      if(jumped||Math.hypot(p.x-r.target.x,p.z-r.target.z)>2.4){
        r.track.reset(p,now);
        r.x=p.x;r.z=p.z;r.heading=p.heading;
        if(r.actor){locate(r);r.actor.reset();}
      }else r.track.push(p,now);
      if(p.x!==r.target.x||p.z!==r.target.z||p.heading!==r.target.heading)changed=true;
      r.target=p;
    }
    for(const [id,r] of records)if(!inRoom.has(id)){detach(r);records.delete(id);changed=true;}
    if(changed)invalidate();
  }
  function lookAtCompanion(observer,people,state,dt){
    let best=null,score=3.7;
    const forwardX=-Math.sin(observer.heading),forwardZ=-Math.cos(observer.heading);
    for(const other of people){
      if(other===observer)continue;
      const dx=other.x-observer.x,dz=other.z-observer.z,range=Math.hypot(dx,dz);
      if(range<=.16||range>=3.2)continue;
      const facing=(dx*forwardX+dz*forwardZ)/range;
      const rank=range-.36*facing-(state.person===other ? .22 : 0);
      if(facing<.14||rank>=score||!lineOfSight(observer,other))continue;
      score=rank;best=other;
    }
    if(best!==state.person){state.person=best;state.time=0;}
    if(!best)return null;
    state.time=(state.time||0)+dt;
    if(state.time>1.35&&(state.time%7.3)>.9)return null;
    return {x:best.x,y:groundAt(best)+(best.labelY?best.labelY-.34:1.58),z:best.z,kind:'visitor'};
  }
  function update(dt,viewer){
    const visible=[viewer];
    const now=performance.now();
    detailClock-=dt;
    if(detailed&&detailClock<=0){
      detailClock=.42;
      const candidates=[];
      for(const record of records.values()){
        const range=Math.hypot(viewer.x-record.x,viewer.z-record.z);
        if(range<(record.detail?7:4.8)&&lineOfSight(viewer,record))candidates.push({record,distance:range-(record.detail?1.15:0)});
      }
      candidates.sort((a,b)=>a.distance-b.distance);
      // Only the nearest unobstructed fellow visitor needs full face textures.
      const nearest=candidates[0]?.record;
      for(const record of records.values()){
        const next=record===nearest;
        if(next===record.detail)continue;
        record.detail=next;
        if(record.actor)record.actor.setDetail?.(next);
      }
    }
    for(const r of records.values()){
      const p=r.target;
      const distance=Math.hypot(viewer.x-p.x,viewer.z-p.z);
      if(distance>(r.actor?46:39)){
        detach(r);r.x=p.x;r.z=p.z;r.heading=p.heading;continue;
      }
      attach(r);
      r.track.read(r,now);
      locate(r);
      visible.push(r);
    }
    for(let i=1;i<visible.length;i++){
      const r=visible[i];
      const near=Math.hypot(viewer.x-r.x,viewer.z-r.z)<15;
      if(!r.glance)r.glance={};
      const target=near?(lookAtCompanion(r,visible,r.glance,dt)??artAttention(r)):null;
      r.actor.update({dt,attention:target});
    }
    return lookAtCompanion(viewer,visible,localGlance,dt);
  }

  function nearby(){
    for(const r of records.values())if(r.actor)return true;
    return false;
  }
  function settling(){
    for(const r of records.values())if(r.actor?.isSettling())return true;
    return false;
  }
  return {accept,update,nearby,settling,
    dispose(){active=false;for(const r of records.values())detach(r);records.clear();group.removeFromParent();}
  };
}
