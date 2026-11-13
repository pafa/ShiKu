import {manuscriptTables} from './collection-documents.js';
import {tours,chaptersFor} from './curator-routes.js';
import {caveSelection} from './cave-program.js';

// A route belongs to a gallery. Visitors can interrupt a walk, inspect a different
// work and resume the same chapter without losing their position in the story.
export function makeStoryWalk({host,halls,go,onFoot,halt,catalogue,read}){
  const records=halls.map((h,hallIndex)=>{
    const chapters=chaptersFor(h);
    const full=chapters.flatMap((lead,part)=>[{...lead,part,ordinal:1},...lead.items.filter(s=>s.work.id!==lead.id).map((s,i)=>({
      id:s.work.id,index:s.index,title:s.work.title,note:s.work.look,part,ordinal:i+2,work:s.work
    }))]);
    const short=full.filter(step=>step.ordinal===1||caveSelection[hallIndex].includes(step.id));
    return {chapters,short,full,steps:short,chapter:0,state:'intro',minimized:false};
  });
  let room=0,serial=0;
  const text=(el,value)=>host.querySelector(el).textContent=value;
  const at=()=>records[room];
  function render(){
    host.hidden=room<0;if(room<0)return;
    const rec=at(),route=tours[halls[room].id],step=rec.steps[rec.chapter];
    host.dataset.state=rec.state;host.dataset.folded=String(rec.minimized);
    const archive=manuscriptTables[halls[room].id],book=host.querySelector('[data-trail=book]');
    book.hidden=!archive||rec.state==='walking';if(archive)book.textContent='阅卷　'+archive.shelf;
    text('.trail-room',halls[room].name+'　／　策展主线');
    text('.trail-title',rec.state==='intro'||rec.minimized?route.title:rec.state==='complete'?'走完这一馆':step.title);
    text('.trail-copy',rec.state==='intro'?route.intro:rec.state==='complete'?route.end:step.note);
    text('.trail-index',rec.state==='intro'?rec.chapters.length+' 章 · '+rec.full.length+' 个展位':rec.state==='complete'?'本次走读 '+rec.steps.length+' 件':'第 '+(step.part+1)+' 章 · '+rec.chapters[step.part].theme);
    const full=host.querySelector('[data-trail=full]');full.hidden=rec.state!=='intro';full.textContent='完整走读 '+rec.full.length+' 件';
    text('.trail-work',rec.state==='complete'?'':step.work.siteName+' · '+step.work.number+'　'+step.work.title);
    text('[data-trail=main]',rec.state==='intro'?'沿主线参观　→':rec.state==='walking'?'到展品前细看　→':rec.state==='paused'?'继续走向展品　→':rec.state==='complete'?'重走本馆　↺':rec.chapter===rec.steps.length-1?'读本馆结语　→':rec.steps[rec.chapter+1].part===step.part?'走向下一件　→':'走向下一章　→');
    const fold=host.querySelector('[data-trail=fold]');
    fold.setAttribute('aria-expanded',String(!rec.minimized));fold.textContent=rec.minimized?'＋':'−';
    fold.setAttribute('aria-label',rec.minimized?'展开策展主线':'收起策展主线');
    host.querySelector('[data-trail=back]').hidden=rec.chapter===0||rec.state==='intro'||rec.state==='complete';
    const other=host.querySelector('[data-trail=other]');
    other.textContent=rec.state==='walking'?'停在这里':rec.state==='paused'?'直接看此件':'本馆藏品';
    const ticks=host.querySelector('.trail-progress');ticks.replaceChildren();
    for(const [i,s] of rec.chapters.entries()){
      const btn=document.createElement('button');btn.type='button';btn.title=s.title;btn.setAttribute('aria-label','阅读第 '+(i+1)+' 章 '+s.title);
      if(i===step.part)btn.setAttribute('aria-current','step');
      btn.classList.toggle('past',i<step.part||rec.state==='complete');btn.onclick=()=>start(rec.steps.findIndex(x=>x.part===i));ticks.append(btn);
    }
  }
  function direct(){
    if(room<0)return;const rec=at();serial++;halt();go(room,rec.steps[rec.chapter].index);
    rec.state='reading';render();
  }
  function start(index){
    if(room<0)return;const rec=at(),ticket=++serial;halt();rec.chapter=index;rec.minimized=false;rec.state='walking';render();
    const slot=rec.steps[index].index;
    const ok=onFoot(room,slot,()=>{
      if(ticket!==serial)return;
      go(room,slot,false);rec.state='reading';render();
    },()=>{if(ticket===serial){rec.state='paused';render();}});
    if(!ok){if(ticket===serial){rec.state='paused';render();}}
  }
  host.addEventListener('click',e=>{
    const button=e.target.closest('[data-trail]');if(!button||room<0)return;const rec=at();
    switch(button.dataset.trail){
      case 'book':read(manuscriptTables[halls[room].id].id);return;
      case 'full':rec.steps=rec.full;start(0);return;
      case 'fold':rec.minimized=!rec.minimized;render();return;
      case 'other':if(rec.state==='walking'){halt();}else if(rec.state==='paused'){direct();}else catalogue(room);return;
      case 'back':start(rec.chapter-1);return;
      case 'main':
        if(rec.state==='intro'||rec.state==='complete')rec.steps=rec.short;
        if(rec.state==='walking'){direct();return;}
        if(rec.state==='reading'&&rec.chapter===rec.steps.length-1){rec.state='complete';render();return;}
        start(rec.state==='reading'?rec.chapter+1:rec.state==='paused'?rec.chapter:0);return;
    }
  });
  function enter(index){
    if(index!==room){serial++;if(room>=0&&at().state==='walking')at().state='paused';room=index;}
    render();
  }
  function select(id){
    if(room<0)return;
    const rec=at();if(rec.state==='reading'&&rec.steps[rec.chapter].id!==id){rec.state='paused';rec.minimized=true;render();}
  }
  render();return {enter,start,select};
}
