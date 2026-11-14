import {caveById} from './cave-plan.js';
import {chamberPhotos,evidenceAt} from './chamber-evidence.js';
import {halls} from './dynasty-exhibition.js';

export const experienceOrder=['mogao-158','longmen-1280','mogao-407','yungang-12','longmen-712','maijishan-133','mogao-320','mogao-bl-or8210-p2'];
const programs = {
  'longmen-712':['莲花洞的窟顶与正壁','莲花与造像原址摄影'],
  'mogao-407':['三兔共耳','藻井与壁画细读'],
  'mogao-320':['从窟顶读到净土变','壁画与历史摄影'],
  'yungang-12':['石壁上的乐队','原址乐伎雕刻'],
  'maijishan-133':['万佛洞的石刻故事','石碑与造像旧影']
};
const programName=c=>programs[c.id]?.[0]||c.experience.title;
const medium=c=>programs[c.id]?.[1]||c.experience.medium;
const number=i=>String(i+1).padStart(2,'0');
export function experienceRooms({el,action,modal,closeSheet,world,walk,read,eyes,startPassage}){
  const museum=document.querySelector('#museum'),dock=document.querySelector('#experience-tools'),restore=document.querySelector('#return-observation');
  let lastDetail=-1,active=null,selected=-1,range=.5,previousEyes=false,walking=null,silent=false,applied=null;
  const setSilent=value=>{silent=!!value;museum.dataset.quiet=String(silent);restore.hidden=!silent;
    if(silent)restore.focus({preventScroll:true});};
  restore.onclick=()=>{setSilent(false);dock.querySelector('.exp-quiet')?.focus({preventScroll:true});};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&silent){e.preventDefault();setSilent(false);}});
  function apply(){world()?.setLens(active?.experience.stages[selected]?.fov||null);world()?.setExperience(active?.id||null,selected,range);applied=selected;}
  function paint(){
    dock.replaceChildren();dock.hidden=!active?.experience||!!active?.stroll;dock.closest('section').dataset.experiment=String(selected>=0&&!!active?.experience);
    if(dock.hidden)return;
    const c=active,x=c.experience;
    if(selected<0){dock.append(action('开始观察 · '+medium(c),()=>begin(c),'exp-start'));return;}
    const stage=x.stages[selected];
    const cap=el('div','exp-caption');cap.append(el('span','',medium(c)),el('span','',number(selected)+' / '+number(x.stages.length-1)));
    const strip=el('div','exp-stage-rail');strip.setAttribute('aria-label','体验步骤');
    x.stages.forEach((s,i)=>{const b=action(c.spaceType?s.label:c.details.find(d=>d.id===s.detail).title,()=>pick(i),'exp-stage');b.setAttribute('aria-pressed',String(i===selected));strip.append(b);});
    const d=c.details.findIndex(item=>item.id===stage.detail);
    dock.append(cap,strip,el('p','exp-hint',c.spaceType?stage.instruction:evidenceAt(c,d)?.caption||'此处以窟志与考察记录解读。'));
    const slider=c.spaceType==='studio' && (stage.range||x.range);
    if(slider){
      const lab=el('label','exp-range'),row=el('span','exp-limits'),name=el('span','',slider.label);
      const input=el('input');input.type='range';input.min='0';input.max='100';input.value=String(Math.round(range*100));input.setAttribute('aria-label',slider.label);
      row.append(el('span','',slider.minLabel),el('span','',slider.maxLabel));
      input.oninput=()=>{range=input.valueAsNumber/100;apply();};lab.append(name,input,row);dock.append(lab);
    }
    const tools=el('div','exp-small');tools.append(action('无标记观看',()=>setSilent(true),'exp-quiet'),action('自由走看',()=>{world()?.stop();end();paint();}));dock.append(tools);
  }
  function end(){
    walking=null;if(selected>=0){selected=-1;world()?.setExperience(null);world()?.setLens(null);world()?.setView(previousEyes);}
    applied=null;setSilent(false);
  }
  function enter(c){
    if(c?.id!==active?.id){end();active=c;lastDetail=-1;paint();}
  }
  function pick(i,position='walk'){
    const c=active;if(!c?.experience)return;
    const x=c.experience,s=x.stages[i];if(!s)return;
    const detail=c.details.findIndex(d=>d.id===s.detail);
    const already=selected>=0&&x.stages[selected]?.detail===s.detail;
    if(selected<0){previousEyes=eyes();world()?.setView(true);}
    const initial=selected<0;selected=i;
    range=s.value??(initial?x.range?.initial??.5:range);walking={id:c.id,detail};
    apply();paint();
    if(position==='direct'){world()?.enterCave(c.id,detail);walking=null;}
    else if(position==='here'||(already&&position!=='walkAgain')){world()?.lookAtDetail(detail);walking=null;}
    else if(!walk(c,detail,null,()=>{walking=null;if(active?.id===c.id){if(lastDetail>=0)observe(c,lastDetail);else {end();paint();}}}))walking=null;
  }
  function begin(c,i=0,how='walk'){
    if(!c)return;if(!world()){read(c);return;}
    if(c.stroll){startPassage(c,i,how);return;}
    if(active?.id!==c.id&&how==='walk'){
      closeSheet();const d=c.details.findIndex(t=>t.id===c.experience.stages[i].detail);
      walk(c,d,()=>{if(active?.id===c.id)pick(i,'here');});return;
    }
    closeSheet();
    if(active?.id!==c.id){
      const idx=c.details.findIndex(t=>t.id===c.experience.stages[i].detail);
      world().enterCave(c.id,idx);enter(c);pick(i,'here');return;
    }
    pick(i,how==='direct'?'direct':how);
  }
  function observe(c,index){
    if(active?.id!==c?.id)return;lastDetail=index;
    if(selected<0||index<0)return;
    if(walking){if(walking.id===c.id&&walking.detail===index)walking=null;else return;}
    const x=c.experience,d=c.details[index];
    if(x.stages[selected].detail===d.id)return;
    const i=x.stages.findIndex(s=>s.detail===d.id);
    if(i>=0){selected=i;range=x.stages[i].value??range;apply();paint();}
    else {end();paint();}
  }
  function directory(initial=experienceOrder[0]){
    let id=experienceOrder.includes(initial)?initial:experienceOrder[0];
    modal('体验馆','experiences',body=>{
      const lead=el('p','exp-index-lede','七处窟龛，一间书房。随卧佛绕行，从崖前登阶，或选一处细节停下来。'),layout=el('div','exp-index'),list=el('div','exp-index-list'),feature=el('article','exp-feature');
      const controls=new Map();
      function show(next){
        id=next;const c=caveById.get(id),x=c.experience;
        controls.forEach((btn,k)=>btn.setAttribute('aria-pressed',String(k===id)));
        const subject=chamberPhotos(c)[0];
        const photo=subject?el('img','exp-cover'):el('p','catalog-record','文献记录');
        if(subject){photo.src=subject.src;photo.alt=subject.caption;}
        const txt=el('div','exp-front-text'),location=el('p','exp-location',halls[c.hallIndex].name+'　／　'+(c.spaceName||c.work.siteName+' '+c.work.number)),h=el('h3','',programName(c));
        txt.append(location,h,el('p','exp-intro',c.spaceType||c.stroll?x.intro:c.work.feature));
        const acts=el('div','exp-acts');
        if(world()){acts.append(action(c.stroll?'从起点同行 →':c.spaceType?'坐到卷案前 →':'直接入窟 →',()=>begin(c,0,'direct'),'exp-primary'),action('从当前位置步行',()=>begin(c),'exp-secondary'));}
        else acts.append(action('阅读窟志与依据',()=>read(c),'exp-primary'));
        txt.append(acts);feature.replaceChildren(photo,txt);
        const label=el('p','exp-source-note',subject?[subject.caption,subject.credit].join(' · '):c.work.sourceName);feature.append(label);
      }
      experienceOrder.forEach((k,i)=>{const c=caveById.get(k),x=c.experience;
        const b=action('',()=>show(k),'exp-index-choice'),subject=chamberPhotos(c)[0],img=subject?el('img'):el('span','catalog-record','著录');if(subject){img.src=subject.src;img.alt='';}
        const words=el('span');words.append(el('strong','',programName(c)),el('small','',medium(c)));
        b.append(el('i','',number(i)),img,words);controls.set(k,b);list.append(b);});
      layout.append(feature,list);body.append(lead,layout);show(id);
    });
  }
  return {enter,observe,begin,directory,restore:()=>{if(active&&selected>=0&&applied!==selected)apply();}};
}
