import * as T from 'three';
import {court} from './building-plan.js';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
import {makeStone, applyFloorOcclusion} from './material-realism.js';
import {skylightAir} from './atrium-air.js';

const HALF = court.halfWidth;
const MOUTH = court.doorHalfWidth;
const SOUTH = court.south;
const SPRING = 4.85;
const RISE = 1.84;
const PI = Math.PI;
const colors = ['#687066','#936f53','#82594b','#677b72','#8b6751','#7d5e68','#606c77','#837858','#686961'];
const shade = n => .96 + .07 * (Math.sin(n * 31.13) * 512.29 % 1);
const surface = (color,metalness=0,roughness=.83) => new T.MeshStandardMaterial({color,metalness,roughness});

function masonry(parent, floor) {
  const bins = new Map();
  const euler=new T.Euler(), q=new T.Quaternion(), scale=new T.Vector3(1,1,1), v=new T.Vector3(), matrix=new T.Matrix4();
  function put(geom,mat,x,y,z,{yaw=0,roll=0,textureScale=.42,tone=1}={}) {
    matrix.compose(v.set(x,y,z),q.setFromEuler(euler.set(0,yaw,roll)),scale);
    geom.applyMatrix4(matrix);
    const g=geom.index ? geom.toNonIndexed() : geom;
    if(g!==geom)geom.dispose();
    const p=g.attributes.position, n=g.attributes.normal, uv=g.attributes.uv;
    const rgb=new Float32Array(p.count*3).fill(tone);
    g.setAttribute('color',new T.BufferAttribute(rgb,3));
    if(mat.map && uv)for(let i=0;i<p.count;i++){
      const nx=Math.abs(n.getX(i)), ny=Math.abs(n.getY(i)), nz=Math.abs(n.getZ(i));
      const u=(nx>ny&&nx>nz ? p.getZ(i) : p.getX(i))*textureScale;
      const vv=(ny>=nx&&ny>=nz ? p.getZ(i) : p.getY(i))*textureScale;
      uv.setXY(i,u,vv);
    }
    if(!bins.has(mat))bins.set(mat,[]);
    bins.get(mat).push(g);
  }
  function box(x,y,z,w,h,d,mat,opt){put(new T.BoxGeometry(w,h,d),mat,x,y,z,opt)}
  function finish() {
    for(const [mat,pieces] of bins){
      const merged=mergeGeometries(pieces),mesh=new T.Mesh(merged,mat);
      mesh.castShadow=mat!==floor&&!mat.isMeshBasicMaterial;
      mesh.receiveShadow=!mat.isMeshBasicMaterial;
      parent.add(mesh);pieces.forEach(g=>g.dispose());
    }
  }
  return {put,box,finish};
}

function arc(a,b,len,width,rise,thick) {
  const shape=new T.Shape();
  const steps=Math.max(3,Math.ceil((b-a)*14));
  for(let i=0;i<=steps;i++){
    const t=a+(b-a)*i/steps,x=width*Math.cos(t),y=rise*Math.sin(t);
    if(!i)shape.moveTo(x,y);else shape.lineTo(x,y);
  }
  for(let i=steps;i>=0;i--){
    const t=a+(b-a)*i/steps;
    shape.lineTo((width+thick)*Math.cos(t),(rise+thick)*Math.sin(t));
  }
  shape.closePath();
  return new T.ExtrudeGeometry(shape,{depth:len,bevelEnabled:false});
}

function tablet(group, options) {
  const {lines,x,y,z,w,h,yaw=0,fill='#3b342d',border='#988366',ink='#f9e4c0',index}=options;
  const canvas=document.createElement('canvas');
  canvas.width=1024;
  canvas.height=Math.round(canvas.width*h/w);
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=fill;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle=border;ctx.lineWidth=2.7;
  ctx.strokeRect(8,8,canvas.width-16,canvas.height-16);
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const l of lines){
    ctx.fillStyle=l.color||ink;
    ctx.font=(l.weight||'400')+' '+Math.round(l.size*canvas.height)+'px '+(l.font||'"Songti SC","STSong",serif');
    ctx.fillText(l.text,canvas.width/2,canvas.height*l.y,canvas.width*.92);
  }
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const mat=new T.MeshBasicMaterial({map:tex,color:'#f0e7db',toneMapped:false});
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);
  mesh.position.set(x,y,z);mesh.rotation.y=yaw;
  if(Number.isInteger(index))mesh.userData.hallIndex=index;
  group.add(mesh);
  return mesh;
}

export function buildAtrium(plans,textures) {
  const group=new T.Group();
  group.name='石窟 · 采光中庭';
  const signs=[],obstacles=[];
  const galleries=Array.from(plans).filter(p=>Number.isFinite(p.centerZ));
  const north=court.north;
  const length=SOUTH-north;
  const rowZs=[...new Set(galleries.map(p=>p.centerZ))].sort((a,b)=>b-a);
  const floor=makeStone('#b8af9f',textures,'floor');
  const stone=makeStone('#a89884',textures,'wall');
  const pale=makeStone('#d7c9b2',textures,'wall',true);
  const bronze=surface('#937552',.58,.42),iron=surface('#443d35',.66,.48),wood=surface('#685447',.12,.69);
  const glow=new T.MeshBasicMaterial({color:'#ffdfae',toneMapped:false});
  const batch=masonry(group,floor),{box,put}=batch;
  const sOpt=(tone=1)=>({tone,textureScale:1/2.4});

  box(0,-.07,(SOUTH+north)/2,HALF*2,.14,length,floor,{textureScale:1/3});
  // Two flush metal inlays form an uninterrupted navigable line. The shorter
  // cross bands mark actual room thresholds and terminate at their open mouths.
  for(const side of [-1,1])box(side*.76,.004,(north+SOUTH)/2,.019,.008,length-.15,bronze);
  for(const p of galleries){
    const side=p.centerX<0?-1:1;
    box(side*(HALF+.76)/2,.005,p.centerZ,HALF-.76,.009,.024,bronze);
    for(const offset of [-.15,.15])box(side*(HALF-.28),.004,p.centerZ+offset,.52,.008,.025,bronze);
  }

  function wallRun(side,start,end) {
    const run=end-start;if(run<.002)return;
    const z=(start+end)/2;
    // Recessed mortar face, individual stone courses, and a deliberately darker plinth.
    box(side*(HALF+.13),1.96,z,.25,3.92,run,stone,sOpt(.82));
    const h=.55;
    for(let row=0;row<7;row++){
      const step=1.78,first=start-(row%2)*step*.5;
      for(let j=0;first+j*step<end;j++){
        const a=Math.max(start,first+j*step),b=Math.min(end,first+(j+1)*step);
        if(b-a<.025)continue;
        box(side*(HALF+.023),h*(row+.5)+.09,(a+b)/2,.085,h-.013,b-a-.015,stone,sOpt(shade(row*11+j+start)));
      }
    }
    box(side*(HALF-.04),.11,z,.19,.22,run,pale,sOpt(.82));
    box(side*(HALF-.032),3.98,z,.20,.13,run,pale,sOpt());
    // Bronze clerestory mullions. The space between the sill and the roof is open.
    for(let zz=start+.8;zz<end-.12;zz+=1.5)box(side*HALF,4.40,zz,.06,.77,.05,iron);
    box(side*HALF,4.50,z,.055,.045,run,bronze);
  }
  // A small enclosed planting court fits into the unoccupied strip between
  // adjacent wings. Its depth is derived from the two real gallery footprints.
  function gardenCourt(side,z,span) {
    const x=side*HALF;
    box(x,.47,z,.31,.94,span,pale,sOpt(.93));
    box(side*(HALF-.035),.98,z,.41,.10,span+.05,bronze);
    box(x,3.96,z,.34,.20,span+.04,pale,sOpt());
    box(x,2.48,z,.048,2.93,.038,bronze);
    box(x,3.2,z,.047,.035,span,bronze);
    box(side*(HALF+1.9),-.105,z,3.8,.2,span,floor,{textureScale:1/3});
    box(side*(HALF+3.82),.93,z,.22,1.86,span,pale,sOpt(.95));
    if(textures.tree){
      const height=Math.min(6.5,span*1.25+.55),width=span*.97;
      const leaves=new T.MeshBasicMaterial({map:textures.tree,side:T.DoubleSide,alphaTest:.25,color:'#cdd0bf'});
      const tree=new T.Mesh(new T.PlaneGeometry(width,height),leaves);
      tree.rotation.y=-side*PI/2;tree.position.set(side*(HALF+2.2),height/2-.11,z);tree.castShadow=true;group.add(tree);
    }
  }
  for(const side of [-1,1]){
    const portals=galleries.filter(p=>Math.sign(p.centerX)===side).sort((a,b)=>a.centerZ-b.centerZ);
    const gardens=[];
    for(let i=1;i<portals.length;i++){
      const left=portals[i-1],right=portals[i];
      const a=left.centerZ+(left.halfDepth||9.45)+.25;
      const b=right.centerZ-(right.halfDepth||9.45)-.25;
      if(b-a>1.55)gardens.push({z:(a+b)/2,span:Math.min(4.85,b-a)});
    }
    function wallWithGarden(a,b) {
      let start=a;
      for(const court of gardens){
        const lo=court.z-court.span/2,hi=court.z+court.span/2;
        if(lo<a||hi>b)continue;
        wallRun(side,start,lo);gardenCourt(side,court.z,court.span);start=hi;
      }
      wallRun(side,start,b);
    }
    let low=north;
    for(const p of portals){
      // The gallery's inner lining owns the reveal. The masonry surround and
      // wall end successively farther back, even when viewed along the jamb.
      const roughEdge=MOUTH+.113;
      wallWithGarden(low,p.centerZ-roughEdge);
      low=p.centerZ+roughEdge;
      // Clear opening is 4.80 m by 3.80 m. All stone lies beyond those dimensions.
      box(side*(HALF+.03),4.03,p.centerZ,.32,.45,4.87,pale,sOpt(1.03));
      box(side*(HALF-.06),3.83,p.centerZ,.25,.055,4.84,bronze);
      for(const dz of [-1,1]){
        const jamb=p.centerZ+dz*(MOUTH+.211);
        for(let k=0;k<7;k++)box(side*(HALF-.025),.32+k*.50,jamb,.29,.485,.34,pale,sOpt(shade(k+p.index)));
        box(side*(HALF-.04),3.62,jamb,.36,.34,.43,pale,sOpt());
      }
      // Wall-facing visitor reads this plaque at the threshold. It occupies only the spandrel.
      const frameSide=-side*PI/2;
      const label=tablet(group,{x:side*(HALF-.151),y:4.02,z:p.centerZ,w:2.55,h:.36,yaw:frameSide,index:p.index,
        fill:colors[p.index%colors.length],lines:[{text:p.name,y:.5,size:.57}]});
      signs.push({mesh:label,hallIndex:p.index});
    }
    wallWithGarden(low,SOUTH);
    box(side*HALF,SPRING-.08,(north+SOUTH)/2,.35,.23,length,pale,sOpt(.94));
  }

  // A sequence of warm barrel-vault shoulders alternates with open clerestory.
  // Narrow iron ribs cross the glazed portion. Light can reach the floor through
  // the central slot and from the side windows above the museum doors.
  let bay=0;
  for(let z=SOUTH;z>north+.001;z-=6,bay++){
    const end=Math.max(north,z-6),D=z-end,gap=bay%4===1?.79:1.03;
    // The roof bay over the arrival floor is the only locally illuminated air volume.
    if(end<=8.2 && z>8.2)group.add(skylightAir({halfWidth:HALF,spring:SPRING,rise:RISE,angle:gap,start:end,end:z}));
    for(const [a,b] of [[0,gap],[PI-gap,PI]])put(arc(a,b,D,HALF+.02,RISE,.19),stone,0,SPRING,end,sOpt(.96));
    for(let r=0;r<3;r++)put(arc(gap,PI-gap,.047,HALF+.04,RISE+.03,.05),iron,0,SPRING,end+D*(r+.5)/3);
    for(let k=0;k<17;k++){
      const a=PI*k/17,b=PI*(k+1)/17;
      put(arc(a+.003,b-.003,.29,HALF-.15,RISE-.13,.23),pale,0,SPRING,z-.3,sOpt(shade(k+bay*19)));
    }
    for(const sign of [-1,1]){
      const byDoor=galleries.some(p=>Math.sign(p.centerX)===sign&&Math.abs(p.centerZ-z)<MOUTH+.38);
      if(byDoor)continue;
      for(let k=0;k<9;k++)box(sign*(HALF-.02),.28+k*.49,z-.15,.29,.48,.34,pale,sOpt(shade(k+z)));
      box(sign*(HALF-.04),4.64,z-.15,.43,.31,.53,pale,sOpt());
      box(sign*(HALF-.07),4.8,z-.15,.49,.12,.65,bronze);
    }
  }
  // Cross-aisle signs are above head level. Reading from either direction shows
  // the correct arrow; a two-sided texture would mirror the type on the return trip.
  for(const [row,zc] of rowZs.entries()){
    const local=galleries.filter(p=>p.centerZ===zc),sz=zc+2.93;
    for(const p of local){
      const side=Math.sign(p.centerX),cx=side*.89,top=SPRING+RISE*Math.sqrt(1-(cx/HALF)**2);
      box(cx,4.22,sz,1.68,.45,.07,wood);
      for(const off of [-.63,.63])box(cx+off,(top+4.455)/2,sz,.013,top-4.455,.013,bronze);
      for(const sign of [-1,1]){
        const arrow=side*sign<0?'←  ':'  →';
        const text=side*sign<0?arrow+p.name:p.name+arrow;
        const label=tablet(group,{x:cx,y:4.22,z:sz+sign*.041,w:1.64,h:.41,yaw:sign>0?0:PI,index:p.index,
          lines:[{text,y:.53,size:.49}],fill:colors[p.index%colors.length]});
        signs.push({mesh:label,hallIndex:p.index});
      }
    }
    // Quiet dotted brass indicator immediately inside each crossing.
    for(let k=0;k<row+1;k++)box(-.17+k*.085,.003,zc+.58,.036,.007,.13,bronze);
  }

  // The visitor arrives at a low lectern tucked against the west wall; its
  // chart uses the live sequence of galleries. There is a clear 5 m central lane.
  function bench(side,z,span=1.9) {
    const x=side*(HALF-.44),halfX=.30,halfZ=span/2;
    box(x,.44,z,halfX*2,.13,span,wood);
    for(const dz of [-span*.32,span*.32])box(x,.19,z+dz,.4,.37,.24,pale,sOpt(.91));
    obstacles.push({x,z,halfX,halfZ});
  }
  bench(1,6.65,1.68);
  for(let n=0;n<rowZs.length-1;n++)bench(n%2?1:-1,(rowZs[n]+rowZs[n+1])/2,2.1);
  const wallX=-HALF+.11,displayZ=6.65;
  box(wallX,2.18,displayZ,.12,2.21,3.14,wood);
  tablet(group,{x:wallX+.075,y:2.18,z:displayZ,w:3.05,h:2.13,yaw:PI/2,
    fill:'#d9cbb0',border:'#967e5d',ink:'#4d3d2f',
    lines:[{text:'石  窟',y:.29,size:.25},{text:'四大石窟 · 时代展馆',y:.56,size:.09},{text:'敦煌　大同　洛阳　天水',y:.78,size:.072}]});
  box(wallX+.23,3.46,displayZ,.11,.06,2.68,bronze);
  box(wallX+.23,3.422,displayZ,.075,.012,2.60,glow);
  for(const dz of [-1.1,1.1])box(wallX+.125,3.46,displayZ+dz,.23,.045,.05,bronze);

  // At each solid end a tall window terminates the perspective with daylight.
  // Garden vegetation sits outside the walkable building.
  function gardenWindow(z,side) {
    const pan=2.36;
    for(const sign of [-1,1])box(sign*(pan+HALF)/2,2.49,z,HALF-pan,4.98,.26,pale,sOpt());
    box(0,.44,z,pan*2,.88,.28,pale,sOpt());
    box(0,4.89,z,pan*2,.19,.31,bronze);
    for(let j=-2;j<=2;j++)box(j*.79,2.89,z,.042,4.01,.06,iron);
    for(const y of [1.79,3.77])box(0,y,z,pan*2,.043,.06,iron);
    if(textures.tree)for(const [x,d,size] of [[-2,4.5,7.1],[2.2,7.2,8.5],[-.4,9.5,10.3]]){
      const mat=new T.MeshBasicMaterial({map:textures.tree,side:T.DoubleSide,alphaTest:.28,color:'#c4c9b2',toneMapped:true});
      const tree=new T.Mesh(new T.PlaneGeometry(size*1.28,size),mat);
      tree.position.set(x,size*.50-1.15,z+side*d);tree.rotation.y=x*.08;
      group.add(tree);
    }
    box(0,-.17,z+side*4,2*HALF+5,.21,8,floor,{textureScale:1/3});
    box(0,.52,z+side*8,2*HALF+5,1.04,.29,pale,sOpt());
  }
  gardenWindow(SOUTH+.08,1);
  gardenWindow(north-.08,-1);
  batch.finish();
  applyFloorOcclusion(group,floor,HALF,SOUTH,north,obstacles,null);
  return {group,obstacles,signs};
}
