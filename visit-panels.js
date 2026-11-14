import {workForDisplay,mediaLabel} from './authentic-display.js';
import {makeVisitorPicker} from './visitor-picker.js';
// All navigation, changing visitor and reading take place over the same 3D canvas.
import {profiles} from './site-profiles.js';
import {wings} from './cave-plan.js';
import {tours,chaptersFor} from './curator-routes.js';
import {plans} from './building-plan.js';
export function makePanels({el,action,modal,source,routes,sites,works,visitors,selectedVisitor,changeVisitor,currentPlace,enter,enterHall,walkTo,enterChamber,startVisit,canChangeVisitor,initialVisitor}){
 const two=n=>String(n).padStart(2,'0');
 function door(rr,nn){enter(rr,nn)}
 function photo(s){const item=workForDisplay(s).visual;if(!item)return el('span','catalog-record','文献记录');const im=el('img');im.alt=item.caption;im.src=item.src;im.loading='lazy';return im}
 function stationList(items,target){const list=el('div','stops archive-stops');items.forEach(([s,k])=>{const b=action('',()=>target(s,k));b.append(photo(s));const text=el('span');text.append(el('small','',(s.crossPeriod?'对照 · ':'')+s.siteName+' · '+s.number),el('strong','',s.title),el('small','era-meta',s.era+'　·　'+mediaLabel(workForDisplay(s).visual)));b.append(text);list.append(b)});return list}
 function rooms(rr=currentPlace()[0]){
   const h=routes[rr];
   modal('时代展馆','routes',body=>{
     const tabs=el('nav','era-tabs');tabs.setAttribute('aria-label','选择时代展馆');
     routes.forEach((a,j)=>{const b=action(a.name,()=>rooms(j));b.setAttribute('aria-current',j===rr?'true':'false');tabs.append(b)});body.append(tabs);
     const top=el('div','era-top'),desc=el('div');
     desc.append(el('div','origin',h.period),el('h3','era-name',h.name+' · '+plans[rr].title));
     top.append(desc);body.append(top,el('h4','guide-theme-title',tours[h.id].title),el('p','era-intro',tours[h.id].intro),el('p','meta',plans[rr].description));
     const controls=el('div','hall-entry-actions');
     controls.append(action('步行到'+h.name,()=>walkTo(rr),'enter-hall'),action('直接进入'+h.name,()=>enterHall(rr)));
     body.append(controls);
     const rock=el('div','chamber-menu');rock.append(el('span','meta','可步入的代表窟'));
     for(const c of wings[rr].caves)rock.append(action(c.work.siteName+' '+c.work.number+' →',()=>enterChamber(c.id)));
     body.append(rock);
     const primary=h.scenes.filter(s=>!s.crossPeriod).length;
     body.append(el('p','hall-caption',primary+' 件主展　·　'+(h.scenes.length-primary)+' 件跨期对照'));
     const plan=el('div','mount-plan');plan.setAttribute('aria-label',h.name+' 展墙位置');
     ['北侧展墙','南侧展墙'].forEach((name,side)=>{
       const row=el('div','wall-row'),buttons=el('div','wall-stations');row.append(el('span','meta',name),buttons);
       h.scenes.forEach((s,i)=>{if(i%2!==side)return;const b=action(two(i+1),()=>door(rr,i),'map-stop'+(s.crossPeriod?' comparison':''));
         b.title=s.siteName+' '+s.number+' '+s.title;b.setAttribute('aria-label','展位 '+two(i+1)+' '+s.title);buttons.append(b);
       });plan.append(row);
     });
     body.append(plan,el('h3','subttl','按主线逐件看展'));
     chaptersFor(h).forEach((ch,i)=>{
       const section=el('details','site-overview'),summary=el('summary','',two(i+1)+'　'+ch.theme+'　·　'+ch.items.length+' 件');
       section.open=i===0;section.append(summary,el('p','era-intro',ch.note),stationList(ch.items.map(x=>[x.work,x.index]),(_,k)=>door(rr,k)));body.append(section);
     });
     body.append(source('本馆研究来源',h.source));
   });
 }
 function archive(site=sites[0].id){
   modal('四窟图录','collection',body=>{
     const tabs=el('nav','tabs');tabs.setAttribute('aria-label','选择遗址');sites.forEach(x=>{const b=action(x.name,()=>archive(x.id));b.setAttribute('aria-current',String(x.id===site));b.setAttribute('aria-pressed',String(x.id===site));tabs.append(b)});
     const local=sites.find(x=>x.id===site),p=profiles[site],filtered=works.filter(s=>s.siteId===site);
     const about=el('details','site-overview'),label=el('summary','','遗址档案 · 年代、规模与看点');about.append(label,el('p','meta',p.period+'　／　'+p.extent),el('p','era-intro',p.intro),el('p','era-intro',p.look),source(p.label,p.url));if(p.second)about.append(source(...p.second));
     body.append(tabs,el('h3','era-name',local.name),el('p','meta',local.location+'　／　'+filtered.length+' 个代表窟。选择展品进入对应时代馆。'),about,stationList(filtered.map((s,i)=>[s,i]),s=>{const ri=routes.findIndex(h=>h.scenes.some(a=>a.id===s.id&&!a.crossPeriod));door(ri,routes[ri].scenes.findIndex(a=>a.id===s.id&&!a.crossPeriod))}));
   });
 }
 const picker = makeVisitorPicker({
   el, action, modal, visitors, selectedVisitor, changeVisitor, startVisit, canChangeVisitor, initialVisitor
 });
 function addAtlas(body) {
   const levels = [1, 1.5, 2, 3, 4, 5];
   let level = 0;
   const viewport = el('div', 'atlas-window');
   viewport.id = 'atlas-window';
   viewport.tabIndex = 0;
   viewport.setAttribute('role', 'region');
   viewport.setAttribute('aria-label', '全馆结构图，可用正负号缩放、方向键移动、数字零复位');
   const image = el('img', 'floor-atlas');
   image.src = './exhibition-map.svg';
   image.alt = '各时代展馆、主展数量和四处遗址对照关系';
   image.draggable = false;
   viewport.append(image);

   const tools = el('div', 'atlas-tools');
   tools.setAttribute('role', 'group');
   tools.setAttribute('aria-label', '结构图缩放');
   const status = el('output', 'atlas-percent', '100%');
   status.setAttribute('aria-live', 'polite');
   const smaller = action('−', () => magnify(level - 1));
   const larger = action('＋', () => magnify(level + 1));
   const reset = action('复位', () => magnify(0));
   for (const [button,label] of [[smaller,'缩小结构图'],[larger,'放大结构图'],[reset,'复位结构图']]) {
     button.setAttribute('aria-label', label);
     button.setAttribute('aria-controls', viewport.id);
   }
   smaller.disabled = reset.disabled = true;
   const hint = el('span', 'atlas-pan-hint');
   tools.append(smaller, status, larger, reset, hint);
   body.append(viewport, tools);

   function magnify(next) {
     next = Math.max(0, Math.min(levels.length - 1, next));
     if (next === level) return;
     const ratio = levels[next] / levels[level];
     const midX = viewport.scrollLeft + viewport.clientWidth / 2;
     const midY = viewport.scrollTop + viewport.clientHeight / 2;
     level = next;
     image.style.width = levels[level] * 100 + '%';
     viewport.scrollTo({
       left: level ? midX * ratio - viewport.clientWidth / 2 : 0,
       top: level ? midY * ratio - viewport.clientHeight / 2 : 0
     });
     status.value = Math.round(levels[level] * 100) + '%';
     smaller.disabled = reset.disabled = level === 0;
     larger.disabled = level === levels.length - 1;
     hint.textContent = level ? '滑动或用方向键看局部' : '';
   }
   viewport.addEventListener('keydown', event => {
     if (event.metaKey || event.ctrlKey || event.altKey) return;
     const step = 48;
     const arrows = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] };
     if (event.key === '+' || event.key === '=') magnify(level + 1);
     else if (event.key === '-') magnify(level - 1);
     else if (event.key === '0' || event.key === 'Home') magnify(0);
     else if (level && arrows[event.key]) viewport.scrollBy(...arrows[event.key]);
     else return;
     event.preventDefault();
   });
 }
 function map(){
  modal('全馆结构图','plan',body=>{body.append(el('p','meta','从采光中庭走进左右两翼的展馆。每一馆都能对读四处遗址的作品；“对照”保留作品自身年代。'));
    addAtlas(body);
    const chain=el('div','hall-chain');routes.forEach((h,i)=>{const b=action(two(i+1)+'　'+h.name,()=>rooms(i));chain.append(b)});body.append(chain);
    const expand=el('details','atlas-details'),summary=el('summary','','展开完整逐馆清单');expand.append(summary);
    expand.addEventListener('toggle',()=>{if(expand.open&&!expand.querySelector('iframe')){const f=el('iframe');f.title='全部展位的主展和对照说明';f.src='./exhibition-guide.html';expand.append(f)}});body.append(expand);
  })
 }
 return {rooms,archive,dressing:picker.open,refreshVisitor:picker.refresh,map};
}
