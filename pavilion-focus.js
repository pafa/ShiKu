// Featured end-wall displays. Full images retain their source aspect ratio; the
// catalogue evidence decides which works have a photographic display.
import * as T from 'three';
import {evidenceFor} from './object-evidence.js';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';

const ratio={
  'mogao-285':1280/959,'maijishan-44':11/7,'longmen-712':1280/853,
  'maijishan-4':1280/857,'maijishan-9':1280/857,'mogao-302':11/7,
  'mogao-401':1280/1755,'maijishan-13':1280/1707,'longmen-1280':4/3,
  'mogao-217':540/402,'longmen-543':1280/853,'mogao-96':1280/850,
  'mogao-332':1280/1266,'longmen-435':1280/853
};
function compositions(plan) {
  const D=plan.halfDepth;
  // [work, lateral location along the end wall, image centre, maximum w/h, toe-in angle]
  switch(plan.ordinal){
    case 1:return [
      ['maijishan-44',-D*.51,1.70,2.56,1.62,0],
      ['mogao-285',0,1.76,3.19,1.83,0],
      ['longmen-712',D*.51,1.70,2.56,1.62,0]
    ];
    case 2:return [
      ['maijishan-4',-1.98,1.68,3.35,2.20,0],
      ['maijishan-9', 1.98,1.68,3.35,2.20,0]
    ];
    case 3:return [
      ['mogao-401',-3.79,1.92,1.86,2.62,0],
      ['mogao-302',0,2.06,4.24,2.68,0],
      ['maijishan-13',3.79,1.92,1.86,2.62,0]
    ];
    case 4:return [
      ['longmen-543',-4.42,1.96,2.80,2.06,0],
      ['longmen-1280',0,2.38,5.12,3.39,0],
      ['mogao-217',4.42,1.96,2.80,2.06,0]
    ];
    case 5:return [
      ['mogao-332',-3.55,1.95,2.62,2.44,.12],
      ['mogao-96',0,2.30,4.00,2.86,0],
      ['longmen-435',3.55,1.95,2.65,2.43,-.12]
    ];
    default:return [];
  }
}
function label(work,image) {
  const canvas=document.createElement('canvas');canvas.width=1152;canvas.height=198;
  const g=canvas.getContext('2d');
  g.fillStyle='#e1d5bf';g.fillRect(0,0,canvas.width,canvas.height);
  g.fillStyle='#8b7351';g.fillRect(0,0,10,canvas.height);
  const cave=work.siteName+' '+work.number;
  g.fillStyle='#433428';g.font='46px "Songti SC",serif';g.fillText(cave+'　'+work.title,29,63,1092);
  g.fillStyle='#5d4d39';g.font='31px "PingFang SC",sans-serif';
  g.fillText((work.crossPeriod?'跨时代对照':'本馆主展')+'　·　'+work.era+'　·　'+({site:'原址影像',historical:'历史摄影',object:'馆藏原件',document:'原件图版'}[image.kind]||'原件图版'),31,119,1087);
  g.font='25px "PingFang SC",sans-serif';g.fillStyle='#6c6051';
  const credit=image.credit+'　·　'+image.license;
  g.fillText(credit,32,164,1087);
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}

export function addPavilionFocus(plan,entries,group,materials,options={}) {
  if(!entries?.length)return [];
  const list=compositions(plan);if(!list.length)return [];
  const cache=options.sharedImages||new Map(),loader=new T.TextureLoader(options.manager),invalidate=options.invalidate||(()=>{});
  const frames=new Map(),targets=[];
  function addGeometry(g,mat,pane){
    g.applyMatrix4(pane.matrix);if(!frames.has(mat))frames.set(mat,[]);frames.get(mat).push(g);
  }
  const solid=(pane,x,y,z,w,h,d,mat)=>{
    const geo=new T.BoxGeometry(w,h,d).toNonIndexed();geo.translate(x,y,z);
    // The architectural finishes accept per-vertex colours.
    const c=new Float32Array(geo.attributes.position.count*3).fill(1);geo.setAttribute('color',new T.BufferAttribute(c,3));
    addGeometry(geo,mat,pane);
  };
  for(const [id,lateral,y,maxW,maxH,tilt] of list){
    const k=entries.findIndex(s=>s.id===id);if(k<0)continue;
    const work=entries[k],photo=evidenceFor(work).images[0],src=photo?.src;
    if(!src)continue;
    const ar=ratio[id],w=Math.min(maxW,maxH*ar),h=w/ar;
    // The leading edge of a folded display remains clear of the stone wall.
    const offset=(plan.ordinal===1?.39:.19)+Math.abs(Math.sin(tilt)*w/2);
    const pane=new T.Group();
    pane.rotation.y=plan.doorSide*(Math.PI/2+tilt);
    pane.position.set(-plan.doorSide*(plan.halfWidth-offset),y,lateral);
    pane.updateMatrix();group.add(pane);
    const type=plan.ordinal;
    const face=(name,width,height,x,y,z,material)=>{
      const m=new T.Mesh(new T.PlaneGeometry(width,height),material);m.position.set(x,y,z);m.name=name;m.userData.stationIndex=k;pane.add(m);targets.push(m);return m;
    };
    // Western Wei images fit the three already-constructed niches. Sui uses
    // hanging rolls; Tang places a large, tiered mount between the smaller prints.
    if(type!==1){
      const border=type===4&&id==='longmen-1280'?.22:.115;
      solid(pane,0,0,.03,w+border*2+.09,h+border*2+.09,.075,materials.woodDark);
      solid(pane,0,0,.078,w+border*2,h+border*2,.035,type===5?materials.bronze:materials.paper);
      if(type===3){
        for(const sign of [-1,1]){
          const geo=new T.CylinderGeometry(.062,.062,w+.38,16).toNonIndexed();
          geo.rotateZ(Math.PI/2);geo.translate(0,sign*(h*.5+.14),.12);
          geo.setAttribute('color',new T.BufferAttribute(new Float32Array(geo.attributes.position.count*3).fill(.92),3));addGeometry(geo,materials.woodDark,pane);
        }
      }
      if(type===4){
        solid(pane,0,h/2+.25,.145,w+.47,.12,.32,materials.woodDark);
        solid(pane,0,h/2+.32,.12,w+.60,.048,.37,materials.bronze);
      }
      if(type===5){
        for(const edge of [-1,1])solid(pane,edge*(w*.5+.135),0,.08,.035,h+.31,.07,materials.bronze);
      }
    }
    const mat=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
    const image=face(work.title,w,h,0,0,.106,mat);image.visible=false;
    const labelW=Math.min(2.15,Math.max(1.43,w*.80)),labelH=labelW*198/1152;
    const plaque=face(work.siteName+' '+work.number,labelW,labelH,0,-h/2-labelH/2-(type===3?.26:.145),.12,new T.MeshBasicMaterial({map:label(work,photo),toneMapped:false}));
    plaque.userData.stationIndex=k;
    if(!cache.has(src))cache.set(src,loader.loadAsync(src).then(t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}));
    cache.get(src).then(t=>{
      const live=t.image.width/t.image.height;image.scale.set(Math.min(1,live/ar),Math.min(1,ar/live),1);mat.map=t;mat.needsUpdate=true;image.visible=true;invalidate();
    }).catch(()=>{image.visible=false;invalidate()});
  }
  for(const [m,parts] of frames){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh)}
  return targets;
}
