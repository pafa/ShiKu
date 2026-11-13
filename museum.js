import * as editions from './assets/authentic/detail-images.js';
import {walkCompanion} from './walk-companion.js';
import {experienceRooms} from './experience-room.js';
import {caveVisit} from './cave-visit.js';
import {caveById,wings} from './cave-plan.js';
import {makeCollectionRoom} from './collection-room.js';
import {makeStoryWalk} from './story-walk.js';
import {plans} from './building-plan.js';
import {livePlan} from './live-plan.js';
import {createRoomAtlas} from './room-atlas.js';
import {presence,visit,selfRecord,observeVisit} from './shared-visit.js';
import {mountVisitAccount} from './visit-account.js';
import {halls,sites,works} from './dynasty-exhibition.js';
import {collectionScans} from './collection-scans.js';
import {workForDisplay,mediaLabel} from './authentic-display.js';
import {mountStructure} from './structure-desk.js';
import {VISITORS} from './visitor-roster.js';
import {makePanels} from './visit-panels.js';
import {readingRoom} from './story-archive.js';
const $=s=>document.querySelector(s),el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n};
const num=n=>String(n).padStart(2,'0'),routes=halls;
const sheet=$('#sheet'),detail=$('#detail'),sheetBody=$('#sheet-body'),stage=$('#detail-stage'),plate=$('#plate'),img=$('#artifact'),pins=$('#pins'),bubble=$('#bubble');
let r=0,n=0,near=null,hall=null,zoom=null,study=null,sheetType='',previousFocus=null;
let sceneReady=false,personEyes=false,visitorId=visit.profile.avatarId,here=0,walkDestination=null,closestWing=0;
let currentStop=-1,physicalCave=null,physicalTerrace=-1,webglUnavailable=false;
const remembered=routes.map(()=>0),mapPosition=livePlan($('#live-plan'));
let accountStatus=null;
const atlas=createRoomAtlas({
  onOpen:()=>hall?.setPaused(true),
  onClose:()=>hall?.setPaused(sheet.open||detail.open),
  onStructure:()=>panels.map()
});
function applyPresence(state){
  mapPosition.setPresence(state.snapshot);
  atlas.setStatus(state.status);
  atlas.setPresence(state.snapshot);
  hall?.setPresence(state.snapshot);
  accountStatus?.(state);
  const link=document.querySelector('.menu [data-action=map]');
  link.textContent=state.status==='online'?'访客地图 · '+state.snapshot.visitors.length:'访客地图';
  link.setAttribute('aria-label',state.status==='online'?'访客地图，'+state.snapshot.visitors.length+'人在馆':'访客地图，正在连接');
}
const current=()=>workForDisplay(routes[r].scenes[n]);
function switchView(eyes=!personEyes){hall?.setView(eyes)}
function viewUI(eyes){personEyes=eyes;const b=$('#view-mode');b.setAttribute('aria-pressed',String(eyes));b.textContent=eyes?'人眼 · 切到随行':'随行 · 切到人眼'}
async function swapPerson(id) {
  if (!hall || !await hall.setAppearance(id)) return false;
  visitorId = id;
  visit.profile.avatarId=id;presence.appearance(id);
  try { localStorage.setItem('shiku-visitor', id); } catch {}
  return true;
}
function returnAsVisitor(eyes) {
  previousFocus = $('#world canvas');
  switchView(eyes);
  stopSheet();
  // The native dialog's close event is queued. Accept a held walking key
  // immediately if it arrives between closing the picker and that next frame.
  if (!detail.open) {
    hall?.setPaused(false);
    previousFocus?.focus({preventScroll:true});
  }
}
function action(label,cb,cls){const b=el('button',cls,label);b.type='button';b.onclick=cb;return b}
function source(label,url){const a=el('a','source',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function stopSheet(){if(sheet.open)sheet.close()}
function setNear(station){
  near=station;const button=$('#near');
  button.hidden=!station||(r===station.hallIndex&&n===station.index&&!$('#exhibit').hidden);
  if(!station)return;
  const work=routes[station.hallIndex].scenes[station.index];
  const chapter=readingRoom[work.id]?.chapters.find(ch=>ch.source?.url);
  const lines=(chapter?.body || work.story || '').match(/[^。！？]+[。！？]?/u);
  button.replaceChildren(el('strong','',work.title+'　↗'));
  if(lines)button.append(el('span','near-reading',lines[0]));
  button.setAttribute('aria-label','查看'+work.title);
}
function neighbouring(){
  if(here<0)return closestWing;
  return here===8?7:here+(here%2===0?1:-1);
}
function journey(index){
  walkDestination=index;
  const link=$('#walk-link');link.textContent=index==null?'步行到'+routes[neighbouring()].name+' →':'停止步行 · '+(index<0?'中庭':routes[index].name);
}
function walk(index){
  stopSheet();if(!hall)return;
  $('#exhibit').hidden=true;hall.setPaused(false);hall.walkInto(index);
}
function locationChanged(index){
  here=index;trail.enter(index);caveUI.setHall(index);
  if(index>=0){r=index;n=remembered[index];draw(false);}
  else{
    $('#exhibit').hidden=true;$('#site-name').textContent='采光中庭';$('#site-location').textContent='中央步廊';
    $('.progressline').hidden=true;
  }
  setNear(null);journey(walkDestination);
}
function positionChanged(p,yaw,teleport=false){
  mapPosition(p,yaw,here);atlas.position(p);if(teleport)presence.move(p,{teleport:true});
  if(here<0){
    const nearest=plans.reduce((best,room)=>Math.hypot(room.centerZ-p.z,room.side*3.4-p.x)<Math.hypot(best.centerZ-p.z,best.side*3.4-p.x)?room:best);
    if(closestWing!==nearest.index){closestWing=nearest.index;journey(walkDestination);}
  }
}
let activePin=0,expanded=false,underWidth=0;
function restoreLabel(){if(bubble.parentNode!==plate)plate.append(bubble);delete bubble.dataset.side;underWidth=0;}
function showBubble(k,expand){restoreLabel();const s=current(),h=s.hotspots?.[k];activePin=k;expanded=expand;bubble.hidden=!s.image||!h;if(bubble.hidden){$('#pin-leader').style.display='none';return}$('#bubble-toggle').textContent='故事 · '+h.title+(expanded?'  −':'  ＋');$('#bubble-toggle').setAttribute('aria-expanded',String(expanded));$('#bubble-body').hidden=!expanded;$('#bubble-body').replaceChildren(el('p','',h.body));if(h.source)$('#bubble-body').append(source(h.sourceName||s.sourceName||'资料出处',h.source));pins.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===k&&expand)));requestAnimationFrame(setAnchor)}
function setAnchor(){const s=current();if(!img.naturalWidth||!s.image)return;const b=img.getBoundingClientRect(),p=plate.getBoundingClientRect(),scale=Math.min(b.width/img.naturalWidth,b.height/img.naturalHeight),w=img.naturalWidth*scale,hh=img.naturalHeight*scale;pins.querySelectorAll('button').forEach((pin,i)=>{const h=s.hotspots[i];pin.style.left=(b.left-p.left+(b.width-w)/2+h.x*w)+'px';pin.style.top=(b.top-p.top+(b.height-hh)/2+h.y*hh)+'px'});locateLabel(p)}
function locateLabel(p){
  const leader=$('#pin-leader'),pin=pins.children[activePin];leader.style.display='none';
  if(!pin||bubble.hidden||p.width<1)return;
  if(bubble.parentNode!==plate){
    if(Math.abs(underWidth-p.width)<2)return;
    restoreLabel();
  }
  const anchors=Array.from(pins.children,b=>({x:parseFloat(b.style.left),y:parseFloat(b.style.top),radius:b.offsetWidth/2}));
  const active=anchors[activePin];if(!active||!Number.isFinite(active.x+active.y))return;
  const w=bubble.offsetWidth,h=bubble.offsetHeight;
  const corners=[[p.width-w-8,8,'tr'],[8,8,'tl'],[p.width-w-8,p.height-h-8,'br'],[8,p.height-h-8,'bl']];
  function edge(left,top,point){
    const x=Math.max(left,Math.min(point.x,left+w)),y=Math.max(top,Math.min(point.y,top+h));
    return {x,y,d:Math.hypot(x-point.x,y-point.y)};
  }
  const choices=corners.map(([left,top,side])=>({side,...edge(left,top,active),
    clearance:Math.min(...anchors.map(a=>edge(left,top,a).d-a.radius))}));
  const pick=choices.find(c=>c.clearance>12)||choices.filter(c=>c.clearance>=2).sort((l,r)=>r.clearance-l.clearance)[0];
  if(!pick){
    underWidth=p.width;bubble.dataset.side='below';$('#story-under').append(bubble);return;
  }
  bubble.dataset.side=pick.side;if(!expanded)return;
  const pad=active.radius+1,sx=active.x+(pick.x-active.x)*pad/pick.d,sy=active.y+(pick.y-active.y)*pad/pick.d;
  leader.setAttribute('viewBox','0 0 '+p.width+' '+p.height);
  leader.firstElementChild.setAttribute('d','M'+sx.toFixed(1)+' '+sy.toFixed(1)+' L'+pick.x.toFixed(1)+' '+pick.y.toFixed(1));leader.style.display='block';
}
function makePins(s){pins.replaceChildren();(s.image?s.hotspots||[]:[]).forEach((h,i)=>{const pin=action('',()=>showBubble(i,true),'anchor');pin.setAttribute('aria-label','图中故事：'+h.title);pin.append(el('i'));pins.append(pin)});showBubble(0,matchMedia('(min-width: 1000px) and (min-height: 640px)').matches)}
new ResizeObserver(setAnchor).observe(plate);img.onload=setAnchor;
function locationLabel(){
  const at=hall?here:r;
  $('.progressline').hidden=at<0||!!physicalCave||physicalTerrace>=0;
  $('#site-name').textContent=physicalCave?(physicalCave.spaceName||physicalCave.work.number):physicalTerrace>=0?'崖前步廊':at<0?'采光中庭':routes[at].name;
  $('#site-location').textContent=physicalCave||physicalTerrace>=0?routes[at].name:at<0?'中央步廊':plans[at].title;
}
function draw(ex=true) {
  const s=current(),site=routes[r];
  locationLabel();
  $('#exhibit').hidden=!ex;
  $('#station-name').textContent=s.title;
  $('#count').textContent=num(n+1)+' / '+num(site.scenes.length);
  $('#progress').style.width=((n+1)/site.scenes.length*100)+'%';
  $('#ex-kind').textContent=mediaLabel(s.photo);
  $('#origin').textContent=(s.crossPeriod?'跨期对照 ／ ':'')+s.siteName+' ／ '+s.number+'　·　'+s.era;
  $('#ex-title').textContent=s.title;
  $('#ex-feature').textContent=s.crossPeriod?s.comparisonNote:s.feature;
  makePins(s);
  const record=$('#primary-record'),credit=$('#plate-credit');
  record.hidden=!!s.photo;img.hidden=!s.photo;credit.replaceChildren();
  if(s.photo) {
    img.alt=s.photo.caption;img.src=s.photo.src;
    credit.append(source(s.photo.credit+' · '+s.photo.license,s.photo.source),document.createTextNode(s.photo.caption));
  } else {
    img.removeAttribute('src');
    record.textContent=s.evidence.reason||'本件以原始著录展出。';
    credit.append(source(s.sourceName||'原始著录',s.source));
    if(editions.workViewers?.[s.id])credit.append(source('进入数字敦煌全景',editions.workViewers[s.id]));
  }
  $('#model-btn').hidden=!collectionScans[s.id]?.viewer;
  document.querySelector('[data-action=intoEx]').hidden=!caveById.has(s.id);
  document.querySelector('[data-action=structure]').textContent=s.photo?'看原物与细节 ↗':'查阅本件资料 ↗';
  $('.enlarge').hidden=!s.photo;
  document.querySelector('[data-action=prev]').disabled=n===0;
  document.querySelector('[data-action=next]').disabled=n===site.scenes.length-1;
  setNear(near);requestAnimationFrame(setAnchor);
}
function move(rr,nn,travel=true){
  if(!routes[rr]?.scenes[nn])return;
  if(travel)hall?.visit(rr,nn);
  r=rr;n=nn;remembered[rr]=nn;draw(true);trail.select(routes[r].scenes[n].id);
}
function hallway(index){
  stopSheet();
  if(hall){hall.enter(index);locationChanged(index);}
  else {r=index;n=0;draw(true);}
}
function modal(title,type,fn){if(!sheet.open){previousFocus=document.activeElement;sheet.showModal()}sheetType=type;sheet.dataset.sheet=type;$('#sheet-title').textContent=title;sheetBody.replaceChildren();fn(sheetBody);accountStatus=type==='person'?mountVisitAccount(sheetBody):null;accountStatus?.(visit);sheet.scrollTop=0;hall?.setPaused(true)}
const panels=makePanels({el,action,modal,source,routes,sites,works,visitors:VISITORS,selectedVisitor:()=>hall?.getAppearance(),
  initialVisitor:()=>sceneReady?null:visitorId,changeVisitor:swapPerson,canChangeVisitor:()=>Boolean(hall),startVisit:returnAsVisitor,
  currentPlace:()=>[here<0?closestWing:here,n],enterChamber:id=>caveUI.go(id),walkTo:walk,enterHall:hallway,enter:(rr,nn)=>{stopSheet();move(rr,nn)}});
function story(which=null){
  const s=current(), reading=readingRoom[s.id], chamber=caveById.get(s.id);
  modal(s.title,'story',body=>{
    body.append(el('div','meta',s.siteName+' ／ '+s.number+' · '+s.era),el('p','storytext',s.story));
    body.append(el('h3','subttl',s.photo?'从这里看':'在原址资料中找'),el('p','storytext',s.look));
    if(!s.photo)body.append(source(s.evidence.viewerLabel||'打开原机构资料',s.evidence.viewer||s.evidence.source||s.source));
    body.append(el('h3','subttl',s.crossPeriod?'为什么在这里对照':'年代与展馆'),
      el('p','storytext',s.crossPeriod?s.comparisonNote:s.periodNote));
    if(s.canonicalTitle)body.append(el('p','meta','原作题名　'+s.canonicalTitle));
    if(s.holding||s.accession)body.append(el('p','meta',[s.holding,s.accession].filter(Boolean).join('　／　')));
    if(chamber)body.append(action('走进'+s.siteName+s.number+'　→',()=>caveUI.go(chamber),'shelf-back'));
    const included=new Set([s.story?.trim(),s.look?.trim()]);
    for(const chapter of reading?.chapters||[]){
      if(included.has(chapter.body.trim()))continue;
      included.add(chapter.body.trim());
      body.append(el('h3','subttl',chapter.title),el('p','storytext',chapter.body));
      if(chapter.source?.url)body.append(source(chapter.source.label,chapter.source.url));
    }
    const hotspot=which==null?null:s.hotspots[which];
    if(hotspot)body.append(el('h3','subttl',hotspot.title),el('p','storytext',hotspot.body));
    const refs=new Map();
    refs.set(s.source,s.sourceName||'逐窟资料');
    const catalogue=s.mediaPage||s.viewUrl||s.panorama||s.officialView;
    if(catalogue)refs.set(catalogue,s.mediaPageName||'机构原始记录');
    for(const src of [...(reading?.sources||[]), ...(s.evidence.references||[])])refs.set(src.url,src.label);
    body.append(el('h3','subttl','查阅资料'));
    for(const [url,label] of refs)if(url)body.append(source(label,url));
    if(s.credit){
      body.append(el('h3','subttl','影像出处'),el('p','meta',[s.imageNote,s.credit.author,s.credit.license].filter(Boolean).join(' · ')),
        source('图像原始记录',s.credit.source),source('图像许可',s.credit.licenseUrl));
    }
  });
}
function guide(){modal('探索指南','guide',body=>{body.append(el('p','storytext','九座时代展馆通过中庭、崖廊和窟门连在一起。体验馆收录原窟照片、历史摄影和馆藏原件影像，书房可展卷细读。从展厅走过崖前步廊，走近窟顶、壁画、佛龛和造像旁的观察点，故事会随位置展开。'));[['走进展廊','WASD、方向键或点击地面'],['转身看周围','拖动场景，滚轮调整距离'],['随行讲解','第158窟和奉先寺可从起点自动同行，停在实物前讲解。按方向键、点地面或拖动视角可自己走；点一次「听普通话讲解」，后面的驻足点会接着讲。'],['进窟与读细节','选「本馆窟室」，也可以从门洞直接走入。点窟内标记会步行到对应位置。'],['观察展品','点展框，或靠近后按 F'],['换馆与直达','从敞口穿过中庭走到另一馆；也可按「步行到」让访客自行前往。用「时代展馆」可直接选展品。'],['改变形象与视角','「我的访客」换人；按 V 切换人眼和随行视角'],['端详构造','在「看原物」中放大原址照片、比对历史图版。云冈第20窟另可旋转观察原址局部采集模型。']].forEach(([a,b])=>{const d=el('div','guide-row');d.append(el('b','',a),el('span','',b));body.append(d)});body.append(el('h3','subttl','关于这座展厅'),el('p','meta','中庭、九馆及参观通道是当代布展空间。文物照片、历史图像及云冈第20窟的局部三维扫描单独标注了来源。展位间距按虚拟步行需要安排。'),source('本馆资料',routes[r].source),source('青禾与行川 · 衣装与真人采集出处','./assets/visitors-fitted/SOURCES.md'),source('访客步行动作 · 素材说明','./assets/visitors-whole/motions/SOURCES.md'),source('云冈扫描 · 素材说明','./real-viewer/PROVENANCE.md'))})}
function startDetail(type){stopSheet();stage.replaceChildren();detail.className=type;detail.showModal();hall?.setPaused(true)}
function fullImage(){
  const s=current(),asset=s.photo?.detailSrc || editions.detailImages[s.photo?.src] || s.photo?.src;if(!asset)return;
  startDetail('photo');
  zoom=window.ImmersivePhoto.mount(stage,{...s,image:asset,alt:s.alt||s.studyPlateAlt,label:s.siteName+' · '+s.number,
    imageType:mediaLabel(s.photo),fallbackImage:s.photo.src,institutionalViewer:editions.institutionalViewers[s.photo.src],
    credit:s.credit});
}

function structure(s=current(),options={}){
  const c=caveById.get(s.id);startDetail('study');
  study=mountStructure(stage,{s,c,reading:readingRoom[s.id],...options,visit:hall&&c?i=>{
    endDetail();hall.stopStroll();hall.enterCave(c.id,i);hall.setView(true);hall.lookAtDetail(i);
  }:null});
}
function model(){structure(current(),{initialMedia:'scan'})}
function endDetail(){if(detail.open)detail.close()}
detail.addEventListener('close',()=>{zoom?.destroy();study?.destroy();zoom=study=null;stage.replaceChildren();hall?.setPaused(false)});sheet.addEventListener('close',()=>{hall?.setPaused(detail.open);sheetType='';accountStatus=null;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true})});
const collection=makeCollectionRoom({openExperiences:()=>experiences.directory(),enterExperience:(id,step=0)=>experiences.begin(caveById.get(id),step,'direct'),sites,works,halls:routes,modal,el,action,source,openWork:(work,inspect=false)=>{
  const rr=routes.findIndex(h=>h.id===work.homeHall);
  const nn=routes[rr].scenes.findIndex(s=>!s.crossPeriod&&s.id===work.id);
  stopSheet();move(rr,nn);
  if(inspect)structure(work);
}});
const caveUI=caveVisit({world:()=>hall,modal,closeSheet:stopSheet,el,exhibit:$('#exhibit'),trail:$('#trail'),onDeparture:value=>passage.departure(value)});
const passage=walkCompanion({world:()=>hall,go:(...args)=>caveUI.go(...args),closeSheet:stopSheet,read:c=>caveUI.dossier(c),leave:()=>caveUI.exit()});
const experiences=experienceRooms({startPassage:(...args)=>passage.begin(...args),world:()=>hall,walk:(...args)=>caveUI.go(...args),read:c=>caveUI.dossier(c),eyes:()=>personEyes,el,action,modal,closeSheet:stopSheet});
const trail=makeStoryWalk({
  host:$('#trail'),halls:routes,
  go:(rr,nn,travel=true)=>{
    const c=caveById.get(routes[rr].scenes[nn].id);
    if(!c||c.hallIndex!==rr||!hall){move(rr,nn,travel);return;}
    if(travel)hall.enterCave(c.id,0);r=rr;n=nn;remembered[rr]=nn;draw(false);
  },halt:()=>hall?.stop(),
  onFoot:(rr,nn,arrive,cancel)=>{if(!hall)return false;$('#exhibit').hidden=true;const c=caveById.get(routes[rr].scenes[nn].id);return c&&c.hallIndex===rr?hall.walkCave(c.id,0,arrive,cancel):hall.walkVisit(rr,nn,arrive,cancel);},
  catalogue:rr=>collection.open({mode:'art',hallId:routes[rr].id}),read:id=>collection.read(id)
});
const tasks={
  home:()=>hallway(0),experiences:()=>experiences.directory(), routes:()=>panels.rooms(),collection:()=>collection.open(),map:()=>atlas.open(),
  intoEx:()=>webglUnavailable?caveUI.dossier(caveById.get(current().id)):caveUI.go(current().id),person:()=>panels.dressing(),view:()=>switchView(),story:()=>story(),structure:()=>structure(),guide,zoom:fullImage,model,
  closeEx:()=>{draw(false);setNear(near);},inspect:()=>draw(true),
  near:()=>{if(near)move(near.hallIndex,near.index,false);},walkLink:()=>walkDestination!=null?hall?.stop():walk(neighbouring()),
  prev:()=>move(r,n-1),next:()=>move(r,n+1),closeSheet:stopSheet,closeDetail:endDetail
};
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=tasks[b.dataset.action]);$('#bubble-toggle').onclick=()=>showBubble(activePin,!expanded);
for(const id of ['#cave-structure','#stroll-structure'])$(id).onclick=()=>{if(physicalCave)structure(physicalCave.work,{initialDetail:currentStop})};
let entryOpened=false;
const parseStage=(c,p)=>Math.max(0,Math.min(c.experience.stages.length-1,(parseInt(p.get('stage')||'1',10)||1)-1));
function openNamedEntry(){
  if(entryOpened)return;
  entryOpened=true;
  const params=new URLSearchParams(location.search),target=params.get('work'),shelf=params.get('manuscript');
  if(params.get('panel')==='visitors'){
    const index=routes.findIndex(route=>route.id===params.get('hall'));
    if(index>=0)hallway(index);
    panels.dressing();
    return;
  }
  const structural=works.find(w=>w.id===params.get('structure'));
  if(structural){const rr=routes.findIndex(h=>h.id===structural.homeHall);move(rr,routes[rr].scenes.findIndex(w=>!w.crossPeriod&&w.id===structural.id),!caveById.has(structural.id));if(caveById.has(structural.id))draw(false);structure(structural,{initialMedia:params.get('media')});return;}
  if(params.has('experiences')){experiences.directory();return;}
  const immersive=caveById.get(params.get('experience'));
  if(immersive?.experience){const index=parseStage(immersive,params);experiences.begin(immersive,index,immersive.stroll?'entry':'direct');return;}
  const requested=caveById.get(params.get('cave'));
  if(requested){
    if(!hall){
      r=requested.hallIndex;n=routes[r].scenes.findIndex(s=>s.id===requested.id);draw(true);
      caveUI.dossier(requested);
    }
    return;
  }
  const room=routes.findIndex(h=>h.id===params.get('hall'));
  if(room>=0)hallway(room);
  if(target){
    const w=works.find(s=>s.id===target);if(w){const rr=routes.findIndex(h=>h.id===w.homeHall);move(rr,routes[rr].scenes.findIndex(s=>!s.crossPeriod&&s.id===w.id));return;}
  }
  if(shelf&&/^FRBNFEAD[0-9]{9}$/.test(shelf)){collection.read(shelf);return;}
  const mode=params.get('catalog');
  if(['art','register','ms'].includes(mode))collection.open({mode,medium:['scan','record','photo'].includes(params.get('medium'))?params.get('medium'):'',preset:['new','treasures','scripture'].includes(params.get('pick'))?params.get('pick'):'',siteId:sites.find(s=>s.id===params.get('site'))?.id||'',hallId:mode==='art'&&room>=0?routes[room].id:'',q:(params.get('q')||'').slice(0,120)});
}
draw(false);
try{
  const {mountBuilding}=await import('./connected-museum.js');
  const params=new URLSearchParams(location.search),initialCave=caveById.get(params.get('structure'))||caveById.get(params.get('experience'))||caveById.get(params.get('cave'));
  const initialDetail=initialCave?Math.max(0,initialCave.details.findIndex(d=>d.id===(params.has('experience')&&initialCave.experience?initialCave.experience.stages[parseStage(initialCave,params)].detail:params.get('detail')))):0;
  hall=mountBuilding($('#world'),routes,{initialVisitor:visitorId,initialCave,initialDetail,startingPose:selfRecord(),
    onCave:(c,t)=>{currentStop=-1;physicalCave=c;physicalTerrace=t;caveUI.enter(c,t);experiences.enter(c);passage.enter(c);locationLabel();},
    onCaveDetail:(c,i)=>{currentStop=i;caveUI.updateDetail(c,i);experiences.observe(c,i);passage.observe(c,i);},onStroll:passage.progress,isStrollNarrating:passage.isNarrating,onCaveMarkers:caveUI.projection,onCaveDoor:(id,i)=>caveUI.go(id,i),onCaveError:caveUI.error,
    onManuscript:id=>collection.read(id),onReady:()=>{sceneReady=true;$('#load').hidden=true;panels.refreshVisitor();if(!sheet.open)openNamedEntry();},onSelect:s=>move(s.hallIndex,s.index,false),onNear:setNear,onZone:locationChanged,onJourney:journey,onPosition:positionChanged,onVisitorPose:p=>presence.move(p),onView:viewUI});
  observeVisit(applyPresence);
  panels.refreshVisitor();
  if(params.get('panel')==='visitors')openNamedEntry();

}catch(err){
  sceneReady=true;webglUnavailable=true;document.querySelector('[data-action=intoEx]').textContent='读此窟窟志 ↗';
  $('#load').hidden=true;$('#walk-link').hidden=true;$('#live-plan').hidden=true;$('#cave-passage').hidden=true;
  $('#world').append(el('p','fallback','此设备未能启动三维展馆。可通过「时代展馆」选作品和阅读故事。'));
  console.warn('三维建筑不可用',err);observeVisit(applyPresence);draw(true);openNamedEntry();
}
