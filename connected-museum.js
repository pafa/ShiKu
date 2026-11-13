import {displayAnchor} from './chamber-layout.js';
import {treadHeight} from './approach-stairs.js';
import {groundHeightAtDepth, makeStrollController, proximityGate} from './stroll-controller.js';
import {caveAt,wingAt,caveById,toCave,toWorld,wings} from './cave-plan.js';
import {buildCaveWorld} from './cave-world.js';
import {applyGalleryFinishes} from './gallery-finishes.js';
import {makeEditorialDisplays} from './editorial-displays.js';
import * as THREE from 'three';
import {galleryLight} from './gallery-light.js';
import {fineVisitorDetail} from './visitor-model.js';
import {makeVisitor} from './visitor-gait.js';
import {exhibitionAttention} from './visitor-attention.js';
import {roomVisitors} from './room-visitors.js';
import {makeWalker,MAX_FRAME_SECONDS} from './walking.js';
import {loadSurfaces} from './material-realism.js';
import {buildPavilion} from './render-pavilions.js';
import {buildAtrium} from './campus-atrium.js';
import {nearbyOriginal} from './exhibit-resolution.js';
import {mountArt} from './pavilion-art.js';
import {buildingFloor} from './building-floor.js';
import {plans,threshold,roomAt} from './building-plan.js';

const clamp=THREE.MathUtils.clamp;
const angleDiff=(to,from)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
function worldBox(b,plan={centerX:0,centerZ:0}){
  const x0=b.x0??b.x-b.halfX,x1=b.x1??b.x+b.halfX,z0=b.z0??b.z-b.halfZ,z1=b.z1??b.z+b.halfZ;
  return {x0:x0+plan.centerX,x1:x1+plan.centerX,z0:z0+plan.centerZ,z1:z1+plan.centerZ};
}
function furnitureShadow() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');
  const gradient=ctx.createRadialGradient(64,64,3,64,64,64);
  gradient.addColorStop(0,'rgba(26,18,12,.64)');gradient.addColorStop(.39,'rgba(26,18,12,.33)');gradient.addColorStop(1,'rgba(26,18,12,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false});
}

export function mountBuilding(host,halls,events) {
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}
  catch(cause){const error=new Error('此设备未能启动三维展馆。',{cause});error.name='WebGLUnavailable';throw error;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.55));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.tabIndex=0;
  canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:none;cursor:grab';
  canvas.setAttribute('aria-label','九座相连的展馆、可步入的窟龛和藏经洞双卷书房。点地面或用方向键行走，拖动环顾。走近窟内观察点会展开故事。');
  host.append(canvas);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c3d0d1');
  scene.fog=new THREE.FogExp2('#c0b9ac',.008);
  const camera=new THREE.PerspectiveCamera(56,1,.055,150);
  const sky=new THREE.HemisphereLight('#e9f0f4','#ab9481',1.08);
  scene.add(sky);
  const sun=new THREE.DirectionalLight('#ffebd3',2.30);
  sun.castShadow=true;sun.shadow.mapSize.set(host.clientWidth<700?1024:2048,host.clientWidth<700?1024:2048);
  Object.assign(sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:.4,far:88});
  sun.shadow.normalBias=.018;sun.shadow.bias=-.00029;scene.add(sun,sun.target);
  const sunOffset = new THREE.Vector3(15,29,12);
  const shadowAxis = sunOffset.clone().normalize();
  const shadowRight = new THREE.Vector3().crossVectors(sun.up,shadowAxis).normalize();
  const shadowUp = new THREE.Vector3().crossVectors(shadowAxis,shadowRight);
  const shadowCenter = new THREE.Vector3();
  const texel = (sun.shadow.camera.right-sun.shadow.camera.left)/sun.shadow.mapSize.x;
  function positionSun(x,z) {
    // Put the moving shadow camera on its own light-space texel grid. A large
    // world-axis snap changes the sampling phase on every door and picture.
    shadowCenter.set(x,0,z);
    const u=Math.round(shadowCenter.dot(shadowRight)/texel)*texel;
    const v=Math.round(shadowCenter.dot(shadowUp)/texel)*texel;
    const depth=shadowCenter.dot(shadowAxis);
    sun.target.position.copy(shadowRight).multiplyScalar(u)
      .addScaledVector(shadowUp,v).addScaledVector(shadowAxis,depth);
    sun.position.copy(sun.target.position).add(sunOffset);
  }
  const bounce=new THREE.DirectionalLight('#e2e8ec',.56);bounce.position.set(-12,8,6);scene.add(bounce);
  const daylight=galleryLight(scene);

  let stopped=false,paused=false,dirtyUntil=0,previous=performance.now(),lastActorFrame=previous,frame;
  const invalidate=()=>{dirtyUntil=performance.now()+1000;};
  const focusOriginal=nearbyOriginal(renderer,invalidate);
  let loading=false;
  const loaded=[];let firstView=true,initialAssetError=false;
  const manager=new THREE.LoadingManager(()=>{
    loading=false;invalidate();for(const finish of loaded.splice(0))finish();
  },(_url,done,total)=>{invalidate();if(firstView)events.onLoadProgress?.('objects',done,total);},()=>{if(firstView)initialAssetError=true;});
  manager.onStart=(_url,done,total)=>{loading=true;if(firstView)events.onLoadProgress?.('objects',done,total);};
  const whenLoaded=()=>loading?new Promise(resolve=>loaded.push(resolve)):Promise.resolve();
  const textures=loadSurfaces(new THREE.TextureLoader(manager),manager,scene,renderer);
  new THREE.TextureLoader(manager).load('assets/museum/garden/autumn-forest.webp',texture=>{
    texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;
    scene.background=texture;scene.backgroundRotation.y=1.34;scene.backgroundIntensity=1.08;
    textures.garden=texture;invalidate();
  });
  const allPlans=plans.map((p,i)=>({...p,name:halls[i].name}));
  const atrium=buildAtrium(allPlans,textures);scene.add(atrium.group);
  const obstacles=atrium.obstacles.map(b=>worldBox(b)),sharedImages=new Map();
  const rooms=allPlans.map(plan=>{
    // Keep the hall and its exhibits in the scene for navigation and picking.
    // Fetch full photographic textures as a visitor comes within viewing distance.
    const pendingPhotos=[];
    const deferPhoto=(localX,localZ,load)=>pendingPhotos.push({
      x:plan.centerX+localX,z:plan.centerZ+localZ,load
    });
    const structure=buildPavilion(plan,textures,halls[plan.index].scenes,{manager,sharedImages,invalidate,deferPhoto}),group=new THREE.Group();
    group.name='展馆 · '+plan.name;group.position.set(plan.centerX,0,plan.centerZ);
    applyGalleryFinishes(plan,structure.group,halls[plan.index].scenes.length,textures);
    const editorial=makeEditorialDisplays(plan,halls[plan.index],sharedImages,manager,invalidate,deferPhoto);
    group.add(structure.group,editorial.group);scene.add(group);
    obstacles.push(...editorial.obstacles.map(b=>worldBox(b,plan)));
    obstacles.push(...structure.obstacles.map(b=>worldBox(b,plan)));
    return {plan,group,pendingPhotos,deferPhoto,structure:structure.group,featureTargets:[...(structure.targets||[]),...editorial.targets],art:null};
  });
  // A short indirect shadow anchors furnishings even in the shade of a solid roof.
  const ambientGeometry=new THREE.PlaneGeometry(1,1);
  ambientGeometry.rotateX(-Math.PI/2);
  const footings=new THREE.InstancedMesh(ambientGeometry,furnitureShadow(),obstacles.length);
  footings.material.opacity=.50;footings.material.polygonOffset=true;footings.material.polygonOffsetFactor=-1;
  const footprint=new THREE.Object3D();
  obstacles.forEach((box,i)=>{
    footprint.position.set((box.x0+box.x1)/2,.044,(box.z0+box.z1)/2);
    footprint.scale.set((box.x1-box.x0)*1.6+.42,1,(box.z1-box.z0)*1.6+.42);
    footprint.updateMatrix();footings.setMatrixAt(i,footprint.matrix);
  });
  scene.add(footings);
  const rockWorld=buildCaveWorld(scene,textures,manager,invalidate,c=>events.onCaveError?.(c));
  const floor=buildingFloor(obstacles),walker=makeWalker(floor);
  // The walking camera is at least two metres away. Keep close-up geometry
  // for the portrait viewer; first person does not draw the local body at all.
  const visitor=makeVisitor(()=>!stopped,invalidate,events.initialVisitor,shoeHeight,false);
  scene.add(visitor.root);
  const artAttention=exhibitionAttention(allPlans,halls,floor.clear);
  const guests=roomVisitors(scene,elevationAt,shoeHeight,invalidate,floor.clear,artAttention,fineVisitorDetail(renderer));
  const marker=new THREE.Mesh(new THREE.RingGeometry(.10,.129,36),new THREE.MeshBasicMaterial({color:'#d9b376',opacity:.85,transparent:true,depthWrite:false}));
  marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
  const keys=new Set(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitPoint=new THREE.Vector3();
  const target=new THREE.Vector3(),softTarget=new THREE.Vector3(),desiredCamera=new THREE.Vector3();
  const signMap=new Map(atrium.signs.map(s=>[s.mesh,s.hallIndex]));
  let yaw=-1.38,pitch=.038,arm=4.05,eyes=false,snapCamera=true,drag=null,autoFace=false,destination=null;
  let observationLens=null;
  let thumbForward=0,thumbSide=0;
  let zone=-2,near=null,lastMap=0,lastWarmX=Infinity,lastWarmZ=Infinity;
  const getArt=room=>{
    if(!room.art){
      room.art=mountArt(room.plan,halls[room.plan.index].scenes,textures,manager,sharedImages,invalidate,room.deferPhoto);
      room.group.add(room.art.group);
      for(const mesh of room.featureTargets){
        if(mesh.userData.manuscriptId){room.art.targets.push(mesh);continue;}
        const station=room.art.stations[mesh.userData.stationIndex];
        if(station){mesh.userData.exhibit=station;room.art.targets.push(mesh);}
      }
    }
    return room.art;
  };
  function warmRooms(point,force=false){
    if(!force&&Math.hypot(point.x-lastWarmX,point.z-lastWarmZ)<1.5)return;
    lastWarmX=point.x;lastWarmZ=point.z;
    // From a doorway the whole hall is in view. Elsewhere request nearby prints
    // eighteen metres ahead so they are ready at normal walking speed.
    for(const room of rooms){
      room.group.visible=Math.abs(room.plan.centerZ-point.z)<40;
      if(!room.group.visible)continue;
      getArt(room);
      const plan=room.plan;
      const inHall=Math.abs(point.x-plan.centerX)<=plan.halfWidth&&Math.abs(point.z-plan.centerZ)<=plan.halfDepth;
      const doorway=threshold(plan);
      const arriving=inHall||Math.hypot(point.x-doorway.x,point.z-doorway.z)<=5;
      for(let i=room.pendingPhotos.length-1;i>=0;i--){
        const photo=room.pendingPhotos[i];
        if(!arriving&&Math.hypot(photo.x-point.x,photo.z-point.z)>18)continue;
        room.pendingPhotos.splice(i,1);
        photo.load();
      }
    }
  }
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;if(w&&h){
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=eyes?(observationLens??(w<h?66:59)):(w<h?61:54);
      camera.updateProjectionMatrix();invalidate();
    }
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let arrival=null,finalYaw=null,finalPitch=null;
  function cancelArrival(){
    finalYaw=null;finalPitch=null;requestedDetail=null;
    if(arrival){const old=arrival;arrival=null;old.cancel?.();}
  }
  function stop(){
    stroll.pause();
    cancelArrival();
    thumbForward=thumbSide=0;keys.clear();walker.stop();autoFace=false;destination=null;marker.visible=false;events.onJourney?.(null);invalidate();
  }
  function elevationAt(p) {
    const cave = caveAt(p);
    return cave?.ground ? groundHeightAtDepth(cave.ground, -toCave(cave, p).z) : 0;
  }
  function shoeHeight(x,z) {
    const p={x,z}, cave=caveAt(p);
    if(cave?.id==='longmen-1280')return treadHeight(-toCave(cave,p).z);
    return cave?.ground ? groundHeightAtDepth(cave.ground,-toCave(cave,p).z) : 0;
  }
  function bodyPose(){
    const {x,z,heading}=walker.state, ground=elevationAt(walker.state);
    visitor.root.position.set(x,ground,z);visitor.root.rotation.y=heading;
  }
  let activeCave=null,activeDetail=-1,activeTerrace=-1,lastCueFrame=0,requestedDetail=null;
  const storyGate = proximityGate();
  let restoreEyes = null;
  function haltStrollLeg() {
    thumbForward=thumbSide=0;
    walker.stop();
    cancelArrival();
    marker.visible = false;
    autoFace = false;
    invalidate();
  }
  const stroll = makeStrollController({
    move(c, point) {
      const target = toWorld(c, point[0], 0, point[1]);
      if (!floor.free(target)) return false;
      const goal = walker.go(target);
      if (!goal) return false;
      requestedDetail = null;
      finalPitch = finalYaw = null;
      autoFace = true;
      invalidate();
      return true;
    },
    halt: haltStrollLeg,
    distance(c, point) {
      const local = toCave(c, walker.state);
      return Math.hypot(local.x-point[0], local.z-point[1]);
    },
    focus(c, i) { lookAtDetail(c, i); },
    notify(state) {
      if (state.status === 'idle' && restoreEyes !== null) {
        const previousView = restoreEyes;
        restoreEyes = null;
        view(previousView);
      }
      events.onStroll?.(state);
      invalidate();
    },
    narrating: (id, detailIndex) => events.isStrollNarrating?.(id, detailIndex)
  });
  function startStroll(id, {at = 0} = {}) {
    const cave = caveById.get(id);
    if (!cave?.stroll || cave !== activeCave) return false;
    stroll.stop();
    stop();
    restoreEyes = eyes;
    view(true);
    const started = stroll.start(cave, at);
    if (!started && stroll.state.status === 'idle') {
      view(restoreEyes);
      restoreEyes = null;
    }
    return started;
  }
  function resumeStroll() {
    if (stroll.state.status !== 'paused' || activeCave?.id !== stroll.state.id) return false;
    keys.clear();
    haltStrollLeg();
    if (!eyes) {
      restoreEyes = eyes;
      view(true);
    }
    return stroll.resume();
  }
  function takeOverStroll() {
    // After the last chapter, movement returns the room to proximity stories.
    if (stroll.state.status === 'complete') {
      restoreEyes = null;
      stroll.stop();
    } else {
      stroll.pause();
    }
  }
  function setStrollInput(forward = 0, side = 0) {
    const f=Number.isFinite(forward)?clamp(forward,-1,1):0;
    const s=Number.isFinite(side)?clamp(side,-1,1):0;
    if (paused || !activeCave?.stroll || Math.hypot(f,s) < .09) {
      thumbForward=thumbSide=0;
      return;
    }
    if (!thumbForward && !thumbSide) {
      takeOverStroll();
      cancelArrival();
      walker.stop();
      autoFace=false;destination=null;events.onJourney?.(null);
    }
    thumbForward=f;thumbSide=s;invalidate();
  }
  function nearestDetail(c,p){
    let best=-1,score=Infinity;
    const eyeHeight=1.62+elevationAt(p);
    const forwardX=Math.sin(yaw)*Math.cos(pitch),forwardY=Math.sin(pitch),forwardZ=-Math.cos(yaw)*Math.cos(pitch);
    for(const [i,d] of c.details.entries()){
      const target=toWorld(c,d.stand[0],0,d.stand[1]),art=toWorld(c,...displayAnchor(c,i));
      const away=Math.hypot(target.x-p.x,target.z-p.z);
      const surfaceDistance=Math.hypot(art.x-p.x,art.z-p.z);
      const nearSurface=art.y<3.15?surfaceDistance+.35:Infinity;
      // Crossing behind a statue can put the visitor close to its face in
      // plan but on the opposite side of the altar. Walks with a curator's
      // route use the accessible observation places on their own side.
      const gap=c.stroll?away:Math.min(away,nearSurface);
      const continuing=i===activeDetail&&c===activeCave;
      const wish=requestedDetail?.c===c.id&&requestedDetail.index===i;
      // A ceiling and a figure can share a small viewing bay. At comparable
      // distances, read the detail the visitor has actually turned to face.
      const dx=art.x-p.x,dy=art.y-eyeHeight,dz=art.z-p.z;
      const sight=(dx*forwardX+dy*forwardY+dz*forwardZ)/Math.max(.001,Math.hypot(dx,dy,dz));
      const value=gap+.27*(1-sight)-(wish?.9:continuing?.12:0);
      const radius=c.stroll?(d.radius??(c.ground?2.6:1.95)):1.55;
      if (gap >= radius + (continuing ? .60 : 0) || value >= score) continue;
      if (c.stroll && !floor.clear(p,target)) continue;
      score=value;best=i;
    }
    return best;
  }
  function updateZone(){
    const p=walker.state,c=caveAt(p),apron=wingAt(p);
    const index=c?.hallIndex??apron?.plan.index??roomAt(p);
    if(zone!==index){zone=index;near=null;events.onZone?.(index);events.onNear?.(null);}
    if(c!==activeCave||activeTerrace!==(apron?.plan.index??-1)){
      if (stroll.state.id && stroll.state.id !== c?.id) stroll.stop();
      if (activeCave !== c) thumbForward=thumbSide=0;
      storyGate.reset();
      activeCave=c;activeDetail=-1;activeTerrace=apron?.plan.index??-1;
      events.onCave?.(c,activeTerrace);lastCueFrame=0;
    }
    if(c){
      const tour = stroll.state;
      let next = nearestDetail(c,p);
      if (c.stroll) {
        if (tour.id === c.id && tour.status === 'reading') next = tour.detailIndex;
        else if (tour.id === c.id && tour.status === 'walking' && next !== activeDetail) next = -1;
        next = storyGate.select(activeDetail, next, performance.now());
      }
      if(next!==activeDetail){activeDetail=next;events.onCaveDetail?.(c,next);lastCueFrame=0;}
    }
    let found=null,range=3.85;
    if(zone>=0&&!c&&!apron){
      const art=getArt(rooms[zone]);art.approach?.(p.x,p.z);
      for(const s of art.stations){const d=Math.hypot(p.x-s.x,p.z-s.z);if(d<range){found=s;range=d;}}
    }
    if(!paused)focusOriginal(c ? rockWorld.printAt(c,activeDetail) : found && rooms[zone]?.art?.prints.get(found.index));
    if(near!==found){near=found;events.onNear?.(near);}
    warmRooms(p);rockWorld.warm(p,zone,activeCave);
  }
  function cameraArm(p,angle,tilt){
    const {x,z}=p,s=Math.sin(angle),c=Math.cos(angle);
    let length=eyes?0:arm;
    // Pull the camera inside an open doorway or wall before it would clip into the neighbouring wing.
    if(length&&!floor.clear({x,z},{x:x-s*length,z:z+c*length})){
      let low=0,high=length;for(let j=0;j<9;j++){
        const mid=(low+high)/2;if(floor.clear({x,z},{x:x-s*mid,z:z+c*mid}))low=mid;else high=mid;
      }
      length=Math.max(0,low-.06);
    }
    // When looking up just inside a door, a follow camera outside its lintel
    // sees solid rock above the opening. Bring it through the door with the gaze.
    if(activeCave&&length&&tilt>.12){
      const intoRoom=(x-activeCave.mouth.x)*activeCave.side;
      const outward=activeCave.side*s;
      if(outward>.01){
        const inside=Math.max(0,(intoRoom-.25)/outward);
        length=THREE.MathUtils.lerp(length,Math.min(length,inside),THREE.MathUtils.smoothstep(tilt,.12,.52));
      }
    }
    return length;
  }
  function updateCamera(dt){
    const {x,z}=walker.state,s=Math.sin(yaw),c=Math.cos(yaw);
    const ground=elevationAt(walker.state);
    const height=ground+(eyes?1.62:1.23),length=cameraArm(walker.state,yaw,pitch);
    desiredCamera.set(x-s*length,ground+(eyes?1.62:1.60+.071*length),z+c*length);
    const forward=eyes?4.6:2.45;
    target.set(x+s*forward,height+Math.tan(pitch)*(forward+length),z-c*forward);
    const a=snapCamera||eyes?1:1-Math.exp(-dt*18);
    // A tight corner can put yesterday's camera behind a wall; clamp immediately on shortening.
    if(!snapCamera&&!floor.clear({x,z},{x:camera.position.x,z:camera.position.z}))camera.position.copy(desiredCamera);
    camera.position.lerp(desiredCamera,a);softTarget.lerp(target,a);camera.lookAt(softTarget);snapCamera=false;
    const cameraGap=Math.hypot(camera.position.x-x,camera.position.z-z);
    const clearance=activeCave?1.48:.49;
    const showVisitor=!eyes&&cameraGap>clearance+(visitor.root.visible?0:.14);
    if(visitor.root.visible!==showVisitor){visitor.setVisible(showVisitor);}
    positionSun(x,z);
    daylight.update(x,z,dt);
  }
  function place(p,angle){
    stroll.stop();stop();walker.reset(p.x,p.z,-angle);yaw=angle;pitch=.016;snapCamera=true;
    bodyPose();visitor.reset();warmRooms(walker.state,true);updateZone();updateCamera(1);invalidate();
    events.onPosition?.({...walker.state},yaw,true);
  }
  function enter(index=0){
    const plan=plans[index];
    if(index===0){
      const outer=plan.centerX-plan.halfWidth;
      place({x:outer+2.2,z:.48},-1.54);return;
    }
    place(threshold(plan,2.6),plan.side*(Math.PI/2-.095));
  }
  function visit(index,number){
    const s=getArt(rooms[index]).stations[number];if(!s)return;
    const p=floor.snap({x:s.x,z:s.z+s.inwardZ*3.05});place(p,Math.atan2(s.x-p.x,p.z-s.z));
  }
  function walkTo(point,room=null,manual=false){
    if (manual) takeOverStroll(); else stroll.stop();
    thumbForward=thumbSide=0;cancelArrival();keys.clear();const goal=walker.go(point);if(!goal)return false;
    autoFace=true;destination=room;marker.visible=true;marker.position.set(goal.x,elevationAt(goal)+.023,goal.z);
    events.onJourney?.(room);invalidate();return true;
  }
  function walkVisit(index,number,arrive,cancel){
    const s=getArt(rooms[index]).stations[number];
    if(!s)return false;
    const goal=floor.snap({x:s.x,z:s.z+s.inwardZ*2.85});
    if(!walkTo(goal))return false;
    arrival={goal,face:Math.atan2(s.x-goal.x,goal.z-s.z),arrive,cancel};return true;
  }
  function lookAtDetail(c,index){
    const detail=c.details[index];if(!detail)return;
    const anchor=toWorld(c,...displayAnchor(c,index)),p=walker.state;
    finalYaw=Math.atan2(anchor.x-p.x,p.z-anchor.z);
    const dist=Math.hypot(anchor.x-p.x,anchor.z-p.z);
    const aboveGround=anchor.y-elevationAt(p);
    let tilt=Math.atan2(aboveGround-1.62,Math.max(.15,dist));
    for(let i=0;i<2;i++){
      const length=cameraArm(p,finalYaw,tilt),height=eyes?1.62:1.60+.071*length;
      tilt=Math.atan((aboveGround-height)/(Math.max(.15,dist)+length)+(eyes?0:(height-1.23)/(2.45+length)));
    }
    finalPitch=clamp(tilt,-1.1,1.55);
    storyGate.reset();requestedDetail={c:c.id,index};activeDetail=index;events.onCaveDetail?.(c,index);invalidate();
  }
  function walkCave(id,index=0,arrive,cancel){
    const c=caveById.get(id),detail=c?.details[index];if(!detail)return false;
    rockWorld.prepare(c);
    const ground=toWorld(c,detail.stand[0],0,detail.stand[1]),goal=floor.snap(ground);
    if(!walkTo(goal))return false;
    requestedDetail={c:id,index};
    arrival={goal,face:Math.atan2(c.mouth.x-goal.x,goal.z-c.mouth.z),arrive:()=>{
      lookAtDetail(c,index);arrive?.();
    },cancel};return true;
  }
  function enterCave(id,index=0){
    const c=caveById.get(id),detail=c?.details[index];if(!detail)return;
    const target=toWorld(c,...displayAnchor(c,index)),stand=toWorld(c,detail.stand[0],0,detail.stand[1]);
    rockWorld.prepare(c);place(stand,Math.atan2(target.x-stand.x,stand.z-target.z));lookAtDetail(c,index);
  }
  function leaveCave(arrive,cancel){
    const c=activeCave;
    const wing=c?wings[c.hallIndex]:wings[activeTerrace];if(!wing)return false;
    const gate=wing.gates.reduce((best,g)=>Math.abs(g.z-walker.state.z)<Math.abs(best.z-walker.state.z)?g:best);
    const goal=floor.snap({x:wing.outer-wing.plan.side*2.5,z:gate.z});
    if(!walkTo(goal))return false;
    arrival={goal,face:-wing.plan.side*Math.PI/2,arrive,cancel};return true;
  }
  function walkInto(index){
    const p=plans[index];if(p)return walkTo(threshold(p,2.9),index);
    return walkTo({x:0,z:walker.state.z},-1);
  }
  function view(value){eyes=!!value;snapCamera=true;visitor.setVisible(!eyes);resize();events.onView?.(eyes);}
  function tick(now){
    if(stopped)return;frame=requestAnimationFrame(tick);
    const dt=clamp((now-previous)/1000,0,MAX_FRAME_SECONDS);previous=now;
    if(paused||document.hidden){lastActorFrame=now;return;}
    stroll.tick(dt, walker.moving());
    if(keys.size||thumbForward||thumbSide||walker.moving()||drag)invalidate();
    if(now>dirtyUntil&&!visitor.isSettling()&&!guests.settling()){
      if(!(visitor.root.visible||guests.nearby())||now-lastActorFrame<48)return;
    }
    const actorDt=clamp((now-lastActorFrame)/1000,0,MAX_FRAME_SECONDS);lastActorFrame=now;
    const forward=thumbForward+Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));
    const side=thumbSide+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    const input=forward||side?{x:Math.sin(yaw)*forward+Math.cos(yaw)*side,z:-Math.cos(yaw)*forward+Math.sin(yaw)*side}:null;
    const pressure=(thumbForward||thumbSide)&&!keys.size?Math.min(1,Math.hypot(forward,side)):1;
    const motion=walker.step(dt,input,pressure);
    if(autoFace&&!drag){
      let heading=-walker.state.heading;
      if (stroll.state.status === 'walking' && activeCave?.id === stroll.state.id) {
        // Keep the path in sight while allowing the next sculpture to enter
        // the frame during the approach. The final gaze settles at the stop.
        const anchor=toWorld(activeCave,...displayAnchor(activeCave,stroll.state.detailIndex)), p=walker.state;
        const dx=anchor.x-p.x,dz=p.z-anchor.z, distance=Math.hypot(dx,dz);
        const difference=angleDiff(Math.atan2(dx,dz),heading);
        const visible=!stroll.state.returning&&Math.abs(difference)<1.20;
        if(visible) heading+=difference*.22;
        const ahead=visible?clamp(Math.atan2(anchor.y-elevationAt(p)-1.62,distance)*.50,-.15,.32):.015;
        pitch+=(ahead-pitch)*(1-Math.exp(-dt*2.2));
      }
      yaw+=clamp(angleDiff(heading,yaw)*(1-Math.exp(-dt*3.2)),-dt*1.55,dt*1.55);
    }
    if(!walker.hasPath()&&(destination!==null||autoFace)&&!walker.moving()){autoFace=false;destination=null;events.onJourney?.(null);}
    if(arrival&&!walker.moving()){
      const record=arrival;arrival=null;
      if(Math.hypot(walker.state.x-record.goal.x,walker.state.z-record.goal.z)<.22){
        finalYaw=record.face;record.arrive?.();
      }else record.cancel?.();
    }
    if(finalYaw!=null&&!drag){
      const remaining=angleDiff(finalYaw,yaw);
      yaw+=clamp(remaining*(1-Math.exp(-dt*4.4)),-dt*1.7,dt*1.7);if(Math.abs(remaining)<.009)finalYaw=null;else invalidate();
    }
    marker.visible=walker.hasPath()&&stroll.state.status!=='walking';bodyPose();
    // Network sends have their own cadence; supply the current walking pose
    // rather than the map's slower update (which otherwise duplicates/skips steps).
    if(motion.distance>0||motion.turnDelta!==0)events.onVisitorPose?.(walker.state);
    const attention=guests.update(actorDt,walker.state)??artAttention(walker.state);
    visitor.update({...motion,dt:actorDt,attention});updateZone();updateCamera(dt);renderer.render(scene,camera);
    if(finalPitch!=null&&!drag){
      const delta=finalPitch-pitch;pitch+=delta*(1-Math.exp(-dt*5.3));
      if(Math.abs(delta)<.006)finalPitch=null;else invalidate();
    }
    if(activeCave&&(now-lastCueFrame>155||lastCueFrame===0)){
      events.onCaveMarkers?.(rockWorld.project(activeCave,camera,activeDetail));lastCueFrame=now;
    }
    if(now-lastMap>95){events.onPosition?.({...walker.state},yaw);lastMap=now;}
  }
  const movement=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
  function down(e){
    if(paused||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('dialog,input,textarea,select,[contenteditable=true]'))return;
    const k=e.key.toLowerCase();
    if(movement.includes(k)){takeOverStroll();cancelArrival();e.preventDefault();if(!keys.size){autoFace=false;destination=null;events.onJourney?.(null);}keys.add(k);invalidate();}
    else if(!e.repeat&&k==='v'){stroll.pause();restoreEyes=null;view(!eyes);}
    else if(!e.repeat&&k==='f'&&activeCave){if(activeDetail>=0)lookAtDetail(activeCave,activeDetail);}
    else if(!e.repeat&&k==='f'&&near){stop();events.onSelect?.(near);}
    else if(k==='escape')stop();
  }
  function aim(e){
    const r=canvas.getBoundingClientRect();pointer.set(2*(e.clientX-r.left)/r.width-1,1-2*(e.clientY-r.top)/r.height);ray.setFromCamera(pointer,camera);
  }
  function tap(e){
    aim(e);
    const inspect=[];const walls=[atrium.group];
    for(const room of rooms)if(room.group.visible){inspect.push(...room.art.targets);walls.push(room.structure);}
    inspect.push(...signMap.keys(),...rockWorld.signs);walls.push(...rockWorld.rayObjects());
    const selected=ray.intersectObjects(inspect,false)[0];
    const cover=ray.intersectObjects(walls,true).find(h=>h.object.isMesh&&h.object.material.visible!==false);
    if(selected&&(!cover||selected.distance<=cover.distance+.13)){
      if(selected.object.userData.caveDoor){events.onCaveDoor?.(selected.object.userData.caveDoor);return;}
      if(signMap.has(selected.object)){walkInto(signMap.get(selected.object));return;}
      if(selected.object.userData.manuscriptId){stop();events.onManuscript?.(selected.object.userData.manuscriptId);return;}
      const s=selected.object.userData.exhibit;
      if(s){stop();events.onSelect?.(s);return;}
    }
    if(activeCave&&cover){
      const index=rockWorld.detailAtSurface(activeCave,cover);
      if(index>=0){events.onCaveDoor?.(activeCave.id,index);return;}
    }
    // A stair tread may be several metres above the gallery floor. Use
    // the visible tread that the user touched and the same navigable profile
    // as the feet and lens; the y=0 floor plane lies behind the rock there.
    if (cover && activeCave?.ground && caveAt(cover.point) === activeCave &&
        Math.abs(cover.point.y-elevationAt(cover.point)) < .18 && cover.face &&
        Math.abs(cover.face.normal.clone().transformDirection(cover.object.matrixWorld).y) > .58 &&
        floor.free(cover.point)) {
      walkTo(cover.point,null,true);return;
    }
    if(ray.ray.direction.y<-.018&&ray.ray.intersectPlane(floorPlane,hitPoint)){
      const d=ray.ray.origin.distanceTo(hitPoint);
      if((!cover||d<=cover.distance+.24)&&floor.free(hitPoint))walkTo(hitPoint,null,true);
    }
  }
  function pointerDown(e){
    if(paused||e.button!==0||drag)return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:0};canvas.style.cursor='grabbing';
  }
  function pointerMove(e){
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    drag.moved=Math.max(drag.moved,Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY));
    if(drag.moved>=5){takeOverStroll();finalYaw=null;finalPitch=null;requestedDetail=null;if(autoFace)autoFace=false;yaw-=dx*.0043;pitch=clamp(pitch+dy*.0032,activeCave?-1.10:-.60,activeCave?1.55:.80);}
    drag.x=e.clientX;drag.y=e.clientY;invalidate();
  }
  function pointerUp(e){
    if(!drag||drag.id!==e.pointerId)return;const short=drag.moved<6;drag=null;canvas.style.cursor='grab';
    if(short&&!paused)tap(e);
  }
  function wheel(e){if(paused)return;e.preventDefault();if(!eyes){arm=clamp(arm+e.deltaY*.0025,2.0,5.3);invalidate();}}
  function suspendWindow() {
    keys.clear();thumbForward=thumbSide=0;
    if (stroll.state.status !== 'walking' && stroll.state.status !== 'reading') stop();
    previous=performance.now();
  }
  const listeners=[[window,'keydown',down],[window,'keyup',e=>keys.delete(e.key.toLowerCase())],[window,'blur',suspendWindow],
    [document,'visibilitychange',suspendWindow],[canvas,'pointerdown',pointerDown],[canvas,'pointermove',pointerMove],
    [canvas,'pointerup',pointerUp],[canvas,'pointercancel',()=>{drag=null;canvas.style.cursor='grab';}],[canvas,'wheel',wheel]];
  listeners.forEach(([node,type,fn])=>node.addEventListener(type,fn,{passive:false}));
  const initialCave=events.initialCave;
  if(initialCave){
    enterCave(initialCave.id,events.initialDetail);
    pitch=finalPitch??pitch;finalPitch=null;snapCamera=true;updateCamera(1);
  }else if(events.startingPose){
    place(events.startingPose,-events.startingPose.heading);
  }else enter(0);
  frame=requestAnimationFrame(tick);
  // The atrium does not need a cave scan. Wait only for the actual opening view.
  Promise.all([visitor.ready,initialCave?rockWorld.prepare(initialCave):true]).then(async ([person,cave])=>{
    await whenLoaded();
    if(!person||cave===false||initialAssetError)throw Error('首景素材未载齐');
    if(stopped)return;
    firstView=false;invalidate();events.onLoadProgress?.('frame');
    await new Promise(requestAnimationFrame);
    if(stopped)return;
    renderer.render(scene,camera);
    await new Promise(requestAnimationFrame);
    if(!stopped)events.onReady?.();
  }).catch(()=>{if(!stopped)events.onInitialError?.();});
  return {setPresence:guests.accept,setLens(v){if(observationLens!==v){observationLens=v;resize();}},setExperience:rockWorld.setExperience,enter,visit,walkVisit,walkInto,walkCave,enterCave,leaveCave,lookAtDetail:(i)=>{if(activeCave)lookAtDetail(activeCave,i);},stop,setView(value){
      if(stroll.state.id&&!!value!==eyes){stroll.pause();restoreEyes=null;}
      view(value);
    },setAppearance:id=>visitor.setAppearance(id),getAppearance:()=>visitor.getAppearance(),
    startStroll, setStrollInput, pauseStroll:stroll.pause, resumeStroll,
    stopStroll(){thumbForward=thumbSide=0;return stroll.stop();}, getStroll:stroll.snapshot,
    setPaused(value){paused=!!value;if(paused){thumbForward=thumbSide=0;focusOriginal(null);}if(paused&&stroll.state.status!=='walking'&&stroll.state.status!=='reading')stop();previous=performance.now();invalidate();},
    destroy(){stroll.stop();stopped=true;cancelAnimationFrame(frame);observer.disconnect();listeners.forEach(([n,t,f])=>n.removeEventListener(t,f));
      focusOriginal(null);
      for(const room of rooms)room.art?.close?.();
      rockWorld.destroy();guests.dispose();visitor.dispose();const geometry=new Set(),materials=new Set(),maps=new Set(Object.values(textures));
      scene.traverse(o=>{if(!o.isMesh)return;geometry.add(o.geometry);for(const m of [].concat(o.material)){materials.add(m);for(const item of Object.values(m))if(item?.isTexture)maps.add(item);}});
      geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());sun.shadow.dispose();renderer.dispose();canvas.remove();}
  };
}
