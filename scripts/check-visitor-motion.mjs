// Exercise the shipped rig, capture and both mesh resolutions without a GPU.
// Read geometry, skin weights and joints. Surface materials need a browser.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import {gunzipSync} from 'node:zlib';
import {VISITORS} from '../visitor-roster.js';
import {makeWalker} from '../walking.js';

const root=new URL('../',import.meta.url);
registerHooks({resolve(specifier,context,next){
  if(specifier==='three')return {url:new URL('real-viewer/vendor/three.module.min.js',root).href,shortCircuit:true};
  return next(specifier,context);
}});
const motionURL=new URL('assets/visitors-whole/motions/cmu-poses.bin',root);
const originalFetch=globalThis.fetch;
globalThis.fetch=(url,...options)=>url instanceof URL&&url.href===motionURL.href
  ?readFile(url).then(bytes=>new Response(bytes)):originalFetch(url,...options);
const {makeWholeMotion}=await import('../whole-motion.js');
globalThis.fetch=originalFetch;
const THREE=await import('three');
const {GLTFLoader}=await import('../real-viewer/vendor/addons/loaders/GLTFLoader.js');
const loader=new GLTFLoader().register(()=>({name:'motion-test-material',loadMaterial:async()=>new THREE.MeshStandardMaterial()}));
const flat={snap:p=>({...p}),route:(_,p)=>[p],slide:(p,x,z)=>({x:p.x+x,z:p.z+z})};

async function readMesh(path,compressed){
  const bytes=await readFile(new URL(path,root));
  const glb=compressed?gunzipSync(bytes):bytes;
  const {scene}=await loader.parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
  scene.rotation.y=Math.PI;
  return scene;
}

for(const visitor of VISITORS){
  const rootGroup=new THREE.Group(),walker=makeWalker(flat),dt=1/60;
  const forward={x:0,z:-1},left={x:-1,z:0},right={x:1,z:0};
  const bodies=await Promise.all([readMesh(visitor.walkingBody,true),readMesh(visitor.detailBody,false)]);
  for(const body of bodies){
    rootGroup.add(body);
    rootGroup.position.set(0,0,0);rootGroup.rotation.y=0;rootGroup.updateMatrixWorld(true);
    walker.reset(0,0,0);
    const rig=makeWholeMotion(body,{id:visitor.id});
    const feet=['LeftFoot','RightFoot'].map(name=>body.getObjectByName(name));
    const footPositions=()=>feet.map(bone=>bone.getWorldPosition(new THREE.Vector3()));
    function advance(seconds,input,pace=1,observe){
      for(let i=0;i<Math.round(seconds/dt);i++){
        const before=footPositions(),wasBraking=rig.captureState().stopping;
        walker.step(dt,input,pace);
        rootGroup.position.set(walker.state.x,0,walker.state.z);
        rootGroup.rotation.y=walker.state.heading;rootGroup.updateMatrixWorld(true);
        rig.update({dt});
        const after=footPositions(),state=rig.captureState();
        observe?.({after,state,wasBraking,travel:Math.max(...after.map((p,side)=>p.distanceTo(before[side])))});
      }
    }

    advance(.3,null);advance(3.14,forward);advance(1.4,null);advance(2.35,left);
    let pivots=0;
    advance(1.8,right,1,({wasBraking,state,travel})=>{
      if(!wasBraking||state.stopping||state.turnWeight<=0)return;
      assert(travel<.055,visitor.id+' changed foot location abruptly while turning');
      pivots++;
    });
    assert(pivots>0,'direction reversal did not exercise brake-to-pivot transition');
    advance(.87,right);advance(1.65,null);advance(.11,right);
    let tapPeak=0;
    advance(1.3,null,1,({travel})=>{tapPeak=Math.max(tapPeak,travel);});
    assert(tapPeak<.035,visitor.id+' kicked a foot forward after releasing a short tap');
    assert.equal(rig.isSettling(),false,'idle pose never settled');

    advance(3,right);
    for(const pace of [.42,.22]){
      advance(1,right,pace);
      const offsets=[],supports=new Set();
      advance(3,right,pace,({after,state})=>{
        offsets.push(after[0].x-after[1].x);
        const [l,r]=state.feet.map(f=>f.held);
        if(l!==r)supports.add(l?'left':'right');
      });
      assert.equal(supports.size,2,'slow walk did not alternate single-foot support');
      assert(Math.max(...offsets)-Math.min(...offsets)>.2,'feet stayed still during slow forward travel');
    }
    rootGroup.remove(body);
  }

  // Local and remote visitors can both switch mesh while a foot carries load.
  const [far,near]=await Promise.all([readMesh(visitor.walkingBody,true),readMesh(visitor.detailBody,false)]);
  const atOrigin=()=>{rootGroup.position.set(0,0,0);rootGroup.rotation.y=0;rootGroup.updateMatrixWorld(true);};
  rootGroup.add(far,near);atOrigin();walker.reset(0,0,0);
  const outgoing=makeWholeMotion(far,{id:visitor.id}),incoming=makeWholeMotion(near,{id:visitor.id});
  for(let frame=0;frame<150;frame++){
    walker.step(dt,frame<126?forward:null);
    rootGroup.position.set(walker.state.x,0,walker.state.z);rootGroup.updateMatrixWorld(true);
    outgoing.update({dt});
    if(outgoing.captureState().stopBlend>.2)break;
  }
  const before=outgoing.captureState();
  assert(before.stopBlend>0&&before.stopBlend<1,'LOD scenario missed the braking blend');
  incoming.restoreState(before);
  const after=incoming.captureState();
  for(const key of ['phase','stopTime','stopBlend','stopping','turnWeight','walkWeight'])assert.equal(after[key],before[key],key);
  for(const side of ['LeftFoot','RightFoot']){
    const oldFoot=far.getObjectByName(side).getWorldPosition(new THREE.Vector3());
    const newFoot=near.getObjectByName(side).getWorldPosition(new THREE.Vector3());
    assert(oldFoot.distanceTo(newFoot)<.035,'switching mesh displaced the foot');
  }
  console.log(visitor.label+'：短按、折返、慢行交替承重、收步和行进中切换精度通过。');
}
