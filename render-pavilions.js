import {galleryGates} from './cave-program.js';
// Contemporary exhibition buildings designed for the nine curatorial rooms.
// The shapes, finishes and dimensions here describe the museum, not the original monuments.
import * as T from 'three';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {addPavilionFocus} from './pavilion-focus.js';

export const pavilionThemes=[
  ['石柱大像厅','八角砂石柱与错层石顶围出长的中轴，尽端留出退看大像的视距。'],
  ['四披禅室','四面坡顶向一方高窗收拢，两旁的坐席让人停下来仰看。'],
  ['七间木阁','七个木构开间把长向礼拜动线转成可以连续观看的展廊。'],
  ['叠井方厅','方形展厅中央的方转八角叠井逐层升高，天光沿层框落下。'],
  ['重檐正厅','高正厅与较低的侧翼共用一条屋脊，露明檩椽与出挑的木檐形成层次。'],
  ['八向明窗厅','方形展厅上方升起八面采光鼓座，放射的屋架把目光引向中心。'],
  ['山行画斋','低矮双坡木顶下的长案与山形窗相对，沿长卷尺度布置阅读位置。'],
  ['藏书阁','整壁经函匣、双层书架和并置的阅览坐席呈现旧作整理与重读的主题。'],
  ['材料研读室','高侧窗锯齿顶照亮两座测读台，端墙样品柜以网格组织观察。']
];
const colors=[
  ['#c8af8f','#846448','#705443','#d2c6b3','#574c44'],
  ['#dbc8ad','#9a7656','#7a5748','#e0d2bb','#726b5c'],
  ['#d0b799','#8f6147','#753e30','#d9c4a5','#645d53'],
  ['#c9c1af','#87735d','#685345','#d8d2c0','#646661'],
  ['#dac3a6','#976748','#773f30','#ded0bb','#575951'],
  ['#cec4a8','#8e795b','#645447','#e0d1aa','#62594f'],
  ['#d4c6a9','#977859','#6d5b49','#dfd6c4','#62675c'],
  ['#c6b899','#876e50','#5c4d3a','#ddd3bb','#54594c'],
  ['#b9b6ae','#706b61','#58534d','#cecfc6','#565b59']
];
const vec=(x,y,z)=>new T.Vector3(x,y,z),up=vec(0,1,0);
const TWO_PI=2*Math.PI;
const timberCache=new WeakMap();
function timberMaps(textures) {
  if(timberCache.has(textures))return timberCache.get(textures);
  const loader=new T.TextureLoader();
  const load=(name,color=false)=>{
    const t=loader.load('./assets/pavilions/timber-'+name+'.webp');
    t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;
    if(color)t.colorSpace=T.SRGBColorSpace;
    return t;
  };
  const maps={map:load('color',true),normalMap:load('normal'),roughnessMap:load('rough')};
  timberCache.set(textures,maps);
  return maps;
}
function palette(i,tex) {
  const col=colors[i],timber=timberMaps(tex);
  const mat=(color,opt={})=>new T.MeshStandardMaterial({color,roughness:.78,vertexColors:true,...opt});
  const rock={map:tex.wallcolor,normalMap:tex.wallnormal,roughnessMap:tex.wallrough,normalScale:new T.Vector2(.48,.48)};
  const wood={...timber,normalScale:new T.Vector2(.28,.28),roughness:.72};
  const floor=mat(i===8?'#d4d3ce':'#d1c8b7',{map:tex.floorcolor,normalMap:tex.floornormal,roughnessMap:tex.floorrough,normalScale:new T.Vector2(.46,.46),roughness:.74});
  const stone=mat(col[0],rock),dressed=mat(col[1],{...rock,normalScale:new T.Vector2(.22,.22)});
  for(const m of [stone,dressed]){
    m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
      'vec4 pStone=texture2D(map,vMapUv);float gStone=dot(pStone.rgb,vec3(.2126,.7152,.0722)); diffuseColor.rgb*=.26+1.62*mix(vec3(gStone),pStone.rgb,.10);');};
  }
  const oak=mat('#b49873',wood),woodDark=mat(col[2],wood);
  const plaster=mat(col[3],{normalMap:tex.wallnormal,normalScale:new T.Vector2(.044,.044),roughness:.91});
  const roof=mat(col[4],{roughness:.65,metalness:.04}),bronze=mat('#998361',{roughness:.45,metalness:.53});
  const paper=mat('#e6d9bb',{roughness:.87});
  const glass=new T.MeshBasicMaterial({color:'#a9c5c5',transparent:true,opacity:.21,depthWrite:false,vertexColors:true});
  const glow=new T.MeshBasicMaterial({color:i===8?'#f7efe0':'#ffe1a9',toneMapped:false,vertexColors:true});
  return {floor,stone,dressed,oak,woodDark,plaster,roof,bronze,paper,glow,glass};
}
function makeBuilder(group,p,obstacles) {
  const batches=new Map(),matrix=new T.Matrix4(),identity=new T.Quaternion(),one=vec(1,1,1);
  let sequence=0;
  function geometry(g,m,center=vec(0,0,0),q=identity) {
    const isWood=m===p.oak||m===p.woodDark,scale=isWood?.63:m===p.floor?.333:.42;
    const pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv;
    // Timber is projected in member-local coordinates along its longest axis.
    // Stone is projected in the room's coordinates so adjacent blocks share grain scale.
    const xPhase=(Math.sin(++sequence*4.18)+1)*.3;
    const bounds=isWood?(g.computeBoundingBox(),g.boundingBox.getSize(vec(0,0,0))):null;
    if(isWood&&uv){
      const longAxis=bounds.x>bounds.y&&bounds.x>bounds.z?'x':bounds.y>=bounds.z?'y':'z';
      for(let j=0;j<pos.count;j++){
        const pt=vec(pos.getX(j),pos.getY(j),pos.getZ(j)),n=vec(normal.getX(j),normal.getY(j),normal.getZ(j));
        const across=longAxis==='y'?(Math.abs(n.x)>Math.abs(n.z)?pt.z:pt.x):longAxis==='x'?(Math.abs(n.y)>Math.abs(n.z)?pt.z:pt.y):(Math.abs(n.y)>Math.abs(n.x)?pt.x:pt.y);
        uv.setXY(j,across*.65+xPhase,pt[longAxis]*scale+xPhase);
      }
    }
    matrix.compose(center,q,one);g.applyMatrix4(matrix);
    const shade=.95+.05*Math.cos(sequence*3.31),color=new Float32Array(pos.count*3);
    for(let j=0;j<pos.count;j++){
      if(!isWood&&uv){const a=Math.abs(normal.getX(j)),b=Math.abs(normal.getY(j)),c=Math.abs(normal.getZ(j));
        uv.setXY(j,(a>b&&a>c?pos.getZ(j):pos.getX(j))*scale,(b>=a&&b>=c?pos.getZ(j):pos.getY(j))*scale);}
      // Contact toning at a wall's foot and on downward-facing joinery.
      const foot=m===p.floor?1:.84+.16*Math.min(1,Math.max(0,pos.getY(j))/.46);
      const value=shade*foot*(normal.getY(j)<-.9?.90:1);color.fill(value,j*3,j*3+3);
    }
    g.setAttribute('color',new T.BufferAttribute(color,3));
    if(g.index){const n=g.toNonIndexed();g.dispose();g=n}
    if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);
  }
  function box(x,y,z,w,h,d,m,q=identity){geometry(new T.BoxGeometry(w,h,d),m,vec(x,y,z),q)}
  function beam(a,b,w,d,m) {
    const delta=b.clone().sub(a),len=delta.length();if(len<.001)return;
    geometry(new T.BoxGeometry(w,len,d),m,a.clone().lerp(b,.5),new T.Quaternion().setFromUnitVectors(up,delta.normalize()));
  }
  function cylinder(x,y,z,bottom,top,h,m,sides=20){geometry(new T.CylinderGeometry(top,bottom,h,sides),m,vec(x,y,z))}
  function block(x,z,w,d){obstacles.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2})}
  function quad(a,b,c,d,m) {
    // Both windings: roof faces are rendered from the garden and from the hall below.
    const ps=[],ns=[],uv=[];
    const faces=c===d?[[a,b,c],[a,c,b]]:[[a,b,c],[a,c,d],[a,c,b],[a,d,c]];
    for(const verts of faces){
      const n=verts[1].clone().sub(verts[0]).cross(verts[2].clone().sub(verts[0])).normalize();
      for(const v of verts){ps.push(v.x,v.y,v.z);ns.push(n.x,n.y,n.z);uv.push(0,0)}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));
    g.setAttribute('normal',new T.Float32BufferAttribute(ns,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry(g,m);
  }
  function finish(){
    for(const [m,parts] of batches){
      const g=mergeGeometries(parts);parts.forEach(x=>x.dispose());
      const mesh=new T.Mesh(g,m);mesh.castShadow=m!==p.glow&&m!==p.glass;mesh.receiveShadow=m!==p.glow&&m!==p.glass;group.add(mesh);
    }
    for(const material of Object.values(p))if(!batches.has(material))material.dispose();
  }
  return {geometry,box,beam,quad,cylinder,block,finish};
}
// A room uses four closed wall segments except at its entrance or a designed high window.
// Exhibit rails run only above/below the picture band on the two long display walls.
function envelope(c,W,D,side,h,wall,options={}) {
  const {box,p}=c;
  const doorW=4.8,doorH=3.8,t=.32,doorX=side*(W+t/2),farX=-doorX;
  const rail=options.rail||p.woodDark;
  // The adjacent court and terrace stop at these load-bearing wall lines.
  // Extending this slab underneath either threshold draws two floors at y=0.
  box(0,-.11,0,W*2,.22,D*2+.64,options.floor||p.floor);
  for(const zsign of [-1,1]){
    const z=zsign*(D+t/2);
    box(0,h/2,z,2*W+t*2,h,t,wall);
    box(0,.24,zsign*(D-.018),2*W,.48,.10,options.dado||p.dressed);
    box(0,.51,zsign*(D-.043),2*W,.064,.12,rail);
    box(0,h-.145,zsign*(D-.04),2*W,.18,.17,rail);
    // A lamp is visible as a finished fitting with a concealed line of warm light.
    const lampY=Math.min(h-.54,3.88);
    box(0,lampY,zsign*(D-.13),2*W-.80,.105,.23,p.bronze);
    box(0,lampY-.055,zsign*(D-.19),2*W-.85,.019,.092,p.glow);
  }
  // Leave a rebate behind the applied jambs and lintel. The visible face
  // of the lining alone sets the finished opening (4.80 by 3.80 metres).
  const roughWidth=doorW+.13, roughHead=doorH+.068;
  for(const s of [-1,1]){
    const len=D-roughWidth/2;
    box(doorX,h/2,s*(roughWidth/2+len/2),t,h,len,wall);
  }
  box(doorX,(roughHead+h)/2,0,t,h-roughHead,roughWidth,wall);
  // Show a dressed jamb in the depth of the wall; its inner edge is exactly ±2.40.
  for(const s of [-1,1])box(doorX,1.92,s*(2.4+.09),t+.22,3.84,.18,rail);
  box(doorX,3.93,0,t+.31,.26,5.16,rail);
  const gates=galleryGates(c.ordinal,D);
  const doorHeight=c.ordinal===0?3.98:3.22;
  let from=-D;
  for(const gate of gates){
    const left=gate.offset-gate.width/2,right=gate.offset+gate.width/2;
    const roughLeft=left-.044, roughRight=right+.044, roughTop=doorHeight+.055;
    if(roughLeft>from)box(farX,h/2,(roughLeft+from)/2,t,h,roughLeft-from,wall);
    box(farX,(h+roughTop)/2,gate.offset,t,h-roughTop,roughRight-roughLeft,wall);
    for(const z of [left-.045,right+.045])box(farX,doorHeight/2,z,.51,doorHeight,.09,p.bronze);
    box(farX,doorHeight+.07,gate.offset,.56,.14,gate.width+.32,rail);
    from=roughRight;
  }
  if(from<D)box(farX,h/2,(D+from)/2,t,h,D-from,wall);
}
function frameRect(c,x,y,z,w,d,h,m) {
  c.box(x,y,z-d/2,w,h,h,m);c.box(x,y,z+d/2,w,h,h,m);
  c.box(x-w/2,y,z,h,h,d,m);c.box(x+w/2,y,z,h,h,d,m);
}
function seat(c,x,z,w,d=.68,material=c.p.oak) {
  const {box,p,block}=c;
  box(x,.456,z,w,.125,d,material);
  for(const dir of [-1,1])box(x+dir*(w/2-.23),.20,z,.24,.40,d-.09,p.dressed);
  box(x,.145,z,w-.43,.09,.11,p.bronze);block(x,z,w+.025,d+.025);
}
function post(c,x,z,h,r,kind='timber',sides=16) {
  const {p,cylinder,box,block}=c;
  const shaft=kind==='timber'?p.woodDark:p.stone,cap=kind==='timber'?p.oak:p.dressed;
  cylinder(x,.095,z,r*1.49,r*1.43,.19,p.dressed,sides);cylinder(x,.234,z,r*1.32,r*1.10,.092,cap,sides);
  cylinder(x,(h-.48)/2+.28,z,r,r*.88,h-.48,shaft,sides);
  cylinder(x,h-.14,z,r*.96,r*1.21,.12,cap,sides);
  box(x,h-.045,z,r*2.81,.10,r*2.68,cap);
  block(x,z,2*r*1.5,2*r*1.5);
}
function postHead(c,x,y,z,size) {
  const {box,p}=c;
  box(x,y+.06,z,size*.9,.12,size*1.13,p.woodDark);
  box(x,y+.18,z,size*1.52,.14,size*.58,p.oak);
  box(x,y+.31,z,size*.64,.13,size*1.82,p.woodDark);
  box(x,y+.42,z,size*2.05,.10,size*.73,p.oak);
}
function pitched(c,W,D,eave,ridge,{span=D+.35,run=W+.38,z=0,rafters=1.0,skin,project=.28}={}) {
  const {p,beam,box,quad}=c;
  const bottom=skin||p.oak,outer=p.roof;
  for(const side of [-1,1]){
    const a=vec(-run,eave,z+side*span),b=vec(run,eave,z+side*span),cc=vec(run,ridge,z),d=vec(-run,ridge,z);
    quad(a,b,cc,d,bottom);
    quad(a.clone().add(vec(0,.13,0)),b.clone().add(vec(0,.13,0)),cc.clone().add(vec(0,.13,0)),d.clone().add(vec(0,.13,0)),outer);
    beam(a,b,.18,.17,p.woodDark);
    const n=Math.ceil(run*2/rafters);
    for(let j=0;j<=n;j++){
      const x=-run+2*run*j/n;
      beam(vec(x,eave-.085,z+side*(span+project)),vec(x,ridge-.09,z),.11,.147,p.woodDark);
      beam(vec(x,eave+.166,z+side*span),vec(x,ridge+.166,z),.055,.068,outer);
    }
    for(const t of [.32,.68])box(0,eave+t*(ridge-eave)-.21,z+side*(1-t)*span,run*2,.19,.19,p.woodDark);
  }
  box(0,ridge+.17,z,run*2+.34,.19,.23,p.roof);
}
// A rectangular opening stays open through the roof slab. Fill its perimeter with an
// upper clerestory, or with the sloping faces of a raised roof lantern.
function roofRing(c,W,D,y,w,d,mat,th=.26) {
  const {box}=c,north=(D-d)/2,ends=(W-w)/2;
  for(const s of [-1,1]){
    if(north>.001)box(0,y,s*(d+north),2*W,th,north*2,mat);
    if(ends>.001)box(s*(w+ends),y,0,ends*2,th,2*d,mat);
  }
}
function triangle(c,a,b,d,m){c.quad(a,b,d,d,m)}
function wallGable(c,W,D,h,peak,side,x){const {p}=c;const a=vec(x,h,-D),b=vec(x,h,D),d=vec(x,peak,0);triangle(c,a,b,d,p.plaster);c.beam(a,d,.15,.16,p.woodDark);c.beam(b,d,.15,.16,p.woodDark)}
function slabRoof(c,W,D,y,material){c.box(0,y,0,2*W+.58,.22,2*D+.58,material)}

function wei(c,W,D,side) {
  const {p,box}=c,low=4.52,high=6.72,band=D*.63;
  envelope(c,W,D,side,low,p.stone,{rail:p.dressed,dado:p.stone});
  for(const x of [-W-.16,W+.16])box(x,(low+high)/2,0,.32,high-low,band*2+.30,p.stone);
  for(const sign of [-1,1]){
    const breadth=D-band;
    box(0,low,sign*(D+band)/2,2*W+.24,.41,breadth+.20,p.dressed);
    box(0,low+.15,sign*band,2*W+.3,.65,.46,p.stone);
    box(0,low-.26,sign*band,2*W,.10,.56,p.bronze);
    for(const x of [-W*.73,-W*.28,W*.28,W*.73])post(c,x,sign*band,low-.08,.34,'stone',8);
    // The high level is glazed by narrow openings between heavy piers.
    for(let j=-3;j<=3;j++)box(W*j/3,(low+high)/2,sign*band,.29,high-low,.38,p.dressed);
    seat(c,0,sign*(band+.30),2.15,.69,p.stone);
  }
  box(0,high+.19,0,2*W+.56,.40,2*band+.80,p.stone);
  for(let x=-W+.62;x<W;x+=2.4)box(x,high-.09,0,.33,.26,2*band,p.dressed);
  // A sequence of niches is cut by the near end of the stone coffer, framing the distant sculpture.
  for(const z of [-band,band])box(0,high-.25,z,2*W,.19,.54,p.dressed);
  for(const s of [-1,1])box(-side*(W-.1),3.0,s*(D*.72),.35,5.9,.58,p.dressed);
}
function westernWei(c,W,D,side) {
  const {p,box,quad,beam}=c,h=4.65,top=7.04,a=W*.32,b=D*.29;
  envelope(c,W,D,side,h,p.plaster,{rail:p.woodDark,dado:p.dressed});
  const outer=[vec(-W,h,-D),vec(W,h,-D),vec(W,h,D),vec(-W,h,D)];
  const inner=[vec(-a,top,-b),vec(a,top,-b),vec(a,top,b),vec(-a,top,b)];
  for(let j=0;j<4;j++){const k=(j+1)%4;quad(outer[j],outer[k],inner[k],inner[j],p.plaster);
    beam(outer[j],inner[j],.18,.21,p.woodDark);
    for(let v=1;v<6;v++)beam(outer[j].clone().lerp(outer[k],v/6),inner[j].clone().lerp(inner[k],v/6),.05,.063,p.oak);
  }
  frameRect(c,0,top,0,2*a,2*b,.20,p.woodDark);
  for(const x of [-a,a])for(const z of [-b,b])box(x,top+.39,z,.15,.78,.15,p.woodDark);
  box(0,top+.85,0,2*a+.85,.20,2*b+.85,p.roof);
  // Three quiet, shallow reading bays face the entrance, without occupying the principal aisle.
  for(const z of [-D*.51,0,D*.51]){
    const x=-side*(W-.14),span=z?2.84:3.68;
    box(x,1.54,z,.22,3.00,span,p.dressed);box(x+side*.13,1.56,z,.08,2.75,span-.18,p.woodDark);
    box(x+side*.18,1.52,z,.057,2.56,span-.30,p.paper);
    c.block(x+side*.07,z,.40,span);
    if(z)seat(c,-side*(W-1.72),z,1.30,.88,p.oak);
  }
}
function northernZhou(c,W,D,side) {
  const {p,box}=c,h=4.52,axis=-side*(W-3.20),step=(2*D-5.4)/7;
  envelope(c,W,D,side,h,p.plaster,{rail:p.woodDark,floor:p.oak});
  pitched(c,W,D,h+.08,6.83,{rafters:.78});
  for(const x of [-W,W])wallGable(c,W,D,h,6.83,side,x);
  // Eight supports along the far gallery make seven bays, kept well clear of the exhibits.
  for(let j=0;j<8;j++){
    const z=-D+2.7+step*j;post(c,axis,z,2.93,.16);postHead(c,axis,2.94,z,.38);
    box(axis+side*.56,3.44,z,1.34,.12,.10,p.oak);
  }
  box(axis,3.43,0,.42,.28,step*7+.91,p.woodDark);
  box(axis-side*.78,3.60,0,2.51,.16,step*7+1.04,p.oak);
  box(axis+side*.56,3.52,0,.19,.18,step*7+1.12,p.roof);
  for(const z of [-D*.45,D*.45])seat(c,axis-side*1.04,z,1.60,.68);
}
function sui(c,W,D,side) {
  const {p,box,beam,quad}=c,h=4.82;
  envelope(c,W,D,side,h,p.plaster,{rail:p.dressed,dado:p.dressed});
  roofRing(c,W+.34,D+.34,h+.08,W*.57,D*.57,p.dressed);
  const layers=[];const sides=8;
  for(let j=0;j<5;j++){
    const radius=(W*.63-j*.76),y=h+.12+j*.43,offset=(j%2)*Math.PI/8;
    const points=Array.from({length:sides},(_,k)=>vec(Math.cos(k*TWO_PI/sides+offset)*radius,y,Math.sin(k*TWO_PI/sides+offset)*radius));
    if(j===0){
      // Close each shoulder from the surrounding slab to the octagonal well.
      const out=points.map(a=>{const scale=Math.max(Math.abs(a.x)/(W*.57+.10),Math.abs(a.z)/(D*.57+.10));return vec(a.x/scale,h+.085,a.z/scale)});
      for(let k=0;k<8;k++)quad(out[k],out[(k+1)%8],points[(k+1)%8],points[k],p.oak);
    }
    for(let k=0;k<8;k++){
      beam(points[k],points[(k+1)%8],j%2?.20:.25,.22,j%2?p.oak:p.woodDark);
      if(j) {
        const low=layers[j-1];
        quad(low[k],low[(k+1)%8],points[(k+1)%8],points[k],j%2?p.plaster:p.oak);
        beam(low[k],points[k],.12,.12,p.bronze);
      }
    }
    layers.push(points);
  }
  const last=layers.at(-1);for(const a of last)box(a.x,a.y+.25,a.z,.09,.52,.09,p.bronze);
  box(0,last[0].y+.63,0,5.08,.15,5.08,p.roof);
  for(const z of [-D*.49,D*.49])seat(c,-side*W*.49,z,2.05,.60,p.dressed);
}
function tang(c,W,D,side) {
  const {p,box,beam,quad}=c,h=4.55,central=D*.58,spring=5.86,ridge=8.15;
  envelope(c,W,D,side,h,p.plaster,{rail:p.woodDark});
  // High central nave flanked by lean-to roofs, with a second band of light above the eaves.
  pitched(c,W,D,spring,ridge,{span:central+.25,run:W+.40,rafters:.82});
  for(const s of [-1,1]){
    const a=vec(-W-.39,h+.08,s*(D+.39)),b=vec(W+.39,h+.08,s*(D+.39)),d=vec(-W-.39,spring-.7,s*central),cc=vec(W+.39,spring-.7,s*central);
    quad(a,b,cc,d,p.oak);
    quad(a.clone().add(vec(0,.11,0)),b.clone().add(vec(0,.11,0)),cc.clone().add(vec(0,.11,0)),d.clone().add(vec(0,.11,0)),p.roof);
    beam(a,b,.18,.19,p.woodDark);beam(d,cc,.18,.21,p.woodDark);
    const count=Math.ceil(W*2/.82);
    for(let j=0;j<=count;j++)beam(a.clone().lerp(b,j/count),d.clone().lerp(cc,j/count),.11,.13,p.woodDark);
    for(const x of [-W*.70,-W*.27,W*.27,W*.70]){
      post(c,x,s*central,spring-.55,.255);postHead(c,x,spring-.52,s*central,.67);
    }
    for(let x=-W+.46;x<W;x+=1.26)box(x,spring-.35,s*central,.078,.68,.12,p.woodDark);
    box(0,spring-.12,s*central,W*2+.62,.27,.44,p.woodDark);
    seat(c,-side*(W*.46),s*(central+.48),2.05,.66);
  }
  for(const x of [-W,W]){
    box(x,(h+spring)/2,0,.30,spring-h,central*2,p.plaster);
    wallGable(c,W,central,spring,ridge,side,x);
  }
  for(let x=-W*.70;x<=W*.701;x+=W*.70)beam(vec(x,spring-.12,-central),vec(x,spring-.12,central),.31,.26,p.woodDark);
}
function wuZhou(c,W,D,side) {
  const {p,box,quad,beam,cylinder,block}=c,h=4.8,r=Math.min(W,D)*.68,top=7.14;
  envelope(c,W,D,side,h,p.stone,{dado:p.dressed,rail:p.bronze});
  const ring=(rad,y)=>Array.from({length:8},(_,j)=>vec(rad*Math.cos(Math.PI/8+j*Math.PI/4),y,rad*Math.sin(Math.PI/8+j*Math.PI/4)));
  const lower=ring(r,h+.91),upper=ring(r*.91,top),crown=ring(r*.42,top+.92);
  const outer=lower.map(a=>{const scale=Math.max(Math.abs(a.x)/(W+.26),Math.abs(a.z)/(D+.26));return vec(a.x/scale,h+.07,a.z/scale)});
  // Fill the square eave corners as well as the octagonal shoulders of the roof.
  for(let j=0;j<8;j++){
    const j2=(j+1)%8,oa=outer[j],ob=outer[j2],la=lower[j],lb=lower[j2];
    quad(oa,ob,lb,la,p.roof);
    if(Math.abs(oa.x-ob.x)>.02&&Math.abs(oa.z-ob.z)>.02){
      const corner=vec(Math.sign(oa.x+ob.x)*(W+.26),h+.07,Math.sign(oa.z+ob.z)*(D+.26));
      triangle(c,oa,corner,ob,p.roof);
    }
    beam(oa,la,.18,.20,p.woodDark);beam(la,lb,.21,.18,p.dressed);
    beam(upper[j],upper[j2],.19,.18,p.bronze);
    quad(la,lb,upper[j2],upper[j],p.glass);
    beam(la,upper[j],.21,.21,p.woodDark);
    beam(la.clone().lerp(lb,.5),upper[j].clone().lerp(upper[j2],.5),.077,.11,p.woodDark);
    quad(upper[j],upper[j2],crown[j2],crown[j],p.roof);
    beam(upper[j],crown[j],.13,.13,p.bronze);beam(crown[j],crown[j2],.13,.13,p.woodDark);
    triangle(c,crown[j],crown[j2],vec(0,top+1.15,0),p.roof);
  }
  // Low inlaid radial lines stay flush with the walking surface.
  const compass=ring(2.25,.005);
  for(let j=0;j<8;j++)beam(compass[j],compass[(j+1)%8],.025,.020,p.bronze);
  for(const z of [-D*.53,D*.53]){const x=-side*(W-.97);cylinder(x,.19,z,.81,.77,.38,p.dressed,8);cylinder(x,.412,z,.82,.82,.058,p.bronze,8);block(x,z,1.64,1.64)}
}
function fiveDynasties(c,W,D,side) {
  const {p,box,beam,quad,block}=c,h=4.26,ridge=5.95;
  envelope(c,W,D,side,h,p.plaster,{rail:p.oak,floor:p.oak,window:{bottom:2.95,height:1.06,width:D*1.5,lights:8}});
  pitched(c,W,D,h+.025,ridge,{rafters:.63,skin:p.oak});
  for(const x of [-W,W])wallGable(c,W,D,h,ridge,side,x);
  for(let x=-W+.65;x<=W-.6;x+=3.25){
    box(x,h-.13,0,.21,.24,2*D,p.woodDark);
    beam(vec(x,h,-D*.70),vec(x,ridge-.12,0),.115,.13,p.oak);
    beam(vec(x,h,D*.70),vec(x,ridge-.12,0),.115,.13,p.oak);
  }
  const far=-side*(W-.24);
  // A continuous landscape-shaped screen under the rear windows is cut from three ribbons.
  for(let j=0;j<3;j++){
    let prev;for(let k=0;k<=44;k++){
      const z=(-.74+1.48*k/44)*D,x=far+side*(.02+j*.025),y=1.72+.14*j+.22*Math.sin(z*1.28+j*.78)+.085*Math.sin(z*2.23+j);
      const pt=vec(x,y,z);
      if(prev)quad(prev,pt,pt.clone().add(vec(0,-.135,0)),prev.clone().add(vec(0,-.135,0)),[p.dressed,p.bronze,p.oak][j]);
      prev=pt;
    }
  }
  // Long low tables run parallel to the far wall; their central gap preserves axial views.
  for(const s of [-1,1]){
    const x=-side*(W-1.57),z=s*D*.43,len=D*.55;
    box(x,.84,z,1.00,.13,len,p.oak);
    for(const zz of [z-len*.37,z+len*.37])box(x,.40,zz,.68,.80,.16,p.woodDark);
    for(const q of [-1,1]){const a=vec(x-.38,.94,z+q*.48),b=vec(x+.38,.94,z+q*.48);c.geometry(new T.CylinderGeometry(.058,.058,.80,18),p.oak,a.clone().lerp(b,.5),new T.Quaternion().setFromUnitVectors(up,b.clone().sub(a).normalize()))}
    box(x,.915,z,.69,.016,.96,p.paper);block(x,z,1.02,len+.02);
  }
}
function song(c,W,D,side) {
  const {p,box}=c,h=4.71,far=-side*(W-.50);
  envelope(c,W,D,side,h,p.plaster,{rail:p.woodDark,dado:p.woodDark,floor:p.woodDark});
  roofRing(c,W+.20,D+.20,h,.92,D*.62,p.oak,.22);
  // A long narrow monitor above the shelving aisle supplies two strips of clerestory light.
  for(const x of [-.96,.96]){
    box(x,h+.27,0,.13,.54,2*D*.62,p.woodDark);
    for(let z=-D*.60;z<D*.60;z+=.75)box(x,h+.75,z,.1,.45,.07,p.woodDark);
  }
  box(0,h+1.05,0,2.77,.17,2*D*.62+.6,p.roof);
  for(const z of [-D*.71,-D*.28,D*.28,D*.71])box(0,h-.22,z,2*W,.36,.25,p.woodDark);
  // Individually modelled boxes and lipped shelves. Their dimensions can be read at eye level.
  const bays=8,run=D*1.28,bay=run/bays;
  box(far,1.69,0,.70,3.37,run+.20,p.woodDark);
  const front=far+side*.42;
  for(let j=0;j<=bays;j++)box(front,1.68,-run/2+j*bay,.55,3.32,.10,p.oak);
  for(let row=0;row<=4;row++)box(front,.23+row*.73,0,.66,.095,run+.16,p.oak);
  for(let col=0;col<bays;col++)for(let row=0;row<4;row++){
    const z=-run/2+(col+.5)*bay,y=.38+row*.73;
    // Half the cells leave a visible shadow gap between stacks.
    const count=1+((col*3+row)%3);
    for(let k=0;k<count;k++) {
      const length=bay*.71-.04*((row+col+k)%3),pale=(row+col+k)%4===0;
      box(front+side*.04,y+k*.145,z,.43,.12,length,pale?p.paper:p.dressed);
      box(front+side*.265,y+k*.145,z-length*.21,.018,.057,.18,p.paper);
      box(front+side*.28,y+k*.145,z+length*.2,.018,.085,.024,p.bronze);
    }
  }
  c.block(far+side*.24,0,1.08,run+.24);
  for(const s of [-1,1])seat(c,side*.52,s*D*.48,2.70,.74,p.oak);
}
function research(c,W,D,side) {
  const {p,box,beam,quad,block}=c,h=4.40,rise=1.98,n=4;
  envelope(c,W,D,side,h,p.plaster,{rail:p.bronze,dado:p.dressed});
  // A north-light shed roof with slender mullions and braced steel rafters.
  for(let j=0;j<n;j++){
    const z0=-D+j*2*D/n,z1=-D+(j+1)*2*D/n;
    quad(vec(-W-.3,h,z0),vec(W+.3,h,z0),vec(W+.3,h+rise,z1-.16),vec(-W-.3,h+rise,z1-.16),p.roof);
    for(let k=0;k<=8;k++){
      const x=-W+k*W/4;
      beam(vec(x,h-.06,z0),vec(x,h+rise-.06,z1-.16),.105,.14,p.dressed);
      box(x,h+rise/2,z1-.11,.085,rise,.102,p.bronze);
    }
    quad(vec(-W,h+.10,z1-.11),vec(W,h+.10,z1-.11),vec(W,h+rise-.09,z1-.11),vec(-W,h+rise-.09,z1-.11),p.glass);
    box(0,h+rise-.02,z1-.11,2*W+.65,.12,.13,p.bronze);
    box(0,h+.07,z1-.11,2*W+.55,.13,.14,p.bronze);
    for(const x of [-W,W])triangle(c,vec(x,h,z0),vec(x,h,z1-.16),vec(x,h+rise,z1-.16),p.plaster);
  }
  const far=-side*(W-.40);
  box(far,1.95,0,.29,3.12,D*1.29,p.dressed);
  for(let j=0;j<=10;j++)box(far+side*.21,1.92,(-.64+j*.128)*D,.17,3.15,.039,p.bronze);
  for(let j=0;j<6;j++)box(far+side*.20,.41+j*.60,0,.18,.036,D*1.29,p.bronze);
  for(let j=0;j<8;j++){
    const z=(-.54+(j%4)*.36)*D,y=1.04+Math.floor(j/4)*1.18;
    box(far+side*.29,y,z,.17,.71,1.05,[p.stone,p.oak,p.plaster,p.roof][j%4]);
  }
  block(far+side*.16,0,.53,D*1.29);
  for(const s of [-1,1]){
    const x=-side*W*.33,z=s*D*.42;
    box(x,.91,z,3.10,.13,1.12,p.dressed);
    for(const xx of [x-1.27,x+1.27])for(const zz of [z-.41,z+.41])box(xx,.43,zz,.086,.86,.086,p.bronze);
    for(let k=0;k<3;k++)box(x-.83+k*.82,1.02,z,.53,.104,.43,[p.stone,p.oak,p.paper][k]);
    box(x,.25,z,2.64,.10,.63,p.woodDark);block(x,z,3.11,1.14);
  }
}
function facade(c,W,D,side,index) {
  const {p,box,beam}=c,x=side*(W+.365);
  // Different actual floor finishes continue through the threshold. Insets are flush within 8 mm.
  if(index===0){for(const z of [-1.48,1.48])box(0,.004,z,W*2,.007,.16,p.dressed)}
  if(index===3){
    for(const r of [2.58,2.81]){
      const pts=Array.from({length:8},(_,j)=>vec(r*Math.cos(j*Math.PI/4+Math.PI/8),.008,r*Math.sin(j*Math.PI/4+Math.PI/8)));
      for(let j=0;j<8;j++)beam(pts[j],pts[(j+1)%8],.022,.026,p.bronze);
    }
  }
  if(index===4){
    box(0,.004,0,W*2,.008,3.92,p.oak);
    for(const z of [-2.02,2.02])box(0,.006,z,W*2,.012,.055,p.bronze);
  }
  if(index===8){for(const z of [-D+1.90,D-1.90])box(0,.004,z,W*2,.008,.043,p.bronze)}
  // Each of the garden-facing wings keeps clear of the doorway; the canopies cantilever out.
  for(const zs of [-1,1]){
    const offset=zs*(2.65+(D-2.65)/2),span=D-2.65;
    if(index===0||index===3||index===5){
      const stone=index===5?p.dressed:p.stone;
      for(let row=0;row<4;row++){
        const n=row%2?4:3;
        for(let j=0;j<n;j++)box(x,.17+row*.32,offset-span/2+span*(j+.5)/n,.11,.303,span/n-.023,stone);
      }
      const outrank=index===0?3:index===3?4:5;
      for(let j=0;j<outrank;j++){
        const z=offset+(.5-(j+.5)/outrank)*span;
        box(x+side*.035,2.55,z,.15,2.60,index===0?.29:.15,p.dressed);
        box(x+side*.055,3.89,z,.21,.11,.38,p.bronze);
      }
    }else if(index===2||index===4||index===6||index===7){
      const n=index===2?4:index===7?5:3,w=span/n;
      for(let j=0;j<n;j++){
        const z=offset-span/2+w*(j+.5);
        const top=index===4?4.48:index===2?4.45:4.19;
        box(x,top/2,z-w*.47,.19,top,.12,p.woodDark);
        box(x+side*.034,1.16,z,.12,1.34,w-.22,index===7?p.woodDark:p.plaster);
        box(x+side*.092,2.82,z,.065,1.53,w-.24,p.paper);
        box(x+side*.142,2.12,z,.10,.07,w-.10,p.oak);
        box(x+side*.142,3.56,z,.10,.075,w-.10,p.oak);
        for(let q=1;q<5;q++)box(x+side*.16,2.83,z-w*.5+q*w/5,.049,1.43,.036,p.woodDark);
        if(index===6||index===7)box(x+side*.16,2.93,z,.048,.036,w-.22,p.woodDark);
        if(index===2||index===4)box(x+side*.28,3.93,z,.69,.13,.17,p.oak);
      }
      box(x+side*.22,4.10,offset,.80,.17,span+.15,p.woodDark);
      box(x+side*.31,4.21,offset,.99,.11,span+.20,p.roof);
    }else if(index===1){
      box(x,1.52,offset,.08,2.34,span-.54,p.dressed);
      box(x+side*.055,1.54,offset,.06,2.15,span-.72,p.plaster);
      for(const y of [.40,2.68])box(x+side*.065,y,offset,.10,.056,span-.42,p.oak);
    }else{
      box(x,1.42,offset,.09,1.98,span-.23,p.dressed);
      for(let j=0;j<4;j++)box(x+side*.08,1.41,offset-span/2+(j+.5)*span/4,.12,1.97,.054,p.bronze);
      box(x+side*.08,2.40,offset,.13,.05,span-.20,p.bronze);
    }
  }
  if(index===5){
    const crownX=x+side*.12;
    for(let j=0;j<3;j++){
      const w=5.83-j*.49,y=4.03+j*.15;
      box(crownX,y,0,.72-j*.12,.115,w,j%2?p.bronze:p.dressed);
    }
  }
}
const assemble=[wei,westernWei,northernZhou,sui,tang,wuZhou,fiveDynasties,song,research];
export function buildPavilion(plan,textures,entries=[],options={}) {
  const ordinal=plan.ordinal;
  if(!Number.isInteger(ordinal)||!assemble[ordinal]||!(plan.halfWidth>2.6)||!(plan.halfDepth>3.4)||![-1,1].includes(plan.doorSide))throw Error('Invalid exhibition pavilion dimensions or ordinal');
  const group=new T.Group(),obstacles=[],p=palette(ordinal,textures);
  group.name='当代馆体 · '+pavilionThemes[ordinal][0];
  group.userData.design=pavilionThemes[ordinal][1];
  const c=makeBuilder(group,p,obstacles);c.ordinal=ordinal;
  c.p=p;assemble[ordinal](c,plan.halfWidth,plan.halfDepth,plan.doorSide);facade(c,plan.halfWidth,plan.halfDepth,plan.doorSide,ordinal);c.finish();
  const targets=addPavilionFocus(plan,entries,group,p,options);
  return {group,obstacles,targets};
}
