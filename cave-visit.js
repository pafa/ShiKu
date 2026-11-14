import {caveById,wings} from './cave-plan.js';
import {evidenceAt,chamberPhotos} from './chamber-evidence.js';
import {mediaLabel} from './authentic-display.js';
import {halls} from './dynasty-exhibition.js';

const name=c=>c.spaceName||c.work.siteName+' '+c.work.number;
const short=c=>c.spaceName||c.work.siteName.replace('石窟','').replace('莫高窟','莫高')+' '+c.work.number;
const button=(title,run,cls='')=>{const b=document.createElement('button');b.className=cls;b.type='button';b.textContent=title;b.onclick=run;return b;};
const pub=(label,url)=>{const a=document.createElement('a');a.className='source';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label+' ↗';return a;};
export function caveVisit({world,modal,closeSheet,el,exhibit,trail,onDeparture}){
  const $=s=>document.querySelector(s);
  const hud=$('#cave-reading'),marks=$('#cave-marks'),trip=$('#cave-trip'),door=$('#cave-passage');
  let zone=0,active=null,detail=-1,tripInfo=null,visited=new Set(),pinButtons=[],folded=false,token=0,apron=-1;
  function revealGallery(){
    $('#museum').dataset.inCave=active?'true':'false';
    $('#museum').dataset.onTerrace=apron>=0?'true':'false';
    hud.hidden=!active;marks.hidden=!active;
    door.hidden=zone<0;const group=wings[zone];
    if(group){$('#cave-first').textContent='走进 '+short(group.caves[0])+'　→';}
  }
  function enter(c,terrace=-1){
    if(active?.id!==c?.id){folded=false;detail=-1;}
    active=c;apron=terrace;marks.replaceChildren();pinButtons=[];
    if(active){
      exhibit.hidden=true;
      pinButtons=active.details.map((d,i)=>{
        const btn=button('',()=>{if(detail===i){folded=false;world()?.lookAtDetail(i);render();}else go(active,i);},'cave-pin');
        btn.setAttribute('aria-label','走近细节 '+(i+1)+'：'+d.title);
        btn.append(el('i','',String(i+1).padStart(2,'0')),el('span','',d.title));btn.hidden=true;marks.append(btn);return btn;
      });
    }
    revealGallery();render();
  }
  function updateDetail(c,index){
    if(c?.id!==active?.id)return;
    if(index>=0)visited.add(c.id+'/'+index);
    if(detail!==index){detail=index;folded=false;}render();
  }
  function render(){
    if(!active)return;
    const c=active,d=c.details[detail];hud.dataset.folded=String(folded);
    $('#cave-location').textContent=name(c);
    $('#cave-detail-index').textContent=d?'细读 '+String(detail+1).padStart(2,'0')+' / '+String(c.details.length).padStart(2,'0'):'窟内 '+c.details.length+' 处细读';
    $('#cave-detail-index').append(document.createTextNode(c.id==='yungang-20'?'　·　原址局部扫描':'　·　'+mediaLabel(evidenceAt(c,detail))));
    $('#cave-story-title').textContent=d?d.title:c.work.title;
    $('#cave-story-body').textContent=d?d.text:'走近壁画、造像或题记旁的标记，即可读对应的故事。';
    const rail=$('#cave-stops');rail.replaceChildren();
    c.details.forEach((point,i)=>{
      const b=button(String(i+1).padStart(2,'0'),()=>go(c,i));b.title=point.title;
      b.setAttribute('aria-label','走到 '+point.title);b.setAttribute('aria-pressed',String(i===detail));
      b.classList.toggle('visited',visited.has(c.id+'/'+i));rail.append(b);
    });
    $('#cave-focus').hidden=!d;$('#cave-walk-next').textContent=d&&detail===c.details.length-1?'回到展厅　→':d?'走向下一处　→':'从第一处看起　→';
    const fold=$('#cave-fold');fold.textContent=folded?'＋':'−';fold.setAttribute('aria-expanded',String(!folded));fold.setAttribute('aria-label',folded?'展开窟内故事':'收起窟内故事');
    updateRouteButton();
    pinButtons.forEach((b,i)=>b.classList.toggle('selected',i===detail));
  }
  function projection(points){
    if(!active)return;
    const focused=points.find(p=>p.index===detail);
    if(focused)hud.dataset.side=focused.x>.52?'left':'right';
    const visible=new Set();
    for(const p of points){const b=pinButtons[p.index];if(!b)continue;visible.add(p.index);b.style.left=p.x*100+'%';b.style.top=p.y*100+'%';b.hidden=false;}
    pinButtons.forEach((b,i)=>{if(!visible.has(i))b.hidden=true;});
  }
  function updateRouteButton(){
    const state=trail.dataset.state,b=$('#cave-resume');
    b.hidden=!['walking','reading','paused','complete'].includes(state);
    b.textContent=state==='complete'?'回馆读结语':state==='walking'?'到下一站细看':'继续本馆主线';
  }
  new MutationObserver(updateRouteButton).observe(trail,{attributes:true,attributeFilter:['data-state']});
  function clearTrip(){const wasLeaving=tripInfo?.leaving;tripInfo=null;trip.hidden=true;if(wasLeaving)onDeparture?.(false);}
  function go(c,index=0,onArrive=null,onStop=null){
    if(typeof c==='string')c=caveById.get(c);
    if(!c)return false;
    closeSheet();const api=world();if(!api)return false;
    const serial=++token;api.setPaused(false);exhibit.hidden=true;
    const done=()=>{if(serial===token){clearTrip();render();}};
    const arrived=()=>{if(serial===token){done();onArrive?.();}};
    const cancel=()=>{if(serial===token){done();onStop?.();}};
    if(!api.walkCave(c.id,index,arrived,cancel))return false;
    if(tripInfo?.leaving)onDeparture?.(false);
    tripInfo={c,index,onArrive};trip.hidden=false;$('#cave-trip-text').textContent='步行到 '+short(c)+' · '+c.details[index].title;
    return true;
  }
  function exit(){
    closeSheet();const serial=++token,done=()=>{if(serial===token)clearTrip();};
    if(!world()?.leaveCave(done,done))return;
    tripInfo={leaving:true};onDeparture?.(true);trip.hidden=false;$('#cave-trip-text').textContent='沿崖廊返回 '+halls[zone].name;
  }
  function dossier(c){
    if(!c)return;
    modal(name(c),'cave-file',body=>{
      body.append(el('p','origin',c.work.era),el('h3','subttl','入窟方位'),el('p','storytext',c.orientation),
        el('h3','subttl','展陈与原件'),el('p','storytext',c.id==='yungang-20'?'展示罗迪原址采集的局部摄影测量模型。':'展位按参观动线布置。照片保留实物外观，无法获得对应影像的部位以文献解读。'));
      for(const entry of c.sources)body.append(pub(entry.label,entry.url));
      for(const image of chamberPhotos(c))body.append(pub(image.caption+' · '+image.credit,image.source));
      body.append(el('h3','subttl','窟内细读'));
      for(const [i,d] of c.details.entries()){
        const box=el('section','cave-file-row');box.append(el('h4','',d.title),el('p','storytext',d.text),pub('此处资料',d.source));if(world())box.append(button('步行到这里',()=>go(c,i),'shelf-back'));body.append(box);
      }
    });
  }
  function directory(index=zone){
    const wing=wings[index<0?0:index];
    modal(halls[wing.plan.index].name+' · 入窟路线','cave-file',body=>{
      const group=el('div','cave-picks');
      for(const c of wing.caves){
        const card=el('article','cave-pick');card.append(el('p','origin',c.work.siteName+' ／ '+c.work.era),el('h3','subttl',c.work.number+' · '+c.work.title),
          el('p','meta',c.details.map(d=>d.title).join('　·　')),button('从展厅步行入窟　→',()=>go(c),'shelf-back'));
        group.append(card);
      }
      body.append(group);
    });
  }
  $('#cave-first').onclick=()=>go(wings[zone]?.caves[0]);$('#cave-list').onclick=()=>directory();
  $('#cave-fold').onclick=()=>{folded=!folded;render();};$('#cave-focus').onclick=()=>world()?.lookAtDetail(detail);
  $('#cave-walk-next').onclick=()=>{if(detail===active.details.length-1)exit();else go(active,detail+1);};
  $('#cave-file').onclick=()=>dossier(active);$('#cave-change').onclick=()=>directory();$('#cave-leave').onclick=exit;
  $('#cave-resume').onclick=()=>{if(trail.dataset.state==='complete')exit();else trail.querySelector('[data-trail=main]').click();};
  $('#cave-trip-stop').onclick=()=>{world()?.stop();++token;clearTrip();};
  $('#cave-trip-direct').onclick=()=>{
    const t=tripInfo;if(!t)return;++token;if(t.leaving){world()?.enter(zone);clearTrip();}else {clearTrip();world()?.enterCave(t.c.id,t.index);t.onArrive?.();}
  };
  function setHall(i){zone=i;revealGallery();}
  function error(c){if(active?.id===c.id){$('#cave-story-body').textContent='展室暂未载入，可在「窟志与依据」阅读各处细节，或刷新展馆。';}}
  return {setHall,enter,updateDetail,projection,go,exit,directory,dossier,error,clearTrip};
}
