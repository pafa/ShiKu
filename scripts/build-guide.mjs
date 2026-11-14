import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {evidenceFor} from '../object-evidence.js';
import {readingRoom} from '../story-archive.js';
import {detailImages,institutionalViewers,workViewers} from '../assets/authentic/detail-images.js';
import {mediaLabel} from '../authentic-display.js';
import {chamberPhotos} from '../chamber-evidence.js';
import {collectionScans,originalCaveResource} from '../collection-scans.js';
import {halls, sites, works} from '../dynasty-exhibition.js';
import {plans, court, threshold, wallStations} from '../building-plan.js';

import {wings,caves,toWorld,caveDoorWidth} from '../cave-plan.js';
import {chaptersFor, tours} from '../curator-routes.js';

const kindLabels={shrine:'佛龛',architecture:'窟前建筑',hall:'殿堂窟',cliff:'摩崖造像',sculpture:'窟内造像',inscription:'题刻与碑记'};
const out = name => new URL('../' + name, import.meta.url);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));
const number = n => String(n).padStart(2, '0');
const n = value => Number(value.toFixed(2));
const siteInk = Object.fromEntries(sites.map((site,i) => [site.id,['#695345','#92563e','#4f6961','#796738'][i]]));
const count = (hall,comp) => hall.scenes.filter(scene => scene.crossPeriod === comp).length;
const guideId = (hall,station) => hall.id + '-station-' + number(station + 1);

const localLink=(url,label)=>'<a href="'+escape(url)+'">'+escape(label)+' →</a>';
const totalStations=halls.reduce((sum,hall)=>sum+hall.scenes.length,0);
const comparisonTotal=halls.reduce((sum,hall)=>sum+count(hall,true),0);
const ext=(url,label)=>'<a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">'+escape(label)+' ↗</a>';
function typeSummary(items){
  const counts=new Map();
  for(const work of items){const type=work.objectType||'洞窟与龛像';counts.set(type,(counts.get(type)||0)+1);}
  return [...counts].map(([type,n])=>type+' '+n).join('　·　');
}
function line(x1,y1,x2,y2,attrs='') {
  return '<line x1="'+n(x1)+'" y1="'+n(y1)+'" x2="'+n(x2)+'" y2="'+n(y2)+'" '+attrs+'/>';
}
function text(x,y,value,size,attrs='') {
  return '<text x="'+n(x)+'" y="'+n(y)+'" font-size="'+size+'" '+attrs+'>'+escape(value)+'</text>';
}
function rect(x,y,w,h,attrs='') {
  return '<rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" '+attrs+'/>';
}
function dot(x,y,r,attrs='') {
  return '<circle cx="'+n(x)+'" cy="'+n(y)+'" r="'+r+'" '+attrs+'/>';
}
const codeFor=c=>'窟 '+number(caves.indexOf(c)+1);
const shortSite={yungang:'云冈',mogao:'莫高',longmen:'龙门',maijishan:'麦积山'};
const caveName=c=>c.spaceName||shortSite[c.work.siteId]+c.work.number.replace(/^第/,'');
const caveAnchor=c=>'cave-'+c.id;
const detailAnchor=(c,d)=>caveAnchor(c)+'-mark-'+d.id;
const enterCave=(c,d)=>'index.html?cave='+encodeURIComponent(c.id)+(d?'&detail='+encodeURIComponent(d.id):'');
const detailsTotal=caves.reduce((sum,c)=>sum+c.details.length,0);
const allFloorBounds=(plan,wing)=>[
 {x0:plan.centerX-plan.halfWidth,x1:plan.centerX+plan.halfWidth,z0:plan.centerZ-plan.halfDepth,z1:plan.centerZ+plan.halfDepth},
 wing.terrace,...wing.caves.map(c=>c.floorBox)];
function bounds(list){
 return {x0:Math.min(...list.map(r=>r.x0)),x1:Math.max(...list.map(r=>r.x1)),z0:Math.min(...list.map(r=>r.z0)),z1:Math.max(...list.map(r=>r.z1))};
}
function spaceRect(f,P,attrs){
 const a=P(f.x0,f.z0),b=P(f.x1,f.z1);
 return rect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y),attrs);
}
function wall(P,x1,z1,x2,z2,attrs){
 const a=P(x1,z1),b=P(x2,z2);return line(a.x,a.y,b.x,b.y,attrs);
}
function cutWall(P,x,z0,z1,doors,attrs){
 const ranges=doors.map(d=>[Math.max(z0,d.z-d.width/2),Math.min(z1,d.z+d.width/2)]).filter(([a,b])=>a<b).sort((a,b)=>a[0]-b[0]);
 let last=z0,out='';for(const [a,b] of ranges){if(a>last)out+=wall(P,x,last,x,a,attrs);last=Math.max(last,b);}
 if(last<z1)out+=wall(P,x,last,x,z1,attrs);return out;
}
function shell(plan,P){
 const wing=wings[plan.index],x0=plan.centerX-plan.halfWidth,x1=plan.centerX+plan.halfWidth,z0=plan.centerZ-plan.halfDepth,z1=plan.centerZ+plan.halfDepth;
 const inner=threshold(plan).x,outer=wing.outer,pen='stroke="#615649" stroke-width="2.7" stroke-linecap="square"';
 return spaceRect({x0,x1,z0,z1},P,'fill="'+plan.color+'" fill-opacity=".22"')+
  wall(P,x0,z0,x1,z0,pen)+wall(P,x0,z1,x1,z1,pen)+
  cutWall(P,inner,z0,z1,[{z:plan.centerZ,width:court.doorHalfWidth*2}],pen)+cutWall(P,outer,z0,z1,wing.gates,pen);
}
function caveWing(wing,P,links=false){
 const out=[spaceRect(wing.terrace,P,'fill="#cdba92" fill-opacity=".62" stroke="#a58e64" stroke-width="1"')];
 for(const gate of wing.gates){
  const a=P(wing.outer,gate.z),b=P(wing.entryX,gate.z);
  out.push(line(a.x,a.y,b.x,b.y,'stroke="#987544" stroke-width="1.5" stroke-dasharray="2.5 2"'));
 }
 for(const c of wing.caves){
  const f=c.floorBox,door=c.mouth,back=wing.plan.side<0?f.x0:f.x1,pen='stroke="#716453" stroke-width="1.9"';
  const middle=P((f.x0+f.x1)/2,(f.z0+f.z1)/2),hue=siteInk[c.work.siteId];
  const open=links?'<a href="#'+caveAnchor(c)+'" aria-label="'+escape('查看'+caveName(c)+'构造与故事')+'">':'<g>';
  out.push(open,'<title>'+escape(c.work.siteName+' '+c.work.number+' · '+c.work.title)+'</title>',
   spaceRect(f,P,'fill="'+hue+'" fill-opacity=".12"'),wall(P,back,f.z0,back,f.z1,pen),wall(P,back,f.z0,door.x,f.z0,pen),wall(P,back,f.z1,door.x,f.z1,pen),
   cutWall(P,door.x,f.z0,f.z1,[{z:door.z,width:caveDoorWidth(c)}],pen));
  if(!links){
   out.push(text(middle.x,middle.y-3,caveName(c),13,'text-anchor="middle" fill="'+hue+'" font-weight="bold"'),text(middle.x,middle.y+16,c.details.length+' 点',11,'text-anchor="middle" fill="#756952"'));
  }else{
   // The title is near the far wall; numbered stand positions remain available on the floor.
   const name=P(back+(door.x-back)*.14,(f.z0+f.z1)*.5);
   out.push(text(name.x,name.y,caveName(c),12,'text-anchor="middle" font-weight="bold" fill="'+hue+'" stroke="#ede4d3" stroke-width="3.5" paint-order="stroke"'));
  }
  out.push(links?'</a>':'</g>');
  if(links)c.details.forEach((d,i)=>{
   const place=toWorld(c,d.stand[0],0,d.stand[1]),pt=P(place.x,place.z);
   out.push('<a href="#'+detailAnchor(c,d)+'" aria-label="'+escape(caveName(c)+' · '+d.title)+'"><title>'+escape(d.title)+'</title>',
   dot(pt.x,pt.y,6,'fill="#f6e6c5" stroke="#7f653c" stroke-width="1.2"'),text(pt.x,pt.y+3,i+1,9,'text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" fill="#573e27"'),'</a>');
  });
 }
 return out.join('');
}
function stationMarks(hall,plan,P,opts={}) {
  const {radius=7.3, font=9.2, inset=1.07, links=false}=opts;
  return wallStations(plan,hall.scenes.length).map((station,i)=>{
    const s=hall.scenes[i],color=siteInk[s.siteId],at=P(station.x,station.z+station.inwardZ*inset);
    const floorA=P(station.x-station.width/2,station.z),floorB=P(station.x+station.width/2,station.z);
    const label=s.siteName+' '+s.number+' · '+s.title+(s.crossPeriod?'（对照）':'（主展）');
    const marker=line(floorA.x,floorA.y,floorB.x,floorB.y,'stroke="'+color+'" stroke-width="3.8"')+
      dot(at.x,at.y,radius,'fill="'+(s.crossPeriod?'#fbf5e8':color)+'" stroke="'+color+'" stroke-width="1.45"'+(s.crossPeriod?' stroke-dasharray="2.6 1"':''))+
      text(at.x,at.y+font*.33,number(i+1),font,'text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" fill="'+(s.crossPeriod?color:'#fff7e9')+'"');
    const open=links?'<a href="#'+guideId(hall,i)+'" aria-label="'+escape(label)+'">':'<g>';
    return open+'<title>'+escape(label)+'</title>'+marker+(links?'</a>':'</g>');
  }).join('');
}
function compass(x,y,length,horizontal) {
  const dx=horizontal?length:0,dy=horizontal?0:-length;
  const x2=x+dx,y2=y+dy;
  const head=horizontal?'M'+(x2-10)+' '+(y2-4)+'l10 4-10 4':'M'+(x2-4)+' '+(y2+10)+'l4 -10 4 10';
  return line(x,y,x2,y2,'stroke="#463a2c" stroke-width="2"')+
    '<path d="'+head+'" fill="none" stroke="#463a2c" stroke-width="2"/>'+
    text(horizontal?x+length/2:x,horizontal?y-8:y-length-7,'北',14,'text-anchor="middle"');
}
function scaleBar(x,y,metres,pixels) {
  return rect(x,y,pixels/2,4,'fill="#695c49"')+rect(x+pixels/2,y,pixels/2,4,'fill="#cebfa4" stroke="#695c49" stroke-width=".8"')+
    text(x,y-7,'0',12)+text(x+pixels,y-7,metres+' m',12,'text-anchor="end"');
}
const siteLegend = (x,y) => sites.map((site,i)=>{
  const at=x+i*104;return dot(at,y-4,5,'fill="'+siteInk[site.id]+'"')+text(at+11,y,site.name,15);
}).join('');
function totalPlan() {
  // The long court reads from left to right; both world axes use the same scale.
  const scale=12.5, left=100, top=170;
  const extents=bounds(wings.flatMap(w=>allFloorBounds(w.plan,w)));
  const west=Math.min(-court.halfWidth,extents.x0),east=Math.max(court.halfWidth,extents.x1);
  const south=Math.max(court.south,extents.z1),north=Math.min(court.north,extents.z0);
  const width=Math.ceil((south-north)*scale+2*left), bottom=top+(east-west)*scale+110, height=Math.ceil(bottom+277);
  const P=(x,z)=>({x:left+(south-z)*scale,y:top+55+(x-west)*scale});
  const start=P(0,court.south).x,end=P(0,court.north).x,axis=P(0,0).y;
  const out=['<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-labelledby="mt md"><title id="mt">石窟博物馆总平面</title><desc id="md">北向右，西在上，东在下。左端是南面到达区。实心编号是主展，空心是跨期对照。每间时代馆外另有崖前步廊及可步入的窟室，各段依同一虚拟建筑的坐标绘制。</desc><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M0 25V0h25" fill="none" stroke="#cfc3ac" stroke-width=".55"/></pattern></defs>'];
  out.push(rect(0,0,width,height,'fill="#f2ecde"'),rect(22,22,width-44,height-44,'fill="none" stroke="#a99981"'),'<g font-family="Songti SC,STSong,Noto Serif CJK SC,serif" fill="#3f3529">');
  out.push(text(65,87,'石窟博物馆 · 总平面',43,'letter-spacing="4"'),text(67,130,'沿中庭选馆，经过展墙，穿过外侧门抵达崖前步廊与窟口。',21),
    text(width-65,80,halls.length+' 座展馆　／　'+totalStations+' 个展位',25,'text-anchor="end"'),text(width-65,122,'可步入 '+caves.filter(c=>!c.spaceType).length+' 处窟室与一间书房　·　'+detailsTotal+' 个驻足点',19,'text-anchor="end" fill="#776b58"'));
  out.push(rect(54,top,width-108,bottom-top,'fill="url(#grid)" stroke="#d4c8b0"'));
  const y0=P(-court.halfWidth,0).y,y1=P(court.halfWidth,0).y;
  out.push(rect(start,y0,end-start,y1-y0,'fill="#d6cbaf" fill-opacity=".61"'));
  for(const side of [-1,1]){
    const y=P(side*court.halfWidth,0).y;let from=start;
    for(const plan of plans.filter(p=>p.side===side).sort((a,b)=>b.centerZ-a.centerZ)){
      const a=P(0,plan.centerZ+court.doorHalfWidth).x,b=P(0,plan.centerZ-court.doorHalfWidth).x;
      out.push(line(from,y,a,y,'stroke="#665c4d" stroke-width="2.2"'));from=b;
    }
    out.push(line(from,y,end,y,'stroke="#665c4d" stroke-width="2.2"'));
  }
  out.push(line(start,y0,start,y1,'stroke="#685d4c" stroke-width="2.2"'),line(start,axis,end,axis,'stroke="#ac8351" stroke-width="1.7" stroke-dasharray="5 6"'),line(end,y0,end,y1,'stroke="#685d4c" stroke-width="2.2"'));
  for(const [i,plan] of plans.entries()){
    const hall=halls[i],center=P(plan.centerX,plan.centerZ),door=threshold(plan),gate=P(door.x,door.z),side=plan.side;
    out.push('<g data-room="'+hall.id+'"><title>'+escape(hall.name+' · '+plan.title)+'</title>',caveWing(wings[i],P),shell(plan,P),stationMarks(hall,plan,P));
    out.push(line(gate.x,axis+side*7,gate.x,gate.y+side*7,'stroke="#946937" stroke-width="1.8" stroke-dasharray="3.5 3"'));
    out.push('<path d="M'+n(gate.x-3.6)+' '+n(gate.y+side*3)+'l3.6 '+(side*5)+' 3.6 '+(-side*5)+'" fill="none" stroke="#946937" stroke-width="1.6"/>');
    out.push(text(center.x,center.y-14,number(i+1)+'　'+hall.name,20,'text-anchor="middle" font-weight="600"'),
      text(center.x,center.y+12,plan.title,16,'text-anchor="middle"'),text(center.x,center.y+38,'主展 '+count(hall,false)+' · 对照 '+count(hall,true),14,'text-anchor="middle" fill="#71624d"'),'</g>');
  }
  out.push(text(start+8,axis-10,'南端到达区',14),text(end-8,axis+23,'北端庭窗',14,'text-anchor="end"'),
    text(P(0,(plans[0].centerZ+plans[2].centerZ)/2).x,axis+5,'采光中庭',15,'text-anchor="middle" stroke="#e2d8c2" stroke-width="5" paint-order="stroke"'));
  out.push(compass(width-177,top+35,55,true),scaleBar(78,bottom-14,10,scale*10));
  out.push(text(68,bottom+48,'石窟遗址',22,'font-weight="600"'),siteLegend(230,bottom+47),dot(744,bottom+40,8,'fill="#695345"'),text(762,bottom+47,'实心号 · 主展',17),
    dot(944,bottom+40,8,'fill="none" stroke="#695345" stroke-width="2" stroke-dasharray="3 1.5"'),text(962,bottom+47,'空心号 · 跨期对照',17),
    text(1244,bottom+47,'短线为展墙。外侧浅色带为崖前步廊，窟名旁标驻足点数。',17));
  const doorRows=[...new Set(plans.map(p=>p.centerZ))].sort((a,b)=>b-a);
  out.push(line(64,bottom+74,width-64,bottom+74,'stroke="#b7a68c"'));
  doorRows.forEach((z,i)=>{
    const x=72+i*(width-140)/doorRows.length;
    const names=plans.filter(p=>p.centerZ===z).map(p=>number(p.index+1)+' '+halls[p.index].name.replace(/馆$/,'')).join(' · ');
    out.push(text(x,bottom+112,'第 '+(i+1)+' 排门',15,'fill="#7b6b53"'),text(x,bottom+149,names,22));
  });
  out.push(text(68,bottom+213,'总图中的窟室轮廓表示可行走范围。各馆平面可查驻足点的实际站位，逐窟说明附有史料和重建依据。',18),'</g></svg>');
  return out.join('\n');
}
function detailPlan(hall,plan) {
 const wing=wings[plan.index],box=bounds(allFloorBounds(plan,wing)),scale=12.35;
 const margin=48,W=Math.ceil((box.x1-box.x0)*scale+margin*2+28),H=Math.ceil((box.z1-box.z0)*scale+margin*2+25);
 const P=(x,z)=>({x:margin+14+(x-box.x0)*scale,y:margin+(z-box.z0)*scale});
 const gate=threshold(plan),at=P(gate.x,gate.z),mid=P(plan.centerX,plan.centerZ),side=plan.side;
 return '<svg class="room-plan" style="width:'+W+'px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+escape(hall.name+'、崖前步道和相连的窟室，北向上')+'">'+
  rect(0,0,W,H,'fill="#f0e8d9"')+caveWing(wing,P,true)+shell(plan,P)+
  rect(at.x+(side>0?-10:0),at.y-court.doorHalfWidth*scale,10,2*court.doorHalfWidth*scale,'fill="#cab68e"')+
  text(at.x-side*13,at.y+4,side>0?'廊 →':'← 廊',12,'text-anchor="'+(side>0?'end':'start')+'" fill="#776344"')+
  stationMarks(hall,plan,P,{radius:7.9,font:9.4,inset:1.11,links:true})+
  text(mid.x,mid.y-2,plan.title,21,'text-anchor="middle" fill="#4a3e2f"')+text(mid.x,mid.y+22,'中庭'+(side<0?'西':'东')+'翼　／　'+wing.caves.length+' 处可进入空间',13,'text-anchor="middle" fill="#74654e"')+
  compass(29,57,21,false)+scaleBar(30,H-16,5,5*scale)+'</svg>';
}
function caveTexts(wing){
 const cards=wing.caves.map(c=>{
  const links=c.sources.map(s=>ext(s.url,s.label)).join('　');
  const evidence=chamberPhotos(c);const medium=c.id==='yungang-20'?'原址局部摄影测量与实拍照片':evidence.length?'本窟收录 '+evidence.length+' 幅实物或历史图版':'本窟以考察记录展出';
  const parts=c.details.map((d,i)=>'<li id="'+detailAnchor(c,d)+'"><small>驻足点 '+number(i+1)+'</small><h5>'+escape(d.title)+'</h5><p>'+escape(d.text)+'</p><div class="sources">'+localLink(enterCave(c,d),'走到这个细节')+'　'+ext(d.source,'内容出处')+'</div></li>').join('');
  return '<div class="cave-record" id="'+caveAnchor(c)+'"><small>'+escape(c.work.siteName+' · '+c.work.number+'　／　'+c.work.era)+'</small><h4>'+escape(c.work.title)+'</h4><p>'+escape(c.orientation)+'</p><p class="caption">'+escape(kindLabels[c.kind]||c.kind)+'　／　'+medium+'</p><p>'+localLink(c.experience?'index.html?experience='+encodeURIComponent(c.id):enterCave(c),c.experience?'进入体验':'进入窟室')+'</p><ol class="cave-stops">'+parts+'</ol><p class="caption">'+links+'</p></div>';
 }).join('');
 return '<div class="cave-register"><h3>走出展厅，沿崖入窟</h3><p>从展厅外侧的门进入步廊。本翼可步入 '+wing.caves.length+' 处空间，设 '+wing.caves.reduce((n,c)=>n+c.details.length,0)+' 个驻足点。</p><nav class="chapters" aria-label="本翼窟室">'+wing.caves.map(c=>'<a href="#'+caveAnchor(c)+'">'+escape(caveName(c))+'</a>').join('')+'</nav>'+cards+'</div>';
}
function section(hall,i) {
  const plan=plans[i],stations=wallStations(plan,hall.scenes.length),side=plan.side<0?'西':'东';
  const mate=plans.find(p=>p.centerZ===plan.centerZ&&p.side!==plan.side);
  const rows=[...new Set(plans.map(p=>p.centerZ))].sort((a,b)=>b-a);
  const description='从南端前厅向北，到第'+(rows.indexOf(plan.centerZ)+1)+'排门转向'+side+'侧。'+(mate?'隔廊正对'+halls[mate.index].name+'。':'此处为庭廊北端的单侧展厅。');
  function article(scene,index) {
    const wall=stations[index].inwardZ>0?'北墙':'南墙',evidence=evidenceFor(scene),image=evidence.images[0];
    const anchor=guideId(hall,index);
    const sourceLinks=[...(scene.sources||[]),...(evidence.references||[])].filter(s=>s.url!==scene.source&&s.url!==scene.mediaPage&&s.url!==scene.credit?.source);
    const metadata=[scene.era,scene.holding,scene.accession?'登记号 '+scene.accession:''].filter(Boolean).map(escape).join('　·　');
    const credit=image?'<div class="credit">'+escape(mediaLabel(image))+' · '+ext(image.source,image.credit)+' · '+escape(image.license)+'</div>':'<div class="credit">'+escape(evidence.reason)+'</div>';
    const original=workViewers[scene.id]?ext(workViewers[scene.id],'进入数字敦煌全景'):(!image&&evidence.viewer)?ext(evidence.viewer,evidence.viewerLabel||'原机构图版与著录'):'';
    const picture=image?'<a class="image" href="'+escape(image.detailSrc||detailImages[image.src]||image.src)+'" target="_blank" rel="noopener"><img src="'+escape(image.src)+'" alt="'+escape(image.caption)+'" loading="lazy" decoding="async"></a>' :evidence.officialViews?.length?'<div class="credit">'+ext(evidence.officialViews[0].url,evidence.officialViews[0].label)+'</div>':'<div class="credit">文献记录</div>';
    const newReadings=(readingRoom[scene.id]?.chapters||[]).filter(ch=>ch.source?.url);
    const readings=newReadings.length ? '<details><summary>展品细读</summary>'+newReadings.map(ch=>'<h5>'+escape(ch.title)+'</h5><p>'+escape(ch.body)+'</p>'+ext(ch.source.url,ch.source.label)).join('')+'</details>' : '';
    return '<li id="'+anchor+'"><article>'+picture+'<div class="reading">'+
      '<small>展位 '+number(index+1)+' · '+wall+'　／　'+(scene.crossPeriod?'跨期对照':'主展')+'　／　'+escape(scene.siteName)+' · '+escape(scene.number)+'</small><strong>'+escape(scene.title)+'</strong><span class="era">'+metadata+'</span><p>'+escape(scene.periodNote)+'</p>'+localLink('index.html?structure='+scene.id,'看原物与资料')+
      (scene.crossPeriod&&scene.comparisonNote&&scene.comparisonNote!==scene.periodNote?'<p class="compare">'+escape(scene.comparisonNote)+'</p>':'')+
      readings+'<div class="sources">'+ext(scene.source,scene.sourceName||'逐件来源')+(scene.mediaPage&&scene.mediaPage!==scene.source?'　'+ext(scene.mediaPage,scene.mediaPageName||'机构图版'):'')+sourceLinks.map(s=>'　'+ext(s.url,s.label)).join('')+'</div>'+credit+(institutionalViewers[image?.src]?ext(institutionalViewers[image.src],'在来源处看高清原图'):'')+original+'</div></article></li>';
  }
  const primary=hall.scenes.filter(s=>!s.crossPeriod), distribution=sites.map(site=>{
    const main=primary.filter(s=>s.siteId===site.id).length;
    const comp=hall.scenes.filter(s=>s.siteId===site.id&&s.crossPeriod).length;
    return site.name+' '+main+'＋'+comp;
  }).join('　／　');
  const chapters=chaptersFor(hall),tour=tours[hall.id];
  const navigation=chapters.map((c,j)=>'<a href="#'+hall.id+'-chapter-'+(j+1)+'">'+escape(c.theme)+' <small>'+c.items.length+'</small></a>').join('');
  const contents=chapters.map((ch,j)=>{
    const entries=[...ch.items].sort((a,b)=>(a.work.id===ch.id?-1:b.work.id===ch.id?1:a.index-b.index));
    const links=entries.map(({work,index})=>'<a href="#'+guideId(hall,index)+'"><b>'+number(index+1)+'</b> '+escape(work.title)+'</a>').join('');
    return '<div class="chapter" id="'+hall.id+'-chapter-'+(j+1)+'"><small>第 '+(j+1)+' 章 · '+entries.length+' 个展位</small><h3>'+escape(ch.theme)+'</h3><p><strong>'+escape(ch.title)+'</strong>　'+escape(ch.note)+'</p><nav class="in-chapter" aria-label="'+escape(ch.theme)+'展品索引">'+links+'</nav><ol class="works">'+entries.map(({work,index})=>article(work,index)).join('')+'</ol></div>';
  }).join('');
  return '<section id="'+hall.id+'"><div class="room-heading"><div><small>展馆 '+number(i+1)+'　·　'+escape(hall.period)+'</small><h2>'+escape(hall.name)+'</h2></div><span>'+hall.scenes.length+' 个展位　／　主展 '+primary.length+'　对照 '+count(hall,true)+'</span></div>'+
    '<p class="route-title">'+escape(tour.title)+'</p><p>'+escape(tour.intro)+'</p><p class="caption">'+escape(hall.focus)+'　／　'+ext(hall.source,'本馆资料')+'</p>'+
    '<h3>展馆平面 · '+escape(plan.title)+'</h3><p>'+escape(description)+' '+escape(plan.description)+'</p><p class="caption">展厅东西 '+n(plan.halfWidth*2)+' 米，南北 '+n(plan.halfDepth*2)+' 米。面向中庭的门净宽 '+(court.doorHalfWidth*2)+' 米。</p>'+
    '<div class="room-pan" tabindex="0" aria-label="可横向滚动的展馆平面">'+detailPlan(hall,plan)+'</div><p class="caption">北向上。彩色圆点通往展墙图版，窟室内的金色小号通往驻足点故事。窄屏可左右滑动。</p>'+caveTexts(wings[i])+
    '<p class="caption">主展类型　／　'+escape(typeSummary(primary))+'<br>各遗址主展＋对照　／　'+escape(distribution)+'</p>'+
    '<nav class="chapters" aria-label="'+escape(hall.name)+'策展章节">'+navigation+'</nav>'+contents+
    '<p class="endnote">'+escape(tour.end)+'</p><a class="totop" href="#map">回到总平面 ↑</a></section>';
}
const contentLicense = 'https://creativecommons.org/licenses/by/4.0/';
const rightsNotice = '原创导览文字与平面图由 ShiKu 以 CC BY 4.0 提供。第三方照片、馆藏著录及引文沿用各件标明的条款。';
const svg=totalPlan().replace('</title>','</title><metadata>ShiKu · CC BY 4.0 · '+contentLicense+'</metadata>');
fs.writeFileSync(out('exhibition-map.svg'),svg);
const css=`
*{box-sizing:border-box}html{scroll-behavior:smooth;background:#f5f0e5;color:#362e26;font-family:'Songti SC','STSong',serif}body{max-width:1160px;margin:auto;padding:26px clamp(15px,4vw,55px) 66px}header{border-bottom:1px solid #ad9676;padding:10px 0 20px}h1{font-size:clamp(28px,4vw,48px);font-weight:500;letter-spacing:.10em;margin:9px 0 12px}header p,section>p{line-height:1.85;font-size:16px}a{color:#6a4b32;text-underline-offset:3px}small,.credit,.era,.room-heading>span,.caption{font:12px/1.6 'PingFang SC',sans-serif;color:#796952}#map{width:100%;display:block;height:auto;margin:20px 0 5px}.room-plan{display:block;max-width:760px;width:100%;height:auto;margin:12px 0 6px}.room-plan a:hover circle,.room-plan a:focus-visible circle{stroke:#2a2014;stroke-width:3}nav{display:flex;flex-wrap:wrap;gap:7px;margin:20px 0 38px}nav a{border:1px solid #b9a68a;background:#faf6eb;padding:7px 11px;text-decoration:none;white-space:nowrap}section{scroll-margin:16px;border-top:2px solid #90795b;padding:25px 0 30px}.room-heading{display:flex;justify-content:space-between;align-items:center;gap:8px}.room-heading>span{white-space:nowrap}h2{font-size:31px;font-weight:500;letter-spacing:.08em;margin:5px 0}h3{font-size:18px;color:#705134;letter-spacing:.09em;margin:24px 0 12px}ol{padding:0;margin:0;list-style:none}li{border-top:1px solid #d0c3ad;scroll-margin:10px}li:target{background:#e8ddc8}article{display:grid;grid-template-columns:112px minmax(0,1fr);gap:19px;padding:15px 0}.image{width:112px;height:88px;display:grid;place-items:center;background:#e4dac8}.image img{width:100%;height:100%;object-fit:contain}.reading strong{display:block;font-size:19px;font-weight:600}.era{display:block;margin-top:2px}.reading p{line-height:1.7;margin:6px 0}.reading a{font-size:13px}.credit{margin-top:5px}.credit a{font-size:11px}.totop{display:block;text-align:right;margin-top:18px;font-size:13px}
@media(max-width:540px){body{padding:10px 14px 35px}article{grid-template-columns:72px minmax(0,1fr);gap:11px}.image{width:72px;height:72px}.reading strong{font-size:16px}.reading p{font-size:14px}.room-heading{align-items:flex-end}#map{margin:14px 0 4px}nav{gap:5px}nav a{font-size:13px;padding:6px 8px}}
.room-pan{max-width:100%;overflow:auto;scrollbar-width:thin;border:1px solid #d0c2a9;background:#f0e8d9}.room-pan .room-plan{max-width:none;max-height:none;display:block;margin:0 auto}.room-heading>span{white-space:normal;text-align:right}.route-title{font-size:22px;font-weight:600;margin-bottom:4px}.chapters,.in-chapter{display:flex;gap:6px;margin:16px 0 24px}.chapters a{border-color:#a38b6e}.in-chapter a{padding:4px 7px;white-space:normal;font-size:12px}.in-chapter b{font-variant-numeric:tabular-nums;color:#946739}.chapter{scroll-margin:16px;margin:28px 0 40px}.chapter h3{font-size:24px;margin:5px 0 8px}.chapter>p,.endnote{line-height:1.8}.endnote{border-inline-start:3px solid #a4885c;padding-inline-start:16px}.sources{line-height:1.85}.room-pan:focus-visible,a:focus-visible{outline:2px solid #79522e}.downloads{display:flex;gap:18px;flex-wrap:wrap}.compare{color:#775939}.image{display:grid;align-self:start}.reading .era{line-height:1.65}.reading{min-width:0;overflow-wrap:anywhere}
@media print{nav,.totop{display:none}body{max-width:none;padding:0}article,svg{break-inside:avoid}section{break-before:page}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;
const caveCss='.cave-register{margin:24px 0 36px}.cave-record{padding:15px 0 14px;border-top:1px solid #c4b59b;scroll-margin:18px}.cave-record h4{margin:6px 0 12px;font-size:23px}.cave-record p,.cave-register>p{line-height:1.8}.cave-stops{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:12px}.cave-stops li{background:#eee5d6;border:1px solid #d3c6b0;padding:13px 15px}.cave-stops h5{font-size:16px;margin:4px 0 8px}.cave-stops p{font-size:14px;margin:4px 0 12px}.cave-stops .sources{font-size:12px}.cave-record:target,.cave-stops li:target{outline:2px solid #986d3f;outline-offset:3px}.cave-record nav{margin:10px 0}.cave-stops .sources>a{display:inline-block}';
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全馆平面与逐件导览｜石窟</title><style>'+css+caveCss+'</style></head><body><header><h1>全馆平面与逐件导览</h1><p>'+halls.length+' 座展厅共有 '+totalStations+' 个展位，陈列 '+works.length+' 项主展，另设 '+comparisonTotal+' 处跨期对照。穿过展厅外门，还能步入 '+caves.filter(c=>!c.spaceType).length+' 处窟室与一间双卷书房，沿 '+detailsTotal+' 个驻足点读故事。</p><p class="caption">主展类型　／　'+escape(typeSummary(works))+'</p></header><img id="map" src="exhibition-map.svg" alt="等比例虚拟建筑总平面，北向右。两侧展厅的实心与空心编号标示 '+totalStations+' 个展位。"><div class="downloads">'+localLink('index.html?experiences=1','八处体验入口')+ext('exhibition-map.svg','放大矢量总平面')+(fs.existsSync(out('exhibition-map.png')) || process.argv.includes('--png') ? ext('exhibition-map.png','高清 PNG') : '')+'</div><nav aria-label="跳至展馆">'+halls.map(h=>'<a href="#'+h.id+'">'+escape(h.name)+'</a>').join('')+'</nav>'+halls.map(section).join('')+'<footer><p>'+escape(rightsNotice)+' <a rel="license" href="'+contentLicense+'">许可条款</a></p></footer></body></html>';
fs.writeFileSync(out('exhibition-guide.html'),html);
// SVG and HTML need only Node. To export a PNG, use the project's installed sharp
// or pass its local module path in SHIKU_SHARP_MODULE when using a bundled runtime.
if(process.argv.includes('--png')){
  const sharp=createRequire(import.meta.url)(process.env.SHIKU_SHARP_MODULE||'sharp');
  await sharp(Buffer.from(svg),{density:128}).png().toFile(fileURLToPath(out('exhibition-map.png')));
}

// The catalogue lists the same admitted assets as the room and the digital desk.
const md = value => String(value || '').replaceAll('|','\\|').replaceAll('\n',' ');
const link = (text,url) => '['+md(text)+'](<'+url+'>)';
const inventory=['# 石窟 · 实物与图像目录','',rightsNotice+' [许可条款]('+contentLicense+')。','',
  '展览以本件文物照片、原址与历史摄影、馆藏数字图像及注明范围的摄影测量展示。馆方记录可用来核对身份、年代与来源。展览建筑和站位用于参观。',''];
const pictured = entries => entries.filter(work => evidenceFor(work).images.length > 0).length;
const withImages = pictured(works);
inventory.push('## 展墙图像覆盖','',
  '按展品去重，'+works.length+' 件藏品中有 '+withImages+' 件附展墙图像，'+(works.length-withImages)+' 件以文字展签陈列。下表按实际展位统计，含跨馆对照。馆外链接不计作展墙图片。','',
  '| 展厅 | 有图展位 | 文字展位 | 合计 |','| --- | ---: | ---: | ---: |');
for(const hall of halls){
  const count = pictured(hall.scenes);
  inventory.push('| '+hall.name+' | '+count+' | '+(hall.scenes.length-count)+' | '+hall.scenes.length+' |');
}
const stations = halls.flatMap(hall => hall.scenes);
const picturedStations = pictured(stations);
inventory.push('| **全馆展位** | **'+picturedStations+'** | **'+(stations.length-picturedStations)+'** | **'+stations.length+'** |','');
const contextOnly = works.filter(work => evidenceFor(work).images.length && evidenceFor(work).images.every(photo => photo.contextOnly));
if (contextOnly.length) inventory.push('其中 '+contextOnly.length+' 件标为同址参考图。'+contextOnly.map(work => '《'+work.title+'》').join('、')+'仅附同窟或遗址的参考图，图注标明所摄范围。','');
for(const site of sites){
  inventory.push('## '+site.name,'','| 作品 | 年代 | 展出依据 |','|---|---|---|');
  for(const work of works.filter(w=>w.siteId===site.id)){
    const entry=evidenceFor(work),scan=collectionScans[work.id],official=originalCaveResource(work);
    const proof=entry.images.map(image=>link(mediaLabel(image)+' · '+image.caption,image.src)+'　'+link(image.credit+' · '+image.license,image.source));
    if(scan)proof.unshift(link(scan.title,scan.source));
    if(official)proof.push(link('数字敦煌本窟',official));
    for(const ref of entry.references||[])proof.push(link(ref.label,ref.url));
    if(entry.viewer)proof.push(link(entry.viewerLabel||'发布机构图版',entry.viewer));
    proof.push(link(work.sourceName||'本件资料',work.source));
    if(!entry.images.length)proof.unshift(md(entry.reason));
    inventory.push('| '+link(work.number+' · '+work.title,'index.html?structure='+work.id)+' | '+md(work.era)+' | '+proof.join('<br>')+' |');
  }
  inventory.push('');
}
fs.writeFileSync(out('CATALOG.md'),inventory.join('\n'));
