// Replay a deterministic, sampled straight in two viewports of one renderer.
// This is an inspection tool: scrubbing never advances the live museum room.
import * as T from 'three';
import {acquireVisitorFigure} from './visitor-model.js';
import {makeWholeMotion} from './whole-motion.js';
import {VISITORS} from './visitor-roster.js';
import {portraitLight} from './portrait-light.js';
const $=s=>document.querySelector(s),canvas=$('canvas'),stage=$('#stage'),play=$('#play'),time=$('#time');
async function study(){
  const response=await fetch('./assets/visitors-fitted/motion-study/kana-native.json');if(!response.ok)throw Error('clip');
  const clip=await response.json(),spec=VISITORS.find(v=>v.id==='qing');
  const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  const scene=new T.Scene(),lights=portraitLight(scene,renderer);lights.focus('full');renderer.setScissorTest(true);
  const camera=new T.PerspectiveCamera(25,1,.05,20),road=new T.Group();scene.add(road);
  const floor=new T.Mesh(new T.PlaneGeometry(80,80).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0xbcb5a4,roughness:.98}));floor.receiveShadow=true;scene.add(floor);
  const grid=new T.GridHelper(20,40,0xa49d8c,0xa49d8c);grid.position.y=.001;road.add(grid);
  const leases=await Promise.all([acquireVisitorFigure(spec),acquireVisitorFigure(spec)]);
  const [live,native]=leases.map(l=>l.figure);const worldA=new T.Group(),worldB=new T.Group();
  worldA.add(live);worldB.add(native);scene.add(worldA,worldB);scene.updateMatrixWorld(true);
  const rig=makeWholeMotion(live,{id:spec.id}),tKey=Array.from({length:clip.count},(_,i)=>i*clip.duration/(clip.count-1));
  const track=(type,name,values,n)=>new type(name,values.length===n?[0]:tKey,values);
  const spin=clip.tracks.map(({bone,q})=>track(T.QuaternionKeyframeTrack,bone+'.quaternion',q,4));
  spin.push(track(T.VectorKeyframeTrack,'Hips.position',clip.hip,3));const mixer=new T.AnimationMixer(native);mixer.clipAction(new T.AnimationClip('Kana · 原角色步行',clip.duration,spin)).play();
  const joints=[];live.traverse(o=>{if(o.isBone)joints.push(o);});
  const fps=60,speed=clip.travel/clip.duration,poses=[],hip=live.getObjectByName('Hips'),point=new T.Vector3(),shoes=[];
  native.traverse(m=>{if(m.isSkinnedMesh&&/shoe/i.test(m.material.name)){const indices=new Set(m.geometry.index.array);shoes.push([m,[...indices]]);}});
  if(shoes.length!==2)throw Error('footwear');
  function soleY(){let min=Infinity;native.updateWorldMatrix(true,true);
    for(const [m,indices] of shoes)for(const i of indices)min=Math.min(min,m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld).y);
    return min;}
  const soleTable=tKey.map(t=>{mixer.setTime(t);return soleY();});
  // Warm up through the actual start transition. Capture six seconds of
  // steady poses. Interpolation preserves the original update at 60 Hz.
  for(let i=0;i<=fps*8;i++){
    worldA.position.z=-speed*i/fps;worldA.updateMatrixWorld(true);rig.update({dt:1/fps});
    if(i>=fps*2)poses.push({h:hip.position.clone(),q:joints.map(j=>j.quaternion.clone()),phase:rig.captureState().phase});
  }
  worldA.position.z=0;const duration=(poses.length-1)/fps;
  // Find left heel strike in the native clip by the heel's forward excursion
  // relative to the hip. Align the first cycle only, then keep each true pace.
  const foot=native.getObjectByName('LeftFoot'),hips=native.getObjectByName('Hips');let heel=0,reach=-Infinity;
  for(let i=0;i<tKey.length-1;i++){mixer.setTime(tKey[i]);native.updateWorldMatrix(true,true);const d=foot.getWorldPosition(point).z-hips.getWorldPosition(new T.Vector3()).z;if(-d>reach){heel=tKey[i];reach=-d;}}
  let cursor=0,yaw=Math.PI/2,isPlaying=!matchMedia('(prefers-reduced-motion: reduce)').matches,slow=false,last=0;
  function controls(){play.textContent=isPlaying?'暂停':'播放';play.setAttribute('aria-pressed',String(isPlaying));}
  play.onclick=()=>{isPlaying=!isPlaying;if(cursor>=duration)cursor=0;controls();};
  $('#slow').onclick=e=>{slow=!slow;e.target.setAttribute('aria-pressed',String(slow));};
  for(const btn of document.querySelectorAll('[data-yaw]'))btn.onclick=()=>{yaw=Number(btn.dataset.yaw)*Math.PI/180;document.querySelectorAll('[data-yaw]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));};
  time.oninput=()=>{isPlaying=false;cursor=duration*Number(time.value)/1000;controls();};
  function render(now){
    if(isPlaying&&last&&!document.hidden){cursor+=Math.min(.10,(now-last)/1000)*(slow?.5:1);if(cursor>duration)cursor%=duration;}
    last=now;
    const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h){requestAnimationFrame(render);return;}
    if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
    const frame=cursor*fps,i=Math.min(poses.length-2,Math.floor(frame)),mix=frame-i,a=poses[i],b=poses[i+1];
    hip.position.lerpVectors(a.h,b.h,mix);joints.forEach((j,k)=>j.quaternion.slerpQuaternions(a.q[k],b.q[k],mix));
    const t=(cursor+heel+poses[0].phase*clip.duration)%clip.duration;mixer.setTime(t);
    const ix=t/clip.duration*(clip.count-1),k=Math.floor(ix);worldB.position.y=-T.MathUtils.lerp(soleTable[k],soleTable[k+1],ix-k);
    road.position.z=(cursor*speed)%.5;
    for(let side=0;side<2;side++){worldA.visible=side===0;worldB.visible=side===1;
      const left=Math.floor(side*w/2),width=Math.floor((side+1)*w/2)-left;camera.aspect=width/h;
      const radius=Math.max(4.5,.65/Math.max(.1,camera.aspect*Math.tan(camera.fov*Math.PI/360)));
      camera.position.set(Math.sin(yaw)*radius,1.06,-Math.cos(yaw)*radius);camera.lookAt(0,.83,0);camera.updateProjectionMatrix();
      renderer.setViewport(left,0,width,h);renderer.setScissor(left,0,width,h);renderer.render(scene,camera);}
    time.value=String(Math.round(cursor/duration*1000));requestAnimationFrame(render);
  }
  document.querySelectorAll('button,input').forEach(el=>el.disabled=false);controls();$('#status').textContent='';requestAnimationFrame(render);
}
study().catch(e=>{console.error(e);$('#status').textContent='三维对照未能载入，请刷新或使用支持 WebGL 的浏览器。';});
