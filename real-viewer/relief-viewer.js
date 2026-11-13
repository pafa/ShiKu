import * as THREE from 'three';
import {OrbitControls} from './vendor/addons/controls/OrbitControls.js';
import {loadMetRelief} from '../met-relief.js';

const select=id=>document.getElementById(id);
const host=select('stage'),photo=select('photo'),status=select('status'),ref=select('reference');
const controlsBar=['front','angle','in','out','switch'].map(select);
const query=new URLSearchParams(location.search);
const aligned=query.get('reference')==='met';
document.body.dataset.embedded=String(query.get('embed')==='1');
document.body.dataset.registered=String(aligned);
const photographCamera={
  eye:[-0.01396900537601725,-0.030930936765592172,5.466838050961176],
  target:[0.002223200463224462,0.01809557638230476,0.0],
  up:[0.008081646167305029,0.9999269194035647,0.008991265056899515],
  fov:33.0,
};
let camera,renderer,orbit,scene,model,observer,animation=0,photoMode=false,disposed=false;
function draw(){
  if(disposed||animation||photoMode)return;
  animation=requestAnimationFrame(()=>{animation=0;if(!disposed&&renderer)renderer.render(scene,camera)});
}
function placePhotographCamera(){
  if(!model)return;
  // Registration used the complete published mesh coordinates. Transfer exactly
  // the same centring and uniform scale that this viewer applies to that mesh.
  const origin=new THREE.Vector3(...model.userData.rawOrigin);
  const convert=point=>new THREE.Vector3(...point).sub(origin).multiplyScalar(model.scale.x);
  camera.position.copy(convert(photographCamera.eye));
  camera.up.fromArray(photographCamera.up);
  camera.fov=photographCamera.fov;
  camera.lookAt(convert(photographCamera.target));camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  orbit.enabled=false;draw();
}
function distanceToFit(){
  const halfAngle=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
  return Math.max(1.042/halfAngle,1.970/(halfAngle*camera.aspect))*1.14+.19;
}
function pose(angle=0){
  const distance=distanceToFit();
  orbit.target.set(0,0,.005);
  camera.position.set(distance*Math.sin(angle),angle ? .13*distance : 0,distance*Math.cos(angle));
  orbit.update();draw();
}
function zoom(factor){
  const offset=camera.position.clone().sub(orbit.target);
  const distance=THREE.MathUtils.clamp(offset.length()*factor,orbit.minDistance,orbit.maxDistance);
  camera.position.copy(orbit.target).add(offset.setLength(distance));orbit.update();draw();
}
function togglePhoto(value){
  photoMode=value;photo.hidden=!value;ref.hidden=!value;host.hidden=value;
  select('switch').textContent=value?'查看扫描':'馆藏照片';select('switch').setAttribute('aria-pressed',String(value));
  controlsBar.slice(0,-1).forEach(b=>b.disabled=value);
  select('help').textContent=value?'大都会艺术博物馆 · 35.146':'拖动旋转 · 滚轮或双指缩放';
  if(!value)resize(false);
}
function resize(reset=true){
  const width=host.clientWidth,height=host.clientHeight;
  if(!renderer||!width||!height)return;
  const aspect=width/height;
  const changed=Math.abs(camera.aspect-aspect)>.025;
  camera.aspect=aspect;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
  if(aligned)placePhotographCamera();
  else if(reset&&changed&&model)pose();
  draw();
}
function cleanup(){
  disposed=true;observer?.disconnect();if(animation)cancelAnimationFrame(animation);
  orbit?.dispose();const freed=new Set();
  model?.traverse(o=>{if(o.geometry)freed.add(o.geometry);for(const m of [].concat(o.material||[])){for(const x of Object.values(m))if(x?.isTexture)freed.add(x);freed.add(m)}});
  for(const v of freed)v.dispose();renderer?.dispose();
}
window.addEventListener('pagehide',cleanup,{once:true});
try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.setClearColor(0x272b27,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','孝文帝礼佛图。拖动或用方向键转动，用加减键缩放。');host.append(canvas);
  scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff8ea,0xb8afa1,.28));
  const key=new THREE.DirectionalLight(0xfff8e8,4.2);
  key.position.set(.75,.70,.80);scene.add(key);
  camera=new THREE.PerspectiveCamera(39,1,.025,65);camera.position.set(0,0,5);
  orbit=new OrbitControls(camera,canvas);orbit.enablePan=true;orbit.enableDamping=false;
  orbit.minDistance=.32;orbit.maxDistance=19;orbit.minAzimuthAngle=-1.37;orbit.maxAzimuthAngle=1.37;
  orbit.minPolarAngle=.54;orbit.maxPolarAngle=2.61;orbit.addEventListener('change',draw);
  observer=new ResizeObserver(()=>resize());observer.observe(host);resize();pose();
  select('front').onclick=()=>pose();select('angle').onclick=()=>pose(-.84);
  select('in').onclick=()=>zoom(.79);select('out').onclick=()=>zoom(1/.79);
  select('switch').onclick=()=>togglePhoto(!photoMode);
  canvas.addEventListener('keydown',e=>{
    if(aligned)return;
    if(e.key==='Home'){e.preventDefault();pose();return;}
    if(['+','=','-','_'].includes(e.key)){e.preventDefault();zoom(['-','_'].includes(e.key)?1.25:.8);return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();const pos=new THREE.Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
    pos.theta=THREE.MathUtils.clamp(pos.theta+({ArrowLeft:-.09,ArrowRight:.09}[e.key]||0),orbit.minAzimuthAngle,orbit.maxAzimuthAngle);
    pos.phi=THREE.MathUtils.clamp(pos.phi+({ArrowUp:-.07,ArrowDown:.07}[e.key]||0),orbit.minPolarAngle,orbit.maxPolarAngle);
    camera.position.copy(orbit.target).add(new THREE.Vector3().setFromSpherical(pos));orbit.update();
  });
  model=await loadMetRelief();
  if(!disposed){
    scene.add(model);if(aligned)placePhotographCamera();else pose();photo.hidden=true;status.hidden=true;
    controlsBar.forEach(b=>b.disabled=false);
    document.body.dataset.relief='ready';draw();
  }
}catch(err){
  if(!disposed){
    host.hidden=true;photo.hidden=false;ref.hidden=false;
    status.textContent='当前显示馆藏原件摄影';select('help').hidden=true;
    controlsBar.forEach(b=>b.hidden=true);
    document.body.dataset.relief='photo';
  }
}
