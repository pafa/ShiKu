// The original document stays flat and colour managed. Surrounds, labels and
// scroll rollers are independent three-dimensional, contemporary museum fittings.
import * as THREE from 'three';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {wallStations} from './building-plan.js';
import {evidenceFor} from './object-evidence.js';
import {attachMetStation} from './met-relief-exhibit.js';

function caption(work) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=120;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#e7ddc8';ctx.fillRect(0,0,768,120);
  ctx.fillStyle='#342b23';ctx.font='38px "Songti SC",serif';
  ctx.fillText(work.title,24,56,722);
  ctx.font='22px "PingFang SC",sans-serif';ctx.fillStyle='#635648';
  ctx.fillText(work.siteName+' '+work.number+'　·　'+work.era,24,94,722);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
function sourceLabel(work,record) {
  const canvas=document.createElement('canvas');
  canvas.width=880;canvas.height=680;
  const g=canvas.getContext('2d');
  g.fillStyle='#dfd4bc';g.fillRect(0,0,880,680);
  g.fillStyle='#846f49';g.font='25px sans-serif';g.fillText(work.siteName+'　／　窟志',56,82);
  g.fillStyle='#444236';g.font='56px "Songti SC",serif';g.fillText(work.number,56,204,764);
  g.fillRect(57,243,66,2);
  g.font='32px "Songti SC",serif';
  const text=work.feature||record.reason||work.title;
  let y=326,line='';
  for(const character of text){
    if(g.measureText(line+character).width>758){g.fillText(line,56,y);line='';y+=54;}
    line+=character;
    if(y>495)break;
  }
  g.fillText(line,56,y);
  g.fillStyle='#716550';g.font='23px sans-serif';g.fillText('文字记录　·　'+(work.sourceName||'查阅窟志'),56,603,756);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
function fitting(color,metalness=0) {
  return new THREE.MeshStandardMaterial({color,metalness,roughness:metalness?.48:.79});
}

export function mountArt(plan,entries,textures,manager,sharedImages,invalidate){
  const group=new THREE.Group(),targets=[],batches=new Map(),prints=new Map();
  let reliefExhibit=null;
  const stations=wallStations(plan,entries.length);
  const rim=fitting(['#5a5043','#664435','#4d3329','#7e7154','#702f20','#685339','#584334','#544232','#484e50'][plan.index],.15);
  const liner=fitting(['#b39c73','#998572','#b19a71','#a9a189','#ad7953','#ae965c','#8a957f','#a38c69','#959c97'][plan.index],.28);
  const mat=fitting(['#d8cbb4','#d9cdbc','#b6ab94','#c2bda5','#d6c7b1','#d6c6a5','#d6cfb3','#c5b89d','#c6cbc2'][plan.index]);
  const lamp=new THREE.MeshBasicMaterial({color:'#ffe9c3',toneMapped:false});
  const plateMaterial=fitting('#817466',.42);
  const rectangular=(material,w,h,d,x,y,z)=>{
    const geometry=new THREE.BoxGeometry(w,h,d);geometry.translate(x,y,z);
    if(!batches.has(material))batches.set(material,[]);
    batches.get(material).push(geometry);
  };
  for(const station of stations){
    const {index,localX:x,localZ:z,width:w,height:h,inwardZ:sign}=station;
    const work=entries[index],y=1.92;
    station.y=y;station.hallIndex=plan.index;
    if(work.id==='longmen-met-35146'){
      reliefExhibit=attachMetStation(group,station,manager,sharedImages,invalidate);
      targets.push(...reliefExhibit.targets);
      continue;
    }
    const scroll=plan.index===6, shadowBox=plan.index===7||plan.index===8;
    const border=scroll?.035:shadowBox?.05:.068;
    rectangular(rim,w+.24,h+.25,.105,x,y,z);
    rectangular(liner,w+.18,h+.18,.026,x,y,z+sign*.068);
    rectangular(mat,w+.15,h+.145,.03,x,y,z+sign*.086);
    for(const top of [-1,1]){
      rectangular(rim,w+.25,scroll?.095:border,.115,x,y+top*(h/2+.097),z+sign*.092);
    }
    if(!scroll){
      for(const side of [-1,1])rectangular(rim,border,h+.17,.10,x+side*(w/2+.091),y,z+sign*.09);
    }
    if(plan.index!==6&&plan.index!==1){
      rectangular(rim,w*.6,.04,.051,x,y+h/2+.28,z+sign*.29);
      rectangular(lamp,w*.56,.012,.034,x,y+h/2+.254,z+sign*.29);
      for(const side of [-1,1])rectangular(plateMaterial,.022,.03,.30,x+side*w*.25,y+h/2+.28,z+sign*.15);
    }
    const image=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
    image.position.set(x,y,z+sign*.112);image.rotation.y=sign===1?0:Math.PI;
    image.userData.exhibit=station;group.add(image);targets.push(image);
    const record=evidenceFor(work);
    const src=record.images[0]?.src;
    image.visible=false;
    if(!src){
      image.material.map=sourceLabel(work,record);
      image.material.needsUpdate=true;
      image.visible=true;
    }
    if(src){
      image.userData.originalPhoto=src;prints.set(index,image);
      if(!sharedImages.has(src)){
        const loading=new THREE.TextureLoader(manager).loadAsync(src).then(t=>{
          t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
        });
        sharedImages.set(src,loading);
      }
      sharedImages.get(src).then(t=>{
        const ratio=t.image.width/t.image.height;
        image.scale.set(Math.min(1,ratio*h/w),Math.min(1,w/(h*ratio)),1);
        image.material.map=t;image.material.needsUpdate=true;image.visible=true;invalidate();
      }).catch(()=>{image.visible=false;});
    }
    const textWidth=Math.min(w*.83,1.58),textHeight=textWidth*120/768;
    const label=new THREE.Mesh(new THREE.PlaneGeometry(textWidth,textHeight),new THREE.MeshBasicMaterial({map:caption(work),toneMapped:false}));
    label.position.set(x,y-h/2-.29,z+sign*.088);label.rotation.y=image.rotation.y;
    label.userData.exhibit=station;group.add(label);targets.push(label);
    const pick=new THREE.Mesh(new THREE.PlaneGeometry(w+.26,h+.82),new THREE.MeshBasicMaterial({visible:false}));
    pick.userData.exhibit=station;pick.position.set(x,y-.12,z+sign*.122);pick.rotation.y=image.rotation.y;group.add(pick);targets.push(pick);
  }
  for(const [material,pieces] of batches){
    const geometry=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,material);
    mesh.receiveShadow=true;group.add(mesh);
  }
  return {group,targets,stations,prints,approach:reliefExhibit?.approach,close:reliefExhibit?.close};
}
