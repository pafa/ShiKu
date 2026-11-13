import * as T from 'three';
import {loadMetRelief,reliefWidth,reliefHeight} from './met-relief.js';

function ink(lines){
  const paper=document.createElement('canvas');paper.width=1040;paper.height=214;
  const g=paper.getContext('2d');g.fillStyle='#d8cbb0';g.fillRect(0,0,1040,214);
  g.fillStyle='#857049';g.fillRect(0,0,9,214);
  g.fillStyle='#3d342a';g.font='48px "Songti SC",serif';g.fillText(lines[0],32,78,978);
  g.fillStyle='#61513d';g.font='29px sans-serif';g.fillText(lines[1],33,130,970);
  g.font='24px sans-serif';g.fillText(lines[2],34,178,970);
  const texture=new T.CanvasTexture(paper);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}
function meshPlane(w,h,material,x,y,z,parent){
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);parent.add(mesh);
  return mesh;
}
function sign(parent,x,y,w,lines){
  return meshPlane(w,w*214/1040,new T.MeshBasicMaterial({map:ink(lines),toneMapped:false}),x,y,.056,parent);
}
function disposeDetached(root){
  const items=new Set();root.traverse(o=>{
    if(o.geometry)items.add(o.geometry);
    for(const m of [].concat(o.material||[])){items.add(m);for(const t of Object.values(m))if(t?.isTexture)items.add(t)}
  });
  items.forEach(v=>v.dispose());
}
export function attachMetStation(group,station,manager,sharedImages,invalidate){
  const root=new T.Group(),targets=[];
  root.rotation.y=station.inwardZ===1?0:Math.PI;
  root.position.set(station.localX,station.y,station.localZ+station.inwardZ*.105);
  root.name='龙门宾阳中洞 35.146 · 1:1 展位';
  group.add(root);
  const sideX=reliefWidth/2+.54;
  const frame=new T.Mesh(new T.BoxGeometry(reliefWidth+.09,reliefHeight+.14,.12),new T.MeshStandardMaterial({color:'#514a3d',roughness:.84}));
  frame.position.z=-.079;root.add(frame);
  const inlay=new T.Mesh(new T.BoxGeometry(reliefWidth+.062,reliefHeight+.105,.016),new T.MeshStandardMaterial({color:'#947f60',metalness:.3,roughness:.61}));
  inlay.position.z=-.01;root.add(inlay);
  const sideBacking=new T.Mesh(new T.BoxGeometry(.92,.73,.047),new T.MeshStandardMaterial({color:'#d0c4ac',roughness:.91}));
  sideBacking.position.set(sideX,.03,0);root.add(sideBacking);
  const material=new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
  const poster=meshPlane(reliefWidth,reliefHeight,material,0,0,.004,root),side=meshPlane(.84,.63,material,sideX,.028,.033,root);
  poster.visible=side.visible=false;
  const caption=sign(root,0,-reliefHeight/2-.25,2.36,['孝文帝礼佛图','龙门宾阳中洞 · 北魏，约522—523年','大都会艺术博物馆 35.146　／　宽393.7、高208.3厘米']);
  const picLabel=sign(root,sideX,-.52,.98,['原件正面摄影','大都会艺术博物馆','点选后可放大对照']);
  for(const mesh of [frame,caption,side,picLabel]){
    mesh.userData.exhibit=station;targets.push(mesh);
  }
  let busy=false,ready=false,disposed=false,retryAfter=0;
  const pick=meshPlane(reliefWidth+.08,reliefHeight+.10,new T.MeshBasicMaterial({visible:false}),0,0,.145,root);
  pick.userData.exhibit=station;targets.push(pick);
  const photoUrl=new URL('./assets/authentic/scans/met-procession-reference.webp',import.meta.url).href;
  if(!sharedImages.has(photoUrl)){
      sharedImages.set(photoUrl,new T.TextureLoader(manager).loadAsync(photoUrl).then(t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=6;return t}));
    }
  sharedImages.get(photoUrl).then(texture=>{
      if(disposed)return;
      const aspect=texture.image.width/texture.image.height;
      for(const [mesh,w,h] of [[poster,reliefWidth,reliefHeight],[side,.84,.63]]){
        mesh.scale.set(Math.min(1,aspect*h/w),Math.min(1,w/(aspect*h)),1);
      }
      material.map=texture;material.needsUpdate=true;poster.visible=!ready;side.visible=true;invalidate();
  }).catch(()=>{});
  function approach(x,z){
    if(disposed||busy||ready||performance.now()<retryAfter||Math.hypot(x-station.x,z-station.z)>13)return;
    busy=true;
    loadMetRelief(manager).then(relief=>{
      if(disposed){disposeDetached(relief);return}
      // Its original mesh projects roughly ten cm from its back. The display
      // leaves a real gap behind it and stays within the wall's hanging zone.
      const bounds=new T.Box3().setFromObject(relief,true);
      relief.position.z=.023-bounds.min.z;
      root.add(relief);poster.visible=false;ready=true;invalidate();
    }).catch(()=>{retryAfter=performance.now()+30000;}).finally(()=>{busy=false});
  }
  return {targets,approach,close(){disposed=true;}};
}
