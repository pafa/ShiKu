import {exhibitVisual} from './exhibit-visual.js';
import {evidenceFor} from './object-evidence.js';
import {manuscriptTables} from './collection-documents.js';
import * as T from 'three';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {tours,stopsFor} from './curator-routes.js';

const palettes=['#43354a','#465653','#783e30','#384e55','#7c382b','#594453','#3d5652','#434b3a','#46525b'];
const gold='#d9c49c';
function textile(panel,room){
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=1024;
  const c=canvas.getContext('2d');
  c.fillStyle=palettes[room.index];c.fillRect(0,0,384,1024);
  // Warp and weft remain visible at reading distance.
  for(let j=0;j<384;j+=3){c.fillStyle=j%6?'#ffffff07':'#00000011';c.fillRect(j,0,1,1024);}
  for(let j=0;j<1024;j+=4){c.fillStyle='#eddec60a';c.fillRect(0,j,384,1);}
  c.strokeStyle='#dcbd807d';c.lineWidth=2;c.strokeRect(16,15,352,993);
  c.fillStyle=gold;c.font='25px "Songti SC",serif';c.fillText('石　窟',42,69);
  const title=room.name.replace('馆','').replace('断代研读','研读');
  c.font=(title.length===1?'132':'110')+'px "Songti SC",serif';c.fillStyle='#f2e5cd';
  [...title].forEach((word,j)=>c.fillText(word,200,247+j*139));
  c.font='34px "Songti SC",serif';c.fillStyle=gold;
  const vertical=panel.title.replace(/[，、？]/g,'');
  [...vertical].forEach((word,j)=>c.fillText(word,54,238+48*j));
  c.strokeStyle='#e0c79a';c.lineWidth=2;c.beginPath();c.moveTo(42,878);c.lineTo(340,878);c.stroke();
  c.font='25px "Songti SC",serif';c.fillText(room.title,43,932);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function cloth(w,h){
  const geom=new T.PlaneGeometry(w,h,32,9),a=geom.attributes.position;
  for(let i=0;i<a.count;i++){
    const u=a.getX(i)/w+.5,v=a.getY(i)/h+.5;
    a.setXYZ(i,a.getX(i),a.getY(i)+.023*Math.cos(u*5*Math.PI)*(1-v),.036*Math.sin(6*Math.PI*u+.38*(1-v))*(.55+.45*v)+.014*Math.sin(15*u));
  }
  geom.computeVertexNormals();return geom;
}
function pageTexture(step,number){
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=780;
  const c=canvas.getContext('2d');c.fillStyle='#e5dcc7';c.fillRect(0,0,720,780);
  c.fillStyle='#835f32';c.font='30px "Songti SC",serif';c.fillText('馆内手记　／　'+number,46,82);
  c.fillStyle='#352d27';c.font='48px "Songti SC",serif';
  const wrap=(text,max)=>{const rows=[];let row='';for(const char of text){if(c.measureText(row+char).width>max){rows.push(row);row='';}row+=char;}if(row)rows.push(row);return rows;};
  const title=wrap(step.title,620);title.forEach((v,i)=>c.fillText(v,46,171+i*60));const y=211+(title.length-1)*60;
  c.fillStyle='#a99472';c.fillRect(47,y,615,2);c.fillStyle='#50473e';c.font='34px "Songti SC",serif';
  wrap(step.note,619).forEach((v,i)=>c.fillText(v,47,y+73+i*56));
  c.fillStyle='#7e694e';c.font='24px sans-serif';c.fillText(step.work.siteName+'　'+step.work.number,47,720);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function makeEditorialDisplays(plan,hall,sharedImages,manager,invalidate,deferPhoto){
  const group=new T.Group(),parts=new Map(),targets=[],obstacles=[];
  const bronze=new T.MeshStandardMaterial({color:'#9b815e',metalness:.57,roughness:.47});
  const black=new T.MeshStandardMaterial({color:'#39332c',metalness:.26,roughness:.7});
  const wood=new T.MeshStandardMaterial({color:['#504338','#695346','#714e39'][plan.index%3],roughness:.78});
  const paper=new T.MeshStandardMaterial({color:'#e1d3b7',roughness:.92});
  const glass=new T.MeshPhysicalMaterial({color:'#e2ebe1',roughness:.15,metalness:.1,transparent:true,opacity:.06,depthWrite:false});
  const add=(geo,mat,x,y,z,rx=0,ry=0)=>{
    const rotation=new T.Quaternion().setFromEuler(new T.Euler(rx,ry,0,'YXZ'));
    geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),rotation,new T.Vector3(1,1,1)));
    if(!parts.has(mat))parts.set(mat,[]);parts.get(mat).push(geo);
  };
  const box=(mat,x,y,z,w,h,d,rx=0,ry=0)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,rx,ry);
  const stops=stopsFor(hall),entry=tours[hall.id],outer=-plan.doorSide;
  // Freestanding fabric standard with a ballast foot; it sits beside the main sight line.
  const bx=outer*(plan.halfWidth*.70),bz=plan.halfDepth*.36;
  const heading=plan.doorSide*Math.PI/2;
  box(black,bx,.075,bz,.54,.15,1.79);box(bronze,bx,.17,bz,.35,.05,1.51);
  obstacles.push({x0:bx-.36,x1:bx+.36,z0:bz-.95,z1:bz+.95});
  const top=[5.02,3.95,4.12,4.42,4.85,4.73,3.75,3.97,4.19][plan.index];
  for(const k of [-1,1])box(bronze,bx,.15+(top-.12)/2,bz+k*.656,.034,top-.12,.034);
  box(bronze,bx,top,bz,.094,.067,1.55);
  const fabric=new T.Mesh(cloth(1.17,3.55),new T.MeshStandardMaterial({map:textile(entry,{...plan,name:hall.name}),roughness:.99,side:T.DoubleSide}));
  fabric.position.set(bx+plan.doorSide*.028,top-1.82,bz);fabric.rotation.y=heading;fabric.castShadow=true;fabric.receiveShadow=true;group.add(fabric);
  box(bronze,bx,top-3.62,bz,.059,.052,1.24);

  const sourceLoader=new T.TextureLoader(manager);
  // Each island presents an open double-page folio at a comfortable reading height.
  for(const [j,step] of [stops[0],stops[stops.length-1]].entries()){
    const archive=j===1?manuscriptTables[hall.id]:null;
    const cx=(j?-.30:.27)*plan.halfWidth*plan.doorSide;
    const cz=(j?-.36:.38)*plan.halfDepth;
    const y=.91,angle=-Math.PI/2+.25;
    box(black,cx,.065,cz,2.26,.13,1.01);
    box(wood,cx,.43,cz,1.98,.64,.82);
    box(bronze,cx,.77,cz,2.27,.045,1.08);
    box(black,cx,.817,cz,2.36,.092,1.18);
    box(paper,cx,y,cz-.025,1.94,.96,.026,angle);
    const makeLeaf=(w,h,x,material)=>{
      const leaf=new T.Mesh(new T.PlaneGeometry(w,h),material);
      leaf.rotation.x=angle;leaf.position.set(x,y+.037,cz-.016);
      if(archive)leaf.userData.manuscriptId=archive.id;else leaf.userData.stationIndex=step.index;
      group.add(leaf);targets.push(leaf);return leaf;
    };
    makeLeaf(.86,.88,cx+.48,new T.MeshBasicMaterial({map:pageTexture(archive?{...step,title:archive.title,note:archive.note,work:{siteName:'左图',number:archive.comparisonLabel}}:step,archive?archive.shelf:j?'末章':'序章'),toneMapped:false}));
    const left=makeLeaf(.86,.84,cx-.45,new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}));left.visible=false;
    const src=archive?evidenceFor(archive.comparisonWork).images[0]?.src:exhibitVisual(step.work)?.src;
    if(src){
      deferPhoto(cx,cz,()=>{
        if(!sharedImages.has(src))sharedImages.set(src,sourceLoader.loadAsync(src));
        sharedImages.get(src).then(t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;const ratio=t.image.width/t.image.height;left.scale.set(Math.min(1,ratio*.84/.86),Math.min(1,.86/(.84*ratio)),1);left.material.map=t;left.material.needsUpdate=true;left.visible=true;invalidate();}).catch(()=>{});
      });
    }
    box(glass,cx,1.106,cz,2.30,.018,1.12);
    for(const s of [-1,1]){
      box(bronze,cx+s*1.146,.973,cz,.025,.26,1.13);
      box(bronze,cx,1.108,cz+s*.563,2.32,.021,.025);
    }
    obstacles.push({x0:cx-1.2,x1:cx+1.2,z0:cz-.61,z1:cz+.61});
  }
  for(const [mat,items] of parts){const geo=mergeGeometries(items);items.forEach(x=>x.dispose());const mesh=new T.Mesh(geo,mat);mesh.castShadow=mat!==glass;mesh.receiveShadow=true;group.add(mesh);}
  return {group,targets,obstacles};
}
