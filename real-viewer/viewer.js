import * as THREE from 'three';
import { GLTFLoader } from './vendor/addons/loaders/GLTFLoader.js';
import { OrbitControls } from './vendor/addons/controls/OrbitControls.js';
const $=s=>document.querySelector(s),container=$('#canvas'),loading=$('#loading'),label=$('#loading-text'),errorBox=$('#error'),intro=$('.intro');
// Camera estimated against Dudva's independent full-frame photograph (1280 × 960).
// Only this locked observation uses its roll, focal length and position.
const matchedPhoto = new URLSearchParams(location.search).get('reference') === 'dudva';
if (matchedPhoto) document.body.classList.add('registered-photo');
function usePhotographCamera() {
  camera.position.set(17.9073540338, -12.3505126994, 17.0342987287);
  camera.up.set(.4052397294, .9025353212, .1456391281);
  camera.fov = 54.8;
  camera.lookAt(4.5693749893, -5.4673494291, 11.4917020085);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  controls.enabled = false;
}
let renderer,camera,controls,scene,center,size,initialPosition,ready=false,modelRoot,marker;
const markerRay=new THREE.Raycaster(), tmpMarker=new THREE.Vector3(), tmpDir=new THREE.Vector3();let lastOcclusion=0,markerMeshes=[];const lastRayPos=new THREE.Vector3(Infinity,Infinity,Infinity),lastRayQuat=new THREE.Quaternion(0,0,0,0);

$('#info-open').addEventListener('click',()=>{$('#info').hidden=false});$('#info-close').addEventListener('click',()=>{$('#info').hidden=true});$('#retry').addEventListener('click',()=>location.reload());$('#explore').addEventListener('click',()=>{intro.classList.add('hidden');renderer?.domElement.focus()});
function setup(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#211b17');camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.01,10000);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','三维模型。拖动旋转，滚轮或双指缩放。');container.append(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 controls.dampingFactor=.08;controls.enablePan=true;controls.screenSpacePanning=true;
 // The source was captured from the forecourt. Keep the orbit on the recorded side of the cliff.
 controls.minAzimuthAngle=Math.PI/2-1.02;controls.maxAzimuthAngle=Math.PI/2+1.02;
 controls.minPolarAngle=.30*Math.PI;controls.maxPolarAngle=.64*Math.PI;
 controls.addEventListener('start',()=>intro.classList.add('hidden'));
 scene.add(new THREE.HemisphereLight(0xffffff,0x59442e,2));const sun=new THREE.DirectionalLight(0xffe5c3,2);sun.position.set(4,8,5);scene.add(sun);
 renderer.setAnimationLoop(time=>{if(!matchedPhoto)controls.update();if(marker&&time-lastOcclusion>250&&(camera.position.distanceToSquared(lastRayPos)>1e-8||1-Math.abs(camera.quaternion.dot(lastRayQuat))>1e-8)){lastOcclusion=time;lastRayPos.copy(camera.position);lastRayQuat.copy(camera.quaternion);marker.getWorldPosition(tmpMarker);tmpDir.subVectors(tmpMarker,camera.position);const distance=tmpDir.length();markerRay.set(camera.position,tmpDir.normalize());markerRay.far=distance-.16;marker.visible=markerRay.intersectObjects(markerMeshes,false).length===0;}renderer.render(scene,camera)});
}
function fit(){if(!center)return;camera.aspect=innerWidth/innerHeight;let dim=Math.max(size.x,size.y,size.z), f=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);let distance=Math.max(size.z/(2*f*camera.aspect),size.y/(2*f))*(innerWidth<=700?1.05:1.24)+size.x/2;initialPosition=center.clone().add(new THREE.Vector3(distance,dim*.05,0));camera.position.copy(initialPosition);controls.target.copy(center);camera.near=dim/1000;camera.far=dim*30;camera.updateProjectionMatrix();controls.minDistance=dim*.35;controls.maxDistance=dim*8;controls.update()}

function createAnnotation(){
 // 由正面实测射线命中主佛躯干的网格点；标记略向观察方向偏移以避免与网格重叠。
 const surface=new THREE.Vector3(-4.3205695,-2.3498247,6.1488663);
 const towardCamera=camera.position.clone().sub(surface).normalize().multiplyScalar(.28);
 modelRoot.updateMatrixWorld(true);modelRoot.traverse(o=>{if(o.isMesh)markerMeshes.push(o)});
 const local=modelRoot.worldToLocal(surface.clone().add(towardCamera));
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 g.clearRect(0,0,128,128);g.fillStyle='rgba(26,20,15,.82)';g.beginPath();g.arc(64,64,38,0,Math.PI*2);g.fill();
 g.strokeStyle='#f2d39b';g.lineWidth=3;g.stroke();g.fillStyle='#f6dbad';g.font='52px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('✳',64,66);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 marker=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true}));
 marker.position.copy(local);marker.scale.set(1.65,1.65,1);marker.name='main-buddha-marker';modelRoot.add(marker);
 const keyboard=document.createElement('button');keyboard.type='button';keyboard.textContent='查看主佛标注';keyboard.setAttribute('aria-label','查看云冈第20窟主佛的说明');
 Object.assign(keyboard.style,{position:'fixed',left:'-10000px',top:'100px',zIndex:'15',padding:'12px',background:'#2d2319',color:'#f3dfbf',border:'1px solid #d8bb8d'});
 keyboard.addEventListener('focus',()=>keyboard.style.left='20px');keyboard.addEventListener('blur',()=>keyboard.style.left='-10000px');document.body.append(keyboard);
 const panel=document.createElement('section');panel.hidden=true;panel.setAttribute('aria-label','主佛标注说明');
 Object.assign(panel.style,{position:'fixed',right:'4%',top:'105px',zIndex:'12',width:'min(330px, 88vw)',padding:'22px',background:'rgba(33,26,20,.96)',color:'#eee0ca',border:'1px solid #b99b71',boxShadow:'0 15px 50px #0008',fontSize:'13px',lineHeight:'1.9'});
 panel.innerHTML='<button type="button" aria-label="关闭标注说明" style="float:right;background:none;border:0;color:inherit;font-size:24px;cursor:pointer">×</button><strong style="font-size:19px;font-weight:500">第 20 窟主佛</strong><p>第 20 窟是北魏早期昙曜五窟之一。云冈石窟的造像体现了佛教艺术与中国本土艺术的交融。</p><a href="https://whc.unesco.org/en/list/1039/" target="_blank" rel="noopener noreferrer" style="color:#e1bc86">UNESCO 云冈石窟资料 ↗</a><p style="font-size:11px;color:#c1ae94">标记定位于扫描网格表面；旋转到背面或被岩壁遮挡时会隐藏。</p>';
 document.body.append(panel);const close=panel.querySelector('button');close.addEventListener('click',()=>{panel.hidden=true});keyboard.addEventListener('click',()=>{intro.classList.add('hidden');panel.hidden=false;close.focus()});
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return}down=null;if(!marker.visible)return;const rect=renderer.domElement.getBoundingClientRect();const pointer=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);if(ray.intersectObject(marker,false).length){intro.classList.add('hidden');panel.hidden=false;close.focus()}});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;keyboard.focus()}});
}
$('#reset').addEventListener('click',()=>{if(ready)fit()});
try{setup();const response=await fetch('./assets/yungang-20.glb');if(!response.ok)throw new Error(`HTTP ${response.status}`);const array=await response.arrayBuffer();const model=await new GLTFLoader().parseAsync(array,'');scene.add(model.scene);modelRoot=model.scene;const box=new THREE.Box3().setFromObject(model.scene);center=box.getCenter(new THREE.Vector3());size=box.getSize(new THREE.Vector3());if(!Number.isFinite(size.length())||size.length()===0)throw new Error('模型尺寸无效');fit();if(matchedPhoto)usePhotographCamera();else createAnnotation();ready=true;loading.hidden=true;$('#reset').disabled=false;$('#explore').disabled=false;let meshes=0,triangles=0;model.scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});window.viewerEvidence={loaded:true,meshes,triangles};}catch(e){console.error(e);loading.hidden=true;errorBox.hidden=false;window.viewerEvidence={loaded:false,error:String(e)}}
window.addEventListener('resize',()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
