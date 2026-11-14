// The display furniture belongs to the museum. The illuminated faces carry
// complete, colour-managed photographs; their only transform is uniform scaling.
import * as T from 'three';
import {approachTreads} from './approach-stairs.js';
import {GLTFLoader} from './real-viewer/vendor/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {chamberLayout} from './chamber-layout.js';
import {caveDoorWidth} from './cave-plan.js';

const palettes={
  mogao:{wall:'#615044',base:'#473a31',metal:'#b09a68',paper:'#e3d5b7'},
  yungang:{wall:'#525650',base:'#373c38',metal:'#b7a684',paper:'#e4decb'},
  longmen:{wall:'#555952',base:'#3b403a',metal:'#aa9877',paper:'#e0d8c4'},
  maijishan:{wall:'#60564b',base:'#4c433c',metal:'#af977a',paper:'#e1d1b9'}
};
const ink='#403c31',rotations={back:[0,0,0],entry:[0,Math.PI,0],roof:[Math.PI/2,0,0],left:[0,Math.PI/2,0],right:[0,-Math.PI/2,0]};
const imageNames={site:'原址摄影',historical:'历史摄影',object:'原件摄影',document:'原件图版'};
function labelTexture(draw,w=1000,h=160){
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');
  draw(g,w,h);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}
function plaque(group,texture,width,height,y,z){
  const face=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture,toneMapped:false}));
  face.position.set(0,y,z);group.add(face);
}
function architecture(c,ctx,root,swatch){
  const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.9,...extra});
  const liner=material(swatch.base),wall=material(swatch.wall),metal=material(swatch.metal,{roughness:.53,metalness:.36});
  const floor=material('#a59883',{map:ctx.textures.floorcolor,normalMap:ctx.textures.floornormal,normalScale:new T.Vector2(.075,.075)});
  const shade=material('#363a34');
  const luminous=new T.MeshBasicMaterial({color:'#e4d6b7',toneMapped:false});
  const parts=new Map();
  function box(mat,x,y,z,w,h,d){
    if(w<=0||h<=0||d<=0)return;
    const geo=new T.BoxGeometry(w,h,d);geo.translate(x,y,z);
    if(mat===floor){
      const {position,normal,uv}=geo.attributes;
      for(let i=0;i<uv.count;i++){
        const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i));
        uv.setXY(i,(nx>.5?position.getZ(i):position.getX(i))*.28,(ny>.5?position.getZ(i):position.getY(i))*.28);
      }
    }
    if(!parts.has(mat))parts.set(mat,[]);
    parts.get(mat).push(geo);
  }
  const w=c.width/2,d=c.depth,h=c.height;
  const open=c.id==='longmen-1280'||c.id==='yungang-20';
  if(c.id==='longmen-1280'){
    // The step counts/landing dimensions are the museum circulation route.
    const segments=approachTreads;
    for(const [from,to,rise] of segments)box(floor,0,(rise-.055)/2,-(from+to)/2,2*w,rise+.055,to-from);
    for(const side of [-1,1]){
      for(const [from,to,rise] of segments){
        if(from<3||to>15.1)continue;
        box(liner,side*6.32,rise+.14,-(from+to)/2,.20,.28,to-from);
      }
    }
  }else box(floor,0,-.051,-d/2,2*w,.10,d);
  if(c.id==='longmen-1280'){
    // A freestanding photographic triptych sits on the approach platform.
    // Its backing is contemporary architecture. Nothing completes the edges
    // of the cliffs that are outside the three photographers' pictures.
    box(wall,0,h*.47,-d+.05,c.width+.12,h*.94,.22);
    box(liner,0,1.48,-d+.23,c.width,2.96,.34);
    for(const side of [-1,1]){
      box(wall,side*(w-.015),9.13,-29.0,.13,18.26,19.76);
      box(liner,side*(w-.105),1.53,-29.0,.29,3.06,19.76);
      box(metal,side*(w-.197),3.07,-29.0,.018,.026,19.76);
    }
  }
  if(!open){
    box(wall,-w-.065,h/2,-d/2,.13,h,d);
    box(wall,w+.065,h/2,-d/2,.13,h,d);
    box(wall,0,h/2,-d-.065,2*w+.25,h,.13);
    box(shade,0,h+.05,-d/2,2*w+.25,.10,d+.20);
    const gate=caveDoorWidth(c),jamb=w-gate/2;
    for(const side of [-1,1]){
      box(wall,side*(w-jamb/2),h/2,.055,jamb,h,.11);
      box(liner,side*(w-.012),.19,-d/2,.05,.38,d-.045);
      box(metal,side*(w-.036),.40,-d/2,.022,.016,d-.06);
      // Slim track lights and panel joints identify the room as an exhibition.
      box(liner,side*(w*.74),h-.065,-d/2,.075,.08,d*.92);
      box(luminous,side*(w*.74),h-.114,-d/2,.037,.013,d*.89);
      for(let z=-2.4;z>-d+.3;z-=2.4)box(liner,side*(w-.006),h/2,z,.015,h-.13,.014);
    }
    box(liner,0,.19,-d+.012,2*w,.38,.043);
  }
  for(const b of c.obstacles){
    const bw=b.x1-b.x0,bd=b.z1-b.z0,x=(b.x0+b.x1)/2,z=(b.z0+b.z1)/2;
    if(c.id==='longmen-1280'||c.id==='yungang-20')continue;
    const height=c.id==='mogao-158'?.39:.22;
    box(liner,x,height*.47,z,bw,height*.94,bd);
    box(metal,x,height-.014,z,bw+.019,.020,bd+.019);
  }
  for(const [mat,geometries] of parts){
    const geo=mergeGeometries(geometries);
    geometries.forEach(g=>g.dispose());
    const mesh=new T.Mesh(geo,mat);mesh.receiveShadow=true;
    root.add(mesh);
  }
}
function addPrint(root,ctx,spec,swatch,c){
  const {image,width,height,wall}=spec;
  const mount=new T.Group();
  mount.name=image.caption;mount.userData.originalPhoto=image.src;
  mount.position.fromArray(spec.center);mount.rotation.set(...rotations[wall]);
  root.add(mount);
  const loader=ctx.loader;
  return loader.loadAsync(image.src).then(texture=>{
    texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
    const ratio=texture.image.width/texture.image.height;
    const wp=Math.min(width,height*ratio),hp=wp/ratio;
    const edging=Math.max(.016,Math.min(.072,wp*.012));
    const frame=new T.Mesh(new T.BoxGeometry(wp+edging*2,hp+edging*2,.035),new T.MeshStandardMaterial({color:swatch.metal,roughness:.65,metalness:.37}));
    frame.position.z=-.026;mount.add(frame);
    const print=new T.Mesh(new T.PlaneGeometry(wp,hp),new T.MeshBasicMaterial({map:texture,toneMapped:false}));
    print.userData.originalPhoto=image.src;
    root.userData.prints.set(image.src,print);
    mount.add(print);
    const label=labelTexture((g,w,h)=>{
      g.fillStyle='#34362f';g.fillRect(0,0,w,h);
      g.fillStyle='#e4d7b5';g.font='40px "Songti SC",serif';g.fillText(image.caption,24,63,w-48);
      g.fillStyle='#cdc5b2';g.font='25px sans-serif';g.fillText((imageNames[image.kind]||'原件图版')+'　·　'+image.credit+'　·　'+image.license,25,116,w-50);
    });
    const tagWidth=Math.max(.50,Math.min(c.id==='longmen-1280'?5.8:2.85,wp*.94)),tagHeight=tagWidth*.16;
    // A large frontal photograph can reach the floor; its caption then sits
    // within the lower border instead of disappearing under the walking deck.
    const floorAt=c.id==='longmen-1280'?2.88:0;
    const y=wall==='roof'||spec.center[1]-hp/2-tagHeight>floorAt+.025?-hp/2-tagHeight/2-edging*1.5:-hp/2+tagHeight/2+edging;
    plaque(mount,label,tagWidth,tagHeight,y,.006);
    ctx.invalidate();
  });
}
function addDocumentWall(root,c,spec,swatch) {
  const {center,wall,width,height,entries}=spec;
  const group=new T.Group();
  group.name=c.work.number+' · 窟志记录';
  group.userData.documentEntries=entries.map(({detail})=>detail.id);
  group.position.fromArray(center);group.rotation.set(...rotations[wall]);
  const art=labelTexture((g,w,h)=>{
    g.fillStyle='#ded3bb';g.fillRect(0,0,w,h);
    g.fillStyle='#8a714d';g.font='28px sans-serif';
    g.fillText(c.work.siteName+'　／　'+c.work.number,54,h*.117,w-108);
    g.fillStyle=ink;g.font='52px "Songti SC",serif';
    g.fillText(c.work.title,54,h*.25,w-108);
    g.fillStyle='#70634d';g.font='24px sans-serif';
    g.fillText('文献记录　·　'+(c.work.sourceName||'逐窟资料'),54,h*.328,w-108);
    g.fillStyle='#b7a585';g.fillRect(54,h*.39,w-108,2);
    const step=h*.48/entries.length;
    for(const [row,{detail,index}] of entries.entries()){
      const y=h*.45+(row+.5)*step;
      g.fillStyle='#8f7651';g.font='24px sans-serif';g.fillText(String(index+1).padStart(2,'0'),54,y+7);
      g.fillStyle=ink;g.font='34px "Songti SC",serif';g.fillText(detail.title,121,y+10,w-178);
    }
  },1200,828);
  const backing=new T.Mesh(new T.BoxGeometry(width+.044,height+.044,.057),new T.MeshStandardMaterial({color:swatch.metal,roughness:.76}));
  backing.position.z=-.033;group.add(backing);
  plaque(group,art,width,height,0,.001);
  root.add(group);
}
async function originalScan(c,ctx,root){
  const asset=await new GLTFLoader(ctx.manager).loadAsync('real-viewer/assets/yungang-20.glb');
  const holder=new T.Group();holder.name='罗迪 · 第20窟原始摄影测量网格';holder.add(asset.scene);
  holder.rotation.y=-Math.PI/2;holder.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(holder),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  const scale=Math.min(24.6/size.x,15.65/size.y);
  holder.scale.setScalar(scale);
  holder.position.set(-center.x*scale,.24-bounds.min.y*scale,-18.4-bounds.min.z*scale);
  holder.userData.capture='real-viewer/assets/yungang-20.glb';
  root.add(holder);
  ctx.invalidate();
}
export async function buildPhotographicChamber(c,ctx){
  const root=new T.Group();
  root.name=c.work.siteName+' '+c.work.number+' · 原件影像展陈';
  root.userData.prints=new Map();
  const swatch=palettes[c.work.siteId];
  architecture(c,ctx,root,swatch);
  if(c.id==='yungang-20'){
    await originalScan(c,ctx,root);
    return root;
  }
  const layout=chamberLayout(c);
  await Promise.all(layout.panels.map(spec=>addPrint(root,ctx,spec,swatch,c)));
  if(layout.document)addDocumentWall(root,c,layout.document,swatch);
  return root;
}
