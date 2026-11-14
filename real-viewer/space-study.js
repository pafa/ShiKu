import * as THREE from 'three';
import {OrbitControls} from './vendor/addons/controls/OrbitControls.js';
import {spaceStudies,studyPoster} from '../space-studies.js';

const id = new URLSearchParams(location.search).get('id');
const study = Object.hasOwn(spaceStudies,id) ? spaceStudies[id] : null;
const canvas = document.querySelector('canvas');
const nav = document.querySelector('nav');
function build() {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2,2,2,-2,.02,80);
  const controls = new OrbitControls(camera,canvas);
  controls.enablePan=false;controls.minZoom=.65;controls.maxZoom=3;
  controls.maxPolarAngle=Math.PI*.48;
  const model=new THREE.Group();scene.add(model);
  const light = new THREE.DirectionalLight(0xffebd1,2.6);light.position.set(-2,5,4);scene.add(light);
  scene.add(new THREE.HemisphereLight(0xfff5df,0xb5aa94,2.0));
  const slate=new THREE.MeshStandardMaterial({color:0x77654f,roughness:.98});
  const earth=new THREE.MeshStandardMaterial({color:0xc49768,roughness:.95});
  const limestone=new THREE.MeshStandardMaterial({color:0xcabea4,roughness:.92});
  const bronze=new THREE.LineBasicMaterial({color:0xe4b57b});
  const ink=new THREE.LineBasicMaterial({color:0x66543d});
  function line(points,mat) {
    model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),mat));
  }
  function block(x,y,z,w,h,d,material) {
    const geometry=new THREE.BoxGeometry(w,h,d);
    const part=new THREE.Mesh(geometry,material);
    part.position.set(x,y,z);
    part.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry),ink));
    model.add(part);
  }
  const length=study.rooms.reduce((n,r)=>n+r.depth,0);
  const width=Math.max(...study.rooms.map(r=>r.width));
  const height=Math.max(...study.rooms.map(r=>r.height));
  const thickness=width*.047;
  let front=length/2;
  for(const [index,room] of study.rooms.entries()){
    const {width:w,depth:d,height:h,roof}=room,back=front-d,middle=(back+front)/2;
    const low=roof==='remnant'?h:Math.min(.23,h*.18);
    block(0,-thickness/2,middle,w+thickness*2,thickness,d+thickness,slate);
    block(0,.006,middle,w,.012,d,index?earth:limestone);
    for(const x of [-1,1])block(x*(w+thickness)/2,low/2,middle,thickness,low,d,earth);
    const next=study.rooms[index+1];
    if(next){
      const side=(w-next.width)/2;
      for(const sign of [-1,1])block(sign*(w-side)/2,low/2,back,side,low,thickness,earth);
    }else block(0,low/2,back-thickness/2,w+thickness*2,low,thickness,earth);
    if(roof==='pyramid'){
      const eave=h*.68;
      for(const x of [-w/2,w/2])for(const z of [front,back]){
        line([[x,low,z],[x,eave,z],[0,h,middle]],bronze);
      }
      line([[-w/2,eave,front],[w/2,eave,front],[w/2,eave,back],[-w/2,eave,back],[-w/2,eave,front]],bronze);
    }else if(roof==='vault'){
      const spring=h-w/2;
      for(const z of [front,back]){
        const arc=Array.from({length:25},(_,i)=>[w/2*Math.cos(i*Math.PI/24),spring+w/2*Math.sin(i*Math.PI/24),z]);
        line([[w/2,low,z],...arc,[-w/2,low,z]],bronze);
      }
      for(const [x,y] of [[-w/2,spring],[0,h],[w/2,spring]])line([[x,y,front],[x,y,back]],bronze);
    }
    front=back;
  }
  if(study.platform){
    const p=study.platform;block(-width/2+p.width/2,p.height/2,0,p.width,p.height,p.depth,earth);
  }
  for(let i=0;i<=8;i++) {
    const offset=(i-4)*.5,span=2;
    line([[-span,-thickness-.013,offset],[span,-thickness-.013,offset]],ink);
    line([[offset,-thickness-.013,-span],[offset,-thickness-.013,span]],ink);
  }
  controls.target.set(0,height*.32,0);
  function setView(top=false) {
    camera.position.copy(controls.target).add(top?new THREE.Vector3(0,6,.001):new THREE.Vector3(3.8,2.8,3.7));
    camera.zoom=1;camera.updateProjectionMatrix();controls.update();render();
  }
  function render(){renderer.render(scene,camera);}
  function rotate(step){
    const v=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),step);
    camera.position.copy(controls.target).add(v);controls.update();
  }
  const resize=new ResizeObserver(()=>{
    const {clientWidth:w,clientHeight:h}=canvas;if(!w||!h)return;
    const size=Math.max(width,length,height)*.83,aspect=w/h;
    camera.top=size*Math.max(1,1/aspect);camera.bottom=-camera.top;
    camera.right=camera.top*aspect;camera.left=-camera.right;camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);render();
  });
  controls.addEventListener('change',render);
  document.querySelector('#plan').onclick=()=>setView(true);
  document.querySelector('#orbit').onclick=()=>setView(false);
  document.querySelector('#rotate').onclick=()=>rotate(.24);
  canvas.onkeydown=event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();rotate(event.key==='ArrowRight'?.16:-.16);}
  };
  resize.observe(canvas);setView();canvas.dataset.ready='true';
}
if(study){
  document.title=study.title+' · 尺度模型';
  document.querySelector('#dimensions').textContent=study.rooms.map((r,i)=>(study.rooms.length>1?(i?'后室':'前室'):'窟室')+'  '+r.width.toFixed(2)+' × '+r.depth.toFixed(2)+' × '+r.height.toFixed(2)+' m').join('\n');
  try{build();}catch{
    const poster=document.querySelector('#poster');poster.src='../'+studyPoster(id);poster.alt=study.title;poster.hidden=false;
    canvas.hidden=true;nav.hidden=true;document.querySelector('#dimensions').hidden=true;
    const message=document.querySelector('#fallback');message.textContent='当前设备显示模型静态剖视';message.hidden=false;
  }
}else{nav.hidden=true;document.querySelector('#dimensions').textContent='未找到这间窟室的模型。';}
