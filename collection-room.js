import {visualCategory,visualCounts} from './exhibit-visual.js';
import {spaceStudies} from './space-studies.js';
import {collectionScans} from './collection-scans.js';
import {workForDisplay,mediaLabel} from './authentic-display.js';
import {manuscriptTables} from './collection-documents.js';
import {experienceOrder} from './experience-room.js';
import {catalog as regionalCatalog} from './collection-extension.js';
import {profiles} from './site-profiles.js';

const registerLabels = {
  'cave-record':'逐窟著录', 'number-only':'编号登记', 'location-map':'窟位图索引',
  'official-name':'保护规划名录', 'survey-name':'调查摄影名录', 'dating-study':'服饰分期研究', 'theme-study':'题材研究'
};

const featuredManuscripts=new Map(Object.values(manuscriptTables).map(entry=>[entry.id,entry]));
const institution='https://api.bnf.fr/fr/dumps-de-bnf-archives-et-manuscrits';
const manuscriptBase='./assets/collection/manuscripts/';
const dataCache=new Map();
function loadJSON(file){
  if(!dataCache.has(file))dataCache.set(file,fetch(manuscriptBase+file).then(response=>{
    if(!response.ok)throw Error('读档失败');return response.json();
  }).catch(error=>{dataCache.delete(file);throw error;}));
  return dataCache.get(file);
}
const folds=new Map(Array.from('經剛華蓮曆篋書發藥絲畫號點淨觀覺來題會羅漢壽門變靈寫學薩傳勸說論華龍無處義譯爾禮勞').map((v,i)=>[v,Array.from('经刚华莲历箧书发药丝画号点净观觉来题会罗汉寿门变灵写学萨传劝说论华龙无处义译尔礼劳')[i]]));
function normalize(text){return [...String(text??'').normalize('NFKC').toLowerCase()].map(c=>folds.get(c)||c).join('').replace(/\s+/g,'');}
function subLabel(text){return String(text||'').replace(/^Pelliot chinois\s+/i,'P. ');}
function words(el,tag,cls,text){const n=document.createElement(tag);n.className=cls;n.textContent=text;el.append(n);return n;}

export function makeCollectionRoom({sites,works,halls,modal,el,action,source,openWork,openExperiences,enterExperience}){
  let state={mode:'art',siteId:'',hallId:'',medium:'',q:'',page:0},serial=0;
  const treasures=new Set(['mogao-17','mogao-57','mogao-61','mogao-96','mogao-158','mogao-217','mogao-257','mogao-285','mogao-320','mogao-407','mogao-bl-or8210-p2','mogao-bl-star-atlas','mogao-bm-guide','mogao-328-kneeling','yungang-3','yungang-5','yungang-6','yungang-12','yungang-16','yungang-17','yungang-18','yungang-19','yungang-20','longmen-1280','longmen-543','longmen-712','longmen-140','longmen-1443','maijishan-4','maijishan-44','maijishan-120','maijishan-121','maijishan-127','maijishan-133','maijishan-165']);
  const unique=new Map();
  const idFor=row=>{
    const cave=String(row.number).match(/^第\s*(\d+)\s*窟/);
    return row.siteId+'/'+(cave?'第'+cave[1]+'窟':String(row.number).replace(/\s/g,''));
  };
  for(const record of regionalCatalog){const id=idFor(record);if(!unique.has(id))unique.set(id,{...record,related:[]});}
  for(const work of works){
    if(work.siteId==='mogao' && ['经书写本','木刻印本','馆藏文物'].includes(work.objectType)){
      if(work.findspotCave)unique.get(work.siteId+'/第'+work.findspotCave+'窟')?.related.push(work);
      continue;
    }
    if(work.objectType)continue;
    const id=idFor(work);
    if(!unique.has(id))unique.set(id,{siteId:work.siteId,number:work.number,title:work.title,era:work.era,source:work.source,sourceName:work.sourceName,related:[]});
    unique.get(id).related.push(work);
  }
  const manuscriptExhibits=new Map(works.filter(w=>w.accession?.startsWith('Pelliot chinois '))
    .map(w=>[w.accession,w]));
  const register=[...unique.values()];
  const labelFor=id=>sites.find(s=>s.id===id)?.name||'';
  const hallFor=id=>halls.find(h=>h.id===id)?.name||'';
  function open(options=null){
    if(options)state={mode:options.mode||'art',siteId:options.siteId||'',hallId:options.hallId||'',medium:options.medium||'',q:options.q||'',preset:options.preset||'',page:0};
    const ticket=++serial;
    modal('馆藏总目','collection',body=>{
      const tabs=el('div','desk-tabs');tabs.setAttribute('aria-label','选择资料类别');
      for(const [id,label] of [['art','展厅藏品'],['register','洞窟索引'],['ms','敦煌写本']]){
        const b=action(label,()=>{state={...state,mode:id,page:0,q:'',hallId:'',medium:'',siteId:''};open();});
        b.setAttribute('aria-pressed',String(id===state.mode));tabs.append(b);
      }
      body.append(tabs);
      if(state.mode==='art'){
        const invite=action('',openExperiences,'exp-invite'),image=el('img');image.src='assets/walk/fengxian/west.webp';image.alt='';
        const words=el('span');words.append(el('strong','','走进体验馆'),el('small','','沿卧佛绕行，看身后三壁；从奉先寺崖前逐步走近大佛'));invite.append(image,words,el('i','','↗'));body.append(invite);
      }
      if(state.mode==='ms'){
        body.append(el('p','desk-lede','法国国家图书馆伯希和汉文书目。输入题名、藏号或分类，在馆内翻阅原编目。'));
        const facsimiles=el('details','site-overview');
        facsimiles.open=true;
        facsimiles.append(el('summary','','翻看代表经卷'));
        const editions=el('div','desk-results art-grid');
        for(const work of works.filter(w=>w.objectType==='经书写本'||w.id==='mogao-bl-or8210-p2')){
          const pic=workForDisplay(work).photo;
          if(!pic)continue;
          const card=action('',()=>openWork(work,true),'catalog-result');
          const img=el('img');img.src=pic.src;img.alt=pic.caption;img.loading='lazy';
          const info=el('span','catalog-info');info.append(el('strong','',work.title),el('small','',work.accession));
          card.append(img,info);editions.append(card);
        }
        facsimiles.append(editions);
        for(const [id,title] of [['FRBNFEAD000118635','P.2010 图绘《观音经》'],['FRBNFEAD000118720','P.2095《注维摩诘经》卷六']]){
          facsimiles.append(action(title,()=>read(id),'shelf-back'));
        }
        facsimiles.append(source('S.5475《六祖坛经》 · 大英图书馆原册','https://idp.bl.uk/collection/C4D4682ACF944CAF9378F5C5701576A0/'));
        body.append(facsimiles);
        const picks=el('details','site-overview');picks.append(el('summary','','书案上先读这四卷'));
        for(const entry of Object.values(manuscriptTables))picks.append(action(entry.shelf+'　'+entry.title,()=>read(entry.id),'shelf-back'));
        body.append(picks);
      }
      const controls=el('div','desk-controls'),search=el('input','desk-search');
      search.type='search';search.setAttribute('aria-label','检索馆藏');
      search.placeholder=state.mode==='ms'?'题名、藏号、分类，如 金刚 / 2001':'窟号、作品、朝代或关键词';search.value=state.q;
      controls.append(search);
      function selector(entries,selected,label,change){
        const select=el('select');select.setAttribute('aria-label',label);
        for(const [v,t] of entries){const opt=el('option','',t);opt.value=v;opt.selected=v===selected;select.append(opt);}
        select.onchange=()=>{change(select.value);state.page=0;draw();};controls.append(select);
      }
      if(state.mode!=='ms'){
        selector([['','全部遗址'],...sites.map(s=>[s.id,s.name])],state.siteId,'按遗址筛选',v=>state.siteId=v);
        if(state.mode==='art'){
          selector([['','全部展馆'],...halls.map(h=>[h.id,h.name])],state.hallId,'按展馆筛选',v=>state.hallId=v);
          selector([['','全部图版'],['photo','本件与同址图版'],['scan','旋转模型'],['compare','其他作品对照'],['record','尚缺本件及同址图版']],state.medium||'','按图版类型筛选',v=>state.medium=v);
        }
      }
      const status=el('p','desk-count');status.setAttribute('role','status');
      const overview=el('div','desk-overview'),list=el('div','desk-results'),pager=el('nav','desk-pager');
      pager.setAttribute('aria-label','馆藏翻页');
      const presets=el('div','collection-presets');
      if(state.mode==='art')for(const [key,label] of [['','全部藏品'],['treasures','四窟代表作'],['scripture','经卷与印本'],['new','新入藏']]){
        const b=action(label,()=>{state.preset=key;state.page=0;draw();});b.dataset.key=key;presets.append(b);
      }
      body.append(controls,presets,overview,status,list,pager);
      let ms=null;
      function addProfile(){
        overview.replaceChildren();
        if(!state.siteId||state.mode==='ms')return;
        const p=profiles[state.siteId];const d=el('details','site-overview');
        d.append(el('summary','','遗址档案 · '+labelFor(state.siteId)),el('p','meta',p.period+' ／ '+p.extent),el('p','storytext',p.intro),el('p','storytext',p.look),source(p.label,p.url));
        if(p.second)d.append(source(...p.second));overview.append(d);
      }
      function draw(){
        const mode=state.mode;for(const b of presets.children)b.setAttribute('aria-pressed',String(b.dataset.key===(state.preset||'')));addProfile();list.replaceChildren();pager.replaceChildren();
        if(mode==='ms'&&!ms){status.textContent='正在打开本站写本书目…';return;}
        const entries=mode==='art'?works:mode==='register'?register:ms;
        const query=normalize(state.q);
        let filtered=entries.filter(s=>{
          if(mode!=='ms'&&((state.siteId&&state.siteId!==s.siteId)||(mode==='art'&&state.hallId&&state.hallId!==s.homeHall)))return false;
          if(mode==='art'&&state.preset==='treasures'&&!treasures.has(s.id)&&!s.newAcquisition)return false;
          if(mode==='art'&&state.preset==='new'&&!s.newAcquisition)return false;
          if(mode==='art'&&state.preset==='scripture'&&!['经书写本','木刻印本'].includes(s.objectType)&&s.id!=='mogao-bl-or8210-p2')return false;
          if(mode==='art'&&state.medium){
            const kind=visualCategory(workForDisplay(s).visual);
            if(state.medium==='scan' && !collectionScans[s.id]?.viewer && !spaceStudies[s.id])return false;
            if(state.medium==='photo' && kind!=='photo' && kind!=='context')return false;
            if(state.medium==='compare' && kind!=='comparison')return false;
            if(state.medium==='record' && (kind==='photo' || kind==='context'))return false;
          }
          if(!query)return true;
          const key=mode==='ms'?[s.shelf,subLabel(s.shelf),s.title,s.cn,s.date,...s.subjects,featuredManuscripts.get(s.id)?.title,featuredManuscripts.get(s.id)?.note]:
            [labelFor(s.siteId),s.title,s.number,s.era,s.summary,s.feature,...(s.motifs||[]),s.holding,s.accession,s.canonicalTitle,...(s.aliases||[]),s.sourceName];
          return normalize(key.join(' ')).includes(query);
        });
        if(mode==='art'&&state.preset==='treasures'&&!state.siteId){
          const sets=sites.map(site=>filtered.filter(w=>w.siteId===site.id));
          filtered=Array.from({length:Math.max(0,...sets.map(a=>a.length))},(_,i)=>sets.map(a=>a[i]).filter(Boolean)).flat();
        }
        if(mode==='art' && state.preset!=='treasures')filtered.sort((a,b)=>Number(!!workForDisplay(b).photo)-Number(!!workForDisplay(a).photo));
        const size=mode==='art'?12:18,pages=Math.max(1,Math.ceil(filtered.length/size));
        state.page=Math.max(0,Math.min(state.page,pages-1));
        const start=state.page*size;
        status.textContent=(mode==='art'?'展厅作品':mode==='register'?'窟龛条目':'写本编目')+' '+filtered.length.toLocaleString('zh-CN')+' 条'+(filtered.length?'　·　第 '+(start+1)+'–'+Math.min(start+size,filtered.length)+' 条':'');
        list.classList.toggle('art-grid',mode==='art');
        if (mode === 'art') {
          const counts=visualCounts(filtered);
          status.textContent += '　·　本件及同址图 '+(counts.photo+counts.context)+'　尺度模型 '+counts.space+'　作品对照 '+counts.comparison+'　纯文字 '+counts.text;
        }
        for(const s of filtered.slice(start,start+size)){
          const btn=action('',()=>mode==='art'?openWork(s):mode==='register'?registerRecord(s):manuscript(s),'catalog-result');
          if(mode==='art'){
            const photo=workForDisplay(s).visual;
            if(photo){const img=el('img');img.src=photo.src;img.alt=photo.caption;img.loading='lazy';btn.append(img);}
            else btn.append(el('span','catalog-record',workForDisplay(s).evidence.officialViews?.length?'可看馆方原图':'文献记录'));
          }
          const info=el('span','catalog-info');btn.append(info);
          if(mode==='ms'){
            words(info,'small','',subLabel(s.shelf)+'　·　法国国家图书馆');
            words(info,'strong','',s.multiPart?'合编写本 · 分件著录':s.cn||s.title);words(info,'span','',s.date||s.subjects.join(' · ')||'查阅编目');
          }else{
            words(info,'small','',labelFor(s.siteId)+'　·　'+s.number);
            words(info,'strong','',s.title||s.number);
            words(info,'span','',mode==='art'?hallFor(s.homeHall)+' ／ '+mediaLabel(workForDisplay(s).visual)+'　'+s.era:[registerLabels[s.recordLevel]||'窟龛资料',s.era].filter(Boolean).join(' ／ '));
          }
          if(mode==='art'&&(experienceOrder.includes(s.id)||s.id==='mogao-bl-star-atlas')){
            const shell=el('div','catalog-with-entry');shell.append(btn,action(s.objectType?'到卷案体验 →':'入窟体验 →',()=>s.id==='mogao-bl-star-atlas'?enterExperience('mogao-bl-or8210-p2',3):enterExperience(s.id),'catalog-enter'));list.append(shell);
          }else list.append(btn);
        }
        if(!filtered.length)list.append(el('p','meta','没有找到符合条件的条目。可以换一个窟号、去掉筛选或只输入题名的一部分。'));
        if(pages>1){
          const turn=delta=>{state.page+=delta;draw();status.scrollIntoView({block:'nearest'});};
          const prev=action('← 上一页',()=>turn(-1)),next=action('下一页 →',()=>turn(1));
          prev.disabled=state.page===0;next.disabled=state.page===pages-1;
          pager.append(prev,el('span','meta',(state.page+1)+' / '+pages),next);
        }
      }
      search.oninput=()=>{state.q=search.value;state.page=0;draw();};
      draw();
      if(state.mode==='ms'){loadJSON('index.json').then(v=>{if(ticket===serial){ms=v;draw();}}).catch(()=>{if(ticket===serial){status.textContent='写本目录未载入。';list.append(action('重新打开写本目录',()=>open()));}});}
    });
  }
  function registerRecord(s){
    ++serial;modal(s.title||s.number,'catalog-file',body=>{
      body.append(action('← 返回检索结果',()=>open(),'shelf-back'),el('p','origin',labelFor(s.siteId)+' ／ '+s.number));
      if(s.recordLevel)body.append(el('p','desk-count',registerLabels[s.recordLevel]));
      if(s.era)body.append(el('p','meta','资料所载年代　'+s.era));
      body.append(el('p','storytext',s.summary||s.feature||'此处收录了来源中登记的编号和名称。'));
      if(s.related.length){
        body.append(el('h3','subttl','看本窟收录的展品'));
        const grid=el('div','desk-results art-grid');
        for(const w of s.related){
          const photo=workForDisplay(w).visual;
          const card=action('',()=>openWork(w,true),'catalog-result');
          if(photo){const im=el('img');im.src=photo.src;im.alt=photo.caption;im.loading='lazy';card.append(im);}
          const info=el('span','catalog-info');info.append(el('strong','',w.title));card.append(info);grid.append(card);
        }
        body.append(grid);
      }
      const links=new Map([[s.source,s.sourceName||'原始编目'],...(s.sources||[]).map(v=>[v.url,v.label])]);
      for(const [url,label] of links)if(url)body.append(source(label,url));
    });
  }
  function manuscript(item){
    const ticket=++serial;
    const note=featuredManuscripts.get(item.id);
    modal(note?.title || (item.multiPart ? '合编写本' : item.cn) || subLabel(item.shelf),'catalog-file',body=>{
      body.append(action('← 返回写本检索',()=>open(),'shelf-back'),el('p','origin','法国国家图书馆 · 手稿部'),el('h3','subttl',note?.shelf || item.shelf));
      const original=manuscriptExhibits.get(item.shelf);
      const exhibit=original || (note && works.find(work=>work.id===note.comparisonWork));
      if(exhibit){
        const picture=workForDisplay(exhibit).photo;
        if(picture){
          const card=action('',()=>openWork(exhibit,true),'catalog-result');
          const img=el('img');img.src=picture.src;img.alt=picture.caption;
          const label=el('span','catalog-info');label.append(el('strong','',exhibit.title),el('small','',original?'放大原件 →':note.comparisonLabel+' →'));
          card.append(img,label);const grid=el('div','desk-results art-grid');grid.append(card);body.append(grid);
        }
      }
      if(note)body.append(el('p','storytext',note.note),el('p','storytext',note.detail));
      else if(!item.multiPart)body.append(el('p','storytext',item.title));
      const contents=el('div');body.append(contents);contents.textContent='正在打开本地编目…';
      loadJSON('records-'+item.shard+'.json').then(records=>{
        if(ticket!==serial||!contents.isConnected)return;contents.replaceChildren();
        const rec=records[item.id],info=rec.info;
        const featuredPart=note?.partShelf && rec.components.find(part=>part.shelf===note.partShelf);
        const featuredScan=featuredPart?.scans?.[0] || (note && !note.partShelf && rec.scan);
        if(featuredScan)contents.append(source('放大原卷 · '+note.label,featuredScan));
        if(!rec.components.length&&!rec.notes.length&&!info.title)contents.append(el('p','meta','这条记录仅列馆藏号与存档信息。'));
        for(const [key,label] of [['date','编目年代'],['material','形制与保存状况'],['language','文种'],['origin','编目所载责任者']]){
          if(info[key])contents.append(el('h3','subttl',label),el('p','storytext',info[key]));
        }
        if(rec.notes.length){contents.append(el('h3','subttl','编目说明'));for(const t of rec.notes)contents.append(el('p','storytext',t));}
        if(rec.components.length){
          const groups=el('details','site-overview');groups.append(el('summary','','正背面与分件 · '+rec.components.length+' 个编目节点'));
          for(const c of rec.components){const part=el('div','ms-section');if(c.shelf||c.section||c.title)part.append(el('strong','',[(c.shelf||''),(c.section||''),(c.title||'')].filter(Boolean).join(' · ')));
            for(const line of [c.date,c.material,c.language,...(c.note||[])].filter(Boolean))part.append(el('p','',line));
            for(const scan of c.scans || [])part.append(source('查看这部分的数字图像',scan));
            groups.append(part);}
          contents.append(groups);
        }
        if(rec.history.length){contents.append(el('h3','subttl','来源与递藏'));for(const t of rec.history)contents.append(el('p','storytext',t));}
        contents.append(source('法国国家图书馆 · 此件原编目',item.url));
        if(rec.scan && rec.scan!==featuredScan)contents.append(source('Gallica · 此件数字影像',rec.scan));
        contents.append(source('BnF 编目数据及开放许可',institution));
      }).catch(()=>{if(ticket===serial)contents.replaceChildren(el('p','meta','分卷暂未载入。'),action('重试',()=>manuscript(item)));});
    });
  }
  async function read(id){
    state={mode:'ms',siteId:'',hallId:'',q:'',page:0};const ticket=++serial;
    let status;modal('馆内阅卷','catalog-file',body=>{status=el('p','meta','正在取出这卷编目…');body.append(status);});
    try{
      const list=await loadJSON('index.json');const item=list.find(entry=>entry.id===id);
      if(ticket!==serial||!status.isConnected||!status.closest('dialog')?.open)return;
      if(item)manuscript(item);else status.textContent='此藏号没有对应的编目。';
    }catch{if(status.isConnected)status.textContent='未能载入本地书目，可重新打开馆藏总目。';}
  }
  return {open,read};
}
