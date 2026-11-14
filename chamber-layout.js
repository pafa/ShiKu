// Display coordinates belong to the museum. Images are placed as flat prints,
// and the camera targets a location on that print instead of an invented object.
import {chamberPhotos,evidenceAt} from './chamber-evidence.js';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const built=new WeakMap();
const fronts={back:[0,0,1],left:[1,0,0],right:[-1,0,0],entry:[0,0,-1],roof:[0,-1,0]};
function panel(wall,center,width,height,image) {
  return {wall,center,width,height,image,normal:fronts[wall]};
}
function mean(points) {
  return points.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/points.length),[0,0,0]);
}
const curatedWalls={
  'yungang-12':{coffers:'roof',ensemble:'back',window:'back',eaves:'right'},
  'longmen-712':{petals:'roof',edge:'roof',image:'back'},
  'mogao-407':{hares:'roof'},'mogao-320':{'north-panel':'right'},
  'maijishan-13':{face:'back',flanks:'back',core:'back',silhouette:'left'},
  'maijishan-133':{stele:'right',thousand:'left',crossed:'left',rahula:'back'},
  'mogao-285':{bandits:'left',dated:'right'},
  'mogao-217':{monk:'left'},'mogao-249':{asura:'roof'},
  'mogao-61':{wutai:'back',princess:'entry',gate:'entry'}
};
function mounting(c,d) {
  const placed=curatedWalls[c.id]?.[d.id];if(placed)return placed;
  const [x,y,z]=d.anchor;
  const dx=x-d.stand[0], dz=z-d.stand[1];
  if(y>c.height*.64 && y-1.62>Math.hypot(dx,dz)*1.17)return 'roof';
  if(Math.abs(dx)>Math.abs(dz)*1.2)return dx<0?'left':'right';
  return dz>0?'entry':'back';
}
// Measured on the photographs themselves, as fractions of the complete frame.
const readingPoints={
  'longmen-712':{petals:[.507,.48],edge:[.27,.64]},
  'maijishan-13':{face:[.494,.226],flanks:[.245,.292],core:[.549,.563]},
  'longmen-435':{mainsitting:[.618,.42], 'side-sitting':[.813,.47],unworked:[.178,.53]},
  'longmen-1387':{'different-dates':[.542,.367],attendant:[.321,.431]},
  'mogao-96':{lap:[.515,.77],face:[.49,.176]},
  'mogao-158':{threshold:[.61,.59],cheek:[.421,.51],kasyapa:[.70,.46],assembly:[.54,.373],guardians:[.56,.46],royals:[.61,.508],folds:[.79,.68],east:[.515,.526]}
};
const ratios={'longmen-712':1920/1280,'maijishan-13':2400/1802,'longmen-435':1280/853,'longmen-1387':1280/853,'mogao-96':1280/850};
function imageAnchor(c,d,panel){
  const point=readingPoints[c.id]?.[d.id],center=panel.center.slice();
  if(!point)return center;
  const ratio=panel.image.width&&panel.image.height?panel.image.width/panel.image.height:ratios[c.id];
  if(!ratio)return center;
  const w=Math.min(panel.width,panel.height*ratio),h=w/ratio;
  const u=(point[0]-.5)*w,v=(.5-point[1])*h;
  switch(panel.wall){
    case 'roof':center[0]+=u;center[2]+=v;break;
    case 'left':center[2]-=u;center[1]+=v;break;
    case 'right':center[2]+=u;center[1]+=v;break;
    case 'entry':center[0]-=u;center[1]+=v;break;
    default:center[0]+=u;center[1]+=v;
  }
  return center;
}
function generalLayout(c,photos,details) {
  const groups=new Map();
  const anchors=[];
  for(const [i,d] of c.details.entries()){
    const image=details[i];
    if(image){
      const key=image.src;
      if(!groups.has(key))groups.set(key,{image,wall:mounting(c,d),at:[]});
      groups.get(key).at.push(i);
    }else anchors[i]=d.anchor;
  }
  const reference=photos.filter(p=>!groups.has(p.src));
  // The gallery labels identify these as additional views of the work. They do
  // not assert that an unlocated image was photographed at a particular wall.
  for(const [i,image] of reference.slice(0,3).entries()){
    const used=[...groups.values()].map(g=>g.wall);
    const wall=['back','left','right'].find(x=>!used.includes(x));
    if(wall)groups.set(image.src,{image,wall,at:[],position:i});
  }
  const mounts=[...groups.values()];
  const panels=[];
  for(const wall of Object.keys(fronts)){
    const row=mounts.filter(g=>g.wall===wall);
    const lateral=wall==='left'||wall==='right';
    const span=lateral?c.depth:c.width;
    const ordinate=g=>g.at.length?mean(g.at.map(i=>c.details[i].anchor))[lateral?2:0]:0;
    row.sort((a,b)=>ordinate(a)-ordinate(b));
    row.forEach((group,j)=>{
      const division=span/row.length;
      const axis=division*(j+.5)-span/2;
      const verticalCenter=clamp(group.at.length?mean(group.at.map(i=>c.details[i].anchor))[1]:2.15,c.height*.32,c.height*.63);
      const center=lateral?[(wall==='left'?-1:1)*(c.width/2-.13),verticalCenter,-c.depth/2+axis]:
        wall==='roof'?[axis,c.height-.11,-c.depth*.48]:
        [axis,verticalCenter,wall==='entry'?-.14:-c.depth+.14];
      // Leave both sides of the entrance walkable even when it has a photograph.
      if(wall==='entry'){
        center[0]=(group.at.length && c.details[group.at[0]].anchor[0]<0?-1:1)*(c.width*.365);
      }
      const height=wall==='roof'?Math.min(c.depth*.64,division*.87):Math.max(1,Math.min(c.height*.76,2*Math.min(verticalCenter-.18,c.height-.14-verticalCenter)));
      const width=wall==='entry'?c.width*.23:division*.84;
      const mount=panel(wall,center,width,height,group.image);
      panels.push(mount);
      for(const i of group.at)anchors[i]=imageAnchor(c,c.details[i],mount);
    });
  }
  return {panels,anchors};
}
function fengxian(c,photos){
  const west=photos.find(p=>p.src.endsWith('fengxian/west.webp')), north=photos.find(p=>p.src.endsWith('fengxian/north.webp')),south=photos.find(p=>p.src.endsWith('fengxian/south.webp'));
  const w=34,h=w*2133/3200,y=2.95+h/2,zw=-38.5;
  const nw=17.6,nh=nw*.75,ny=3+nh/2,nz=-28.9;
  // Normalized locations measured on each site's photograph, origin top left.
  const frontPoint=(u,v)=>[(u-.5)*w,y+(.5-v)*h,zw+.025];
  return {panels:[
    panel('back',[0,y,zw],w,h,west),panel('right',[17.64,ny,nz],nw,nh,north),
    panel('left',[-17.64,8.88,nz],17.6,17.6/1.5,south)
  ],anchors:[frontPoint(.495,.565),frontPoint(.38,.218),frontPoint(.495,.545),frontPoint(.495,.411),frontPoint(.50,.785),frontPoint(.685,.535),[17.61,ny+(.50-.48)*nh,nz+(.632-.5)*nw]]};
}
function nirvana(c,details) {
  const panels=[],anchors=c.details.map(d=>d.anchor.slice());
  const specs=[
    [['threshold','cheek'],'back',[-4.5,2.18,-5.46],8.15,3.15],
    [['folds'],'back',[4.45,2.14,-5.48],7.1,3.01],
    [['kasyapa'],'left',[-9.46,2.65,-6.46],5.75,3.9],
    [['assembly'],'back',[-4.45,2.81,-10.09],8.05,4.85],
    [['guardians'],'back',[4.55,2.81,-10.09],8.05,4.85],
    [['royals'],'right',[9.44,2.65,-6.43],5.75,3.92],
    [['east'],'entry',[4.75,2.55,-.13],5.2,3.65]
  ];
  for(const [ids,wall,center,width,height] of specs){
    const indices=ids.map(id=>c.details.findIndex(d=>d.id===id)).filter(i=>i>=0);
    const images=[...new Map(indices.filter(i=>details[i]).map(i=>[details[i].src,details[i]])).values()];
    if(!images.length)continue;
    for(const [j,image] of images.entries()){
      const point=center.slice();
      if(images.length>1)point[0]+=(j-.5)*width/2;
      const mount=panel(wall,point,width/images.length,height,image);
      panels.push(mount);
      for(const i of indices.filter(i=>details[i]?.src===image.src))anchors[i]=imageAnchor(c,c.details[i],mount);
    }
  }
  return {panels,anchors};
}
function includeDocumentWall(c,layout,details) {
  const entries=c.details.map((detail,index)=>({detail,index})).filter(entry=>!details[entry.index]);
  if(!entries.length)return;
  const hasPhotos=layout.panels.length>0;
  const used=new Set(layout.panels.map(p=>p.wall));
  const freeWall=['back','left','right'].find(wall=>!used.has(wall));
  const wall=freeWall||'entry';
  const lateral=wall==='left'||wall==='right';
  const wallSpan=lateral?c.depth:c.width;
  const width=Math.min(hasPhotos?3.45:6.60,wall==='entry'?wallSpan*.22:wallSpan*.79);
  const height=Math.min(c.height*.78,width*(entries.length>3?.69:.62));
  const centerY=Math.max(height*.5+.27,Math.min(2.38,c.height*.46));
  const center=wall==='back'?[0,centerY,-c.depth+.09]:
    wall==='entry'?[c.width*.37,centerY,-.075]:
    [(wall==='left'?-1:1)*(c.width/2-.09),centerY,-c.depth*.375];
  layout.document={wall,width,height,center,entries};
  for(const [row,{index}] of entries.entries()){
    const p=center.slice();
    // The typography uses the same normalized baselines as these anchors.
    p[1]+=height*(.50-(.45+(row+.5)*.48/entries.length));
    layout.anchors[index]=p;
  }
}
export function chamberLayout(c){
  if(built.has(c))return built.get(c);
  const photos=chamberPhotos(c),details=c.details.map((d,i)=>evidenceAt(c,i));
  let layout;
  if(c.id==='longmen-1280')layout=fengxian(c,photos);
  else if(c.id==='mogao-158')layout=nirvana(c,details);
  else if(c.id==='yungang-20'||c.spaceType==='studio')layout={panels:[],anchors:c.details.map(d=>d.anchor)};
  else layout=generalLayout(c,photos,details);
  if(c.id!=='yungang-20'&&c.spaceType!=='studio')includeDocumentWall(c,layout,details);
  built.set(c,layout);
  return layout;
}
export function displayAnchor(c,index){
  return chamberLayout(c).anchors[index]||c.details[index].anchor;
}
