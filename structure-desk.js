import {hasDisplayMedia} from './public-media.js';
import {evidenceAt, chamberPhotos} from './chamber-evidence.js';
import {workForDisplay, mediaLabel} from './authentic-display.js';
import {collectionScans, originalCaveResource} from './collection-scans.js';
import * as editions from './assets/authentic/detail-images.js';
import {inspectPlate} from './plate-inspector.js';

function node(tag, cls, text) {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  if (text) element.textContent = text;
  return element;
}
function button(text, run, cls) {
  const item = node('button', cls, text);
  item.type = 'button';
  item.onclick = run;
  return item;
}
function link(text, url) {
  const a = node('a', '', text + ' ↗');
  a.href = url;
  a.rel = 'noopener noreferrer';
  a.target = '_blank';
  return a;
}

export function mountStructure(host, {s:raw, c, reading, visit, initialMedia, initialDetail}) {
  const s = workForDisplay(raw);
  const photos = c ? chamberPhotos(c) : s.evidence.images;
  const capture=collectionScans[s.id];
  const root = node('article', 'sd evidence-desk');
  const header = node('header', 'sd-header');
  header.append(node('h2', '', s.number + ' · ' + s.title), node('span', 'sd-shelf', s.siteName + '　／　' + s.era));
  const body = node('div', 'sd-body');
  const board = node('section', 'sd-board');
  const bar = node('div', 'sd-platehead');
  const kind = node('span');
  const sequence = node('span');
  bar.append(kind, sequence);
  const media = node('div', 'sd-media');
  const view = node('div', 'sd-view plate-view');
  view.tabIndex = 0;
  view.setAttribute('aria-label','实物图像，支持缩放和拖动');
  const scan = node('div', 'scan-pane');
  const registered = node('div','registered-pair');
  const cameraBox = node('div','registered-box');
  const independentPhoto = node('img','registered-photo');
  const divider = node('div','registered-divider');
  cameraBox.append(independentPhoto,divider);
  registered.append(cameraBox); registered.hidden=true;
  const note = node('div', 'source-leaf');
  media.append(view, scan, note, registered);
  const tools = node('div', 'sd-tools');
  const caption = node('div', 'ed-credit');
  board.append(bar, media, tools, caption);
  const rail = node('section', 'sd-notes');
  const position = node('div', 'sd-num');
  const title = node('h3');
  const copy = node('p','sd-copy');
  const ref = node('div','ed-ref');
  const essayList = node('div','ed-essays');
  rail.append(position, title, copy, ref, essayList);
  body.append(board,rail);
  root.append(header,body);
  host.append(root);

  let selected = -1, photo = null, viewer = null, frame = null;
  let mode = 'photo', selectedEntry = null, split = 50;
  const entries = [];
  if (c) {
    c.details.forEach((d,i)=>entries.push({title:d.title,text:d.text,source:d.source,photo:evidenceAt(c,i),station:i}));
  }
  s.hotspots.forEach((h,i)=>entries.push({title:h.title,text:h.body,source:h.source,photo:s.photo,hotspot:i}));
  for (const ch of reading?.chapters || []) entries.push({title:ch.title,text:ch.body,source:ch.source?.url || s.source,sourceLabel:ch.source?.label});
  const entryButtons = [];
  const uniqueSources = new Set();
  const sources = node('details','sd-sources');
  sources.append(node('summary','','查阅原始资料'));
  function addSource(label,url){
    if (!url || uniqueSources.has(url)) return;
    sources.append(link(label || '资料记录',url));
    uniqueSources.add(url);
  }
  addSource(s.sourceName || '本件著录',s.source);
  if(s.id==='yungang-20') {
    const validation=node('p','','同机位人工描画主佛正面头部轮廓，重合度为97.9%。这一数值只对应照片中可见的头部轮廓。');
    sources.append(validation);
    if(hasDisplayMedia('preview/yungang-frontal-check.jpg'))addSource('查看对照图与轮廓','./preview/yungang-frontal-check.jpg');
  }
  if(s.evidence.viewer)addSource(s.evidence.viewerLabel||'原机构图版',s.evidence.viewer);
  if(s.id==='longmen-met-35146'){
    sources.append(node('p','','馆方正面照片与模型投影的浮雕外轮廓重合度为98.93%。历史上原窟转角的形状不在此次比对范围内。'));
    addSource('馆方模型、照片、尺寸与使用依据','./assets/authentic/scans/SOURCES.md');
  }
  if(capture)addSource(capture.title,capture.source);
  for(const item of s.evidence.references||[])addSource(item.label,item.url);
  const panorama=editions.workViewers?.[s.id];
  const digitalResource=panorama || originalCaveResource(s);
  if(digitalResource)rail.prepend(link(panorama?'进入数字敦煌全景':'进入数字敦煌看本窟',digitalResource));
  for(const item of [...(c?.sources || []), ...(reading?.sources || [])]) addSource(item.label,item.url);
  if(s.evidence.officialViews?.length){
    const choices=node('div','sd-originals');
    for(const item of s.evidence.officialViews)choices.append(link('看馆方原图 · '+item.label,item.url));
    rail.prepend(choices);
  }
  rail.append(sources);
  function summary() {
    selected = -1; selectedEntry = null;
    position.textContent = s.siteName+'　／　'+s.number;
    title.textContent = s.title;
    copy.textContent = s.story || s.feature;
    ref.replaceChildren();
    if(s.evidence.references?.length){const first=s.evidence.references[0];ref.append(link(first.label,first.url));}
    if(s.holding)ref.append(node('p','ed-id',[s.holding,s.accession].filter(Boolean).join(' · ')));
    entryButtons.forEach(b=>b.setAttribute('aria-pressed','false'));
  }
  function pickEntry(i) {
    const entry=entries[i];if(!entry)return;
    selected=i;selectedEntry=entry;
    entryButtons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
    position.textContent = Number.isInteger(entry.station) ? '驻足细读' : '作品导读';
    title.textContent=entry.title;copy.textContent=entry.text;ref.replaceChildren();
    if(entry.source)ref.append(link(entry.sourceLabel || '此处资料',entry.source));
    if(visit && Number.isInteger(entry.station))ref.append(button('走到这个展位',()=>visit(entry.station),'sd-enter'));
    if(entry.photo){showPhoto(entry.photo);if(Number.isInteger(entry.hotspot))viewer?.focus(entry.hotspot);}
    else if(Number.isInteger(entry.station)){showPhoto(null);}
  }
  if(entries.length) {
    essayList.append(node('h4','',c?'驻足与导读':'细节与导读'));
    for(const [i,entry] of entries.entries()) {
      const b=button(entry.title,()=>pickEntry(i));
      b.setAttribute('aria-pressed','false');
      essayList.append(b);entryButtons.push(b);
    }
  }
  function release() {
    viewer?.destroy();viewer=null;
    if(frame){frame.remove();frame=null;}
  }
  function showPhoto(next) {
    release();
    mode='photo';photo=next;
    media.dataset.mode=next?'photo':'record';
    view.hidden=!next;note.hidden=!!next;scan.hidden=true;registered.hidden=true;
    note.replaceChildren();caption.replaceChildren();
    if(next){
      const points=next.originalFrame && next.src===s.photo?.src ? s.hotspots : [];
      viewer=inspectPlate(view,next,points,idx=>pickEntry(c?c.details.length+idx:idx));
      kind.textContent=mediaLabel(next);
      const number=photos.findIndex(p=>p.src===next.src);
      sequence.textContent=number<0?'':(number+1)+' / '+photos.length;
      caption.append(node('span','',next.caption),link([next.credit,next.license].filter(Boolean).join(' · ')||'图像原始记录',next.source));
      if(editions.institutionalViewers[next.src])caption.append(link('在来源处看高清原图',editions.institutionalViewers[next.src]));
    } else {
      const official=s.evidence.officialViews?.[0];
      kind.textContent=official?'馆方图像':'文献记录';sequence.textContent='';
      if(official)note.append(link(official.label,official.url));
      note.append(node('p','ed-subject',s.siteName+' · '+s.number),node('h3','',selectedEntry?.title||s.title),
        node('p','',selectedEntry?'此处由窟志记载，尚缺可核实的局部照片。':s.evidence.reason||'本件以馆藏著录展出。'),
        link('打开原始著录',selectedEntry?.source||s.evidence.source||s.source));
      if(s.evidence.viewer)note.append(link(s.evidence.viewerLabel||'在原机构查看本件影像',s.evidence.viewer),node('p','ed-subject',s.evidence.viewerNote));
      if(photos.length)note.append(button('查看本窟已收录影像',()=>{summary();showPhoto(photos[0]);},'sd-enter'));
    }
    paintTools();
  }
  function showScan(compare=false) {
    release();
    const aligned=compare && !!capture.registration;
    mode=aligned?'registered':compare?'compare':'scan';media.dataset.mode=mode;
    registered.hidden=!aligned;scan.hidden=aligned;note.hidden=true;view.hidden=!compare||aligned;
    if(compare && photos.length) {
      photo=photos[0];
      if(aligned) {
        const referencePhoto=photo;
        independentPhoto.onerror=()=>{
          independentPhoto.onerror=null;
          if(independentPhoto.getAttribute('src')!==referencePhoto.src)independentPhoto.src=referencePhoto.src;
        };
        independentPhoto.src=photo.detailSrc || editions.detailImages[photo.src] || photo.src;
        independentPhoto.alt=photo.caption;
        cameraBox.style.setProperty('--split',split+'%');
      } else viewer=inspectPlate(view,photo);
    }
    frame=node('iframe');frame.src=capture.viewer+(aligned?'&reference='+capture.registration:'');
    frame.title=capture.title;frame.allow='fullscreen; autoplay';frame.allowFullscreen=true;
    if(aligned){frame.tabIndex=-1;cameraBox.prepend(frame);}else scan.append(frame);
    kind.textContent=aligned?'同一视角 · 拖动分界线':compare?'实物照片与摄影测量':'实物摄影测量';
    sequence.textContent='';
    caption.replaceChildren(node('span','',aligned?capture.comparisonNote:capture.note),
      link(capture.online?'打开馆方原始查看器 · '+capture.credit:capture.credit,capture.source));
    if(aligned)caption.append(link(photo.credit+' · '+photo.license,photo.source));
    paintTools();
  }
  function setSplit(value) {
    split=Math.min(100,Math.max(0,value));
    cameraBox.style.setProperty('--split',split+'%');
    const range=tools.querySelector('input[type=range]');
    if(range)range.value=String(Math.round(split));
  }
  function slide(event) {
    const bounds=cameraBox.getBoundingClientRect();
    if(bounds.width)setSplit(100*(event.clientX-bounds.left)/bounds.width);
  }
  cameraBox.onpointerdown=event=>{cameraBox.setPointerCapture(event.pointerId);slide(event);};
  cameraBox.onpointermove=event=>{if(cameraBox.hasPointerCapture(event.pointerId))slide(event);};
  function paintTools() {
    tools.replaceChildren();
    if(photos.length>1 && mode==='photo') {
      for(const [name,step] of [['上一张',-1],['下一张',1]]) {
        tools.append(button(name,()=>{const i=photos.findIndex(p=>p.src===photo?.src);summary();showPhoto(photos[(i+step+photos.length)%photos.length]);}));
      }
    }
    if(mode==='photo'&&photo){
      const smaller=button('−',()=>viewer?.zoom(1/1.35)), larger=button('＋',()=>viewer?.zoom(1.35));
      smaller.setAttribute('aria-label','缩小图像');larger.setAttribute('aria-label','放大图像');
      const native=button('原大',()=>viewer?.native());native.title='按图像实际像素查看';
      tools.append(smaller,button('全幅',()=>viewer?.reset()),native,larger);
    }
    if(mode==='registered'){
      const label=node('label','pair-range','实拍');
      const slider=node('input');slider.type='range';slider.min='0';slider.max='100';slider.value=String(split);
      slider.setAttribute('aria-label','实拍照片显示比例');slider.oninput=()=>setSplit(slider.valueAsNumber);
      label.append(slider,document.createTextNode('扫描'));tools.append(label);
    }
    if(capture?.online && !capture.viewer){
      tools.append(link('馆方摄影测量档案',capture.source));
    }
    if(capture?.viewer){
      if(mode!=='photo'&&photos.length)tools.append(button('原物照片',()=>showPhoto(photos[0])));
      if(mode!=='scan')tools.append(button(capture.online?'馆方三维 · 联网':'旋转实测模型',()=>showScan()));
      if(mode!=='compare'&&mode!=='registered'&&photos.length)tools.append(button(capture.registration?'同角度对照':'照片与模型并看',()=>showScan(true)));
    }
    tools.hidden=!tools.childElementCount;
  }
  summary();
  if(capture?.viewer && ['scan','compare'].includes(initialMedia)) showScan(initialMedia==='compare');
  else if(Number.isInteger(initialDetail) && initialDetail>=0) pickEntry(initialDetail);
  else {
    showPhoto(photos[0]||null);
    if(capture?.online && !capture.viewer){
      ref.append(node('p','ed-id',capture.note),link('馆方模型与采集说明',capture.source));
    }
  }
  return {destroy(){release();root.remove();}};
}
