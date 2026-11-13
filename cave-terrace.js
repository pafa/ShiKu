import * as T from 'three';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {terraceDepth} from './cave-program.js';

function signImage(first,second,third){
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=242;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#312e28';ctx.fillRect(0,0,900,242);
  ctx.strokeStyle='#ad9263';ctx.lineWidth=3;ctx.strokeRect(8,8,884,226);
  ctx.fillStyle='#dcc298';ctx.font='25px "PingFang SC", sans-serif';ctx.fillText(first,38,52,824);
  ctx.fillStyle='#f2e3c5';ctx.font='59px "Songti SC", serif';ctx.fillText(second,36,130,826);
  ctx.fillStyle='#cebaa1';ctx.font='29px "Songti SC", serif';ctx.fillText(third,38,196,825);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return map;
}
function makePier(width,height,depth,seed){
  // Rings follow a bedding plane. Keep the entire rock inside its structural pier.
  const verts=[],normals=[],uv=[],colors=[],n=22,levels=Math.max(5,Math.round(height/.48));
  const pos=(i,k)=>{
    const phi=2*Math.PI*(i%n)/n,t=k/levels;
    const layer=.87+.052*Math.sin(k*1.22+seed)+.048*Math.cos(phi*4.7+k*.45+seed);
    const edge=v=>Math.sign(v)*Math.pow(Math.abs(v),.38);
    return [edge(Math.cos(phi))*width*.49*layer,(t*height)-(k===levels?.20*(1-Math.cos(phi*3+seed)):0),
      edge(Math.sin(phi))*depth*.49*layer+.09*Math.sin(k*.91+seed)];
  };
  const v=(a,b,c)=>{
    const ab=new T.Vector3(...b).sub(new T.Vector3(...a)),ac=new T.Vector3(...c).sub(new T.Vector3(...a)),no=ab.cross(ac).normalize();
    for(const p of [a,b,c]){verts.push(...p);normals.push(no.x,no.y,no.z);
      uv.push((Math.abs(no.x)>.7?p[2]:p[0])*.47,p[1]*.47);
      const k=.86+.09*Math.sin(p[1]*2.4+seed);colors.push(k,k*.986,k*.952);}
  };
  for(let k=0;k<levels;k++)for(let i=0;i<n;i++){
    const a=pos(i,k),b=pos(i+1,k),c=pos(i,k+1),d=pos(i+1,k+1);v(a,c,b);v(b,c,d);
  }
  for(let i=0;i<n;i++)v(pos(i,levels),[0,height,0],pos(i+1,levels));
  const g=new T.BufferGeometry();for(const [name,array,size] of [['position',verts,3],['normal',normals,3],['uv',uv,2],['color',colors,3]])g.setAttribute(name,new T.Float32BufferAttribute(array,size));return g;
}
export function buildCaveTerrace(wing, textures){
  const group=new T.Group(),batches=new Map(),signs=[];
  group.position.set(wing.outer,0,wing.plan.centerZ);group.rotation.y=-wing.plan.side*Math.PI/2;
  const localZ=z=>wing.plan.side*(z-wing.plan.centerZ);
  const sides=[localZ(wing.terrace.z0),localZ(wing.terrace.z1)].sort((a,b)=>a-b);
  const wood=new T.MeshStandardMaterial({color:'#665543',map:textures.floorcolor,roughness:.90});
  const brass=new T.MeshStandardMaterial({color:'#a7906b',metalness:.57,roughness:.54});
  const trim=new T.MeshStandardMaterial({color:'#534d41',roughness:.86});
  const rock=new T.MeshStandardMaterial({color:'#b39d84',map:textures.wallcolor,normalMap:textures.wallnormal,normalScale:new T.Vector2(.74,.74),vertexColors:true,roughness:.94});
  function part(material,g,x,y,z){
    g.translate(x,y,z);if(!batches.has(material))batches.set(material,[]);batches.get(material).push(g);
  }
  function box(m,x,y,z,w,h,d){
    if(w<.003||h<.003||d<.003)return;
    const geo=new T.BoxGeometry(w,h,d);
    if(m.map){const pos=geo.attributes.position,uv=geo.attributes.uv,n=geo.attributes.normal;
      for(let i=0;i<pos.count;i++)uv.setXY(i,(x+pos.getX(i))*.36,(Math.abs(n.getY(i))>.6?z+pos.getZ(i):y+pos.getY(i))*.36);
    }part(m,geo,x,y,z);
  }
  const span=sides[1]-sides[0],mid=(sides[0]+sides[1])/2;
  box(wood,mid,-.095,-terraceDepth/2,span,.19,terraceDepth);
  // A continuous walk leads to three independent cave mouths and back to the museum.
  box(brass,mid,.008,-terraceDepth*.50,span-.22,.014,.025);
  for(const edge of sides){
    box(trim,edge,.065,-terraceDepth/2,.14,.13,terraceDepth);
    box(brass,edge,.82,-terraceDepth/2,.039,.05,terraceDepth);
    for(let j=0;j<4;j++)box(trim,edge,.40,-.2-j*(terraceDepth-.4)/3,.043,.8,.043);
  }
  for(const s of [-1,1]){
    const a=wing.plan.halfDepth,b=s<0?-sides[0]:sides[1];
    if(b>a+.2){
      const x=s*(a+b)/2;box(trim,x,.085,0,b-a,.17,.14);box(brass,x,.84,0,b-a,.038,.038);
      const count=Math.ceil((b-a)/1.7);for(let k=0;k<=count;k++)box(trim,s*(a+(b-a)*k/count),.41,0,.046,.82,.046);
    }
  }
  const sorted=wing.caves.map(c=>({c,x:localZ(c.mouth.z)})).sort((a,b)=>a.x-b.x);
  for(let j=0;j<sorted.length;j++){
    const {c,x}=sorted[j];
    const opening=x-c.width/2,before=j?sorted[j-1].x+sorted[j-1].c.width/2:sides[0]-.42;
    const pierWidth=opening-before;
    const height=Math.min(8.4,c.height+.1);
    if(pierWidth>.08)part(rock,makePier(pierWidth,height,2.68,j+wing.plan.index*7),(opening+before)/2,0,-terraceDepth-.80);
    if(j===sorted.length-1){part(rock,makePier(.83,height*.89,2.42,32+wing.plan.index),x+c.width/2+.36,0,-terraceDepth-.74);}
    box(brass,x,.012,-terraceDepth*.74,.022,.015,terraceDepth*.48);
    const plaque=new T.Mesh(new T.PlaneGeometry(1.38,.39),new T.MeshBasicMaterial({map:signImage(c.work.siteName,c.work.number,c.details.length+' 处细读  ·  '+c.work.title),toneMapped:false}));
    const sx=x+Math.min(c.width*.5-.47,2.8),sz=-terraceDepth+.68;
    plaque.position.set(sx,1.09,sz);plaque.rotation.x=-.18;plaque.userData.caveDoor=c.id;
    group.add(plaque);signs.push(plaque);box(brass,sx,.56,sz-.03,.043,1.1,.04);box(trim,sx,.032,sz-.03,.36,.064,.29);
  }
  for(const gate of wing.gates){
    const x=localZ(gate.z),inside=.28;
    const label=new T.Mesh(new T.PlaneGeometry(Math.min(gate.width,3.24),.43),new T.MeshBasicMaterial({map:signImage('石 窟   ／   入 窟 动 线','崖廊　→','沿地面铜线寻找各处入口'),toneMapped:false}));
    label.position.set(x,wing.plan.index===0?4.30:3.51,inside);label.userData.caveDoor=wing.caves[0].id;group.add(label);signs.push(label);
  }
  for(const [mat,parts] of batches){
    const geo=mergeGeometries(parts);parts.forEach(p=>p.dispose());const mesh=new T.Mesh(geo,mat);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  }
  return {group,signs};
}
