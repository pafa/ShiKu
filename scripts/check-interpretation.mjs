import {buildCaveRegister} from '../cave-register.js';
import {catalog} from '../collection-extension.js';
// The gallery must never silently pair a revised label with a previous narration.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {works} from '../dynasty-exhibition.js';
import {caves,caveById} from '../cave-plan.js';
import {evidenceFor} from '../object-evidence.js';
import {evidenceAt,chamberPhotos} from '../chamber-evidence.js';
import {workForDisplay} from '../authentic-display.js';
import {readingRoom} from '../story-archive.js';
const path=p=>new URL('../'+p,import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex');
const index=JSON.parse(readFileSync(path('assets/walk/voices/recordings.json')));
const guide=readFileSync(path('exhibition-guide.html'),'utf8');let stops=0;
for(const w of works){
  assert(guide.includes('index.html?structure='+w.id+'"'),w.id+' missing in guide');
  const record=evidenceFor(w), display=workForDisplay(w);
  assert(record.source && record.reason,w.id+' missing provenance decision');
  assert.equal(display.image,record.images[0]?.src);
  const visual=display.visual;
  assert(visual && existsSync(path(visual.src)),w.id+' lacks a visual introduction');
  assert(visual.caption && visual.credit && visual.license && /^https?:/.test(visual.source),w.id+' unsigned introduction');
  if(visual.relatedId)assert(visual.relatedId!==w.id && visual.comparisonNote,w.id+' unidentified comparison');
  if(visual.relation==='related')assert(visual.contextOnly && visual.contextReason,w.id+' unidentified object');
  assert(!display.studyPlate && !display.diagram);
  if(w.image!==(display.photo?.coordinateSource||display.image))assert.deepEqual(display.hotspots,display.photo?.hotspots||[],w.id+' obsolete photograph coordinates');
  for(const pin of display.hotspots)assert(pin.x>=0 && pin.x<=1 && pin.y>=0 && pin.y<=1 && pin.title && pin.body,w.id+' invalid annotation');
  const c=caveById.get(w.id);
  const images=c?chamberPhotos(c):record.images;
  for(const image of images){
    assert(['historical','site','object','document'].includes(image.kind),w.id+' unknown material');
    assert(image.caption&&image.credit&&image.license&&/^https?:/.test(image.source),w.id+' unsigned image');
    assert(!image.src.endsWith('.svg')&&existsSync(path(image.src)),w.id+' invalid source file '+image.src);
  }
  if(c)for(const [i] of c.details.entries()){
    const photograph=evidenceAt(c,i);
    assert(!photograph || images.some(p=>p.src===photograph.src),w.id+' orphaned detail');
  }

  if(!caveById.has(w.id))assert(readingRoom[w.id]?.chapters?.length>=2,w.id+' missing readings');
}
const deer=caveById.get('mogao-257');
assert(evidenceAt(deer,deer.details.findIndex(d=>d.id==='deer'))?.src.endsWith('/deer-colour.webp'));
assert.deepEqual(workForDisplay(deer.work).hotspots.map(pin=>pin.title),['鹿王回首','骑马的国王']);
for(const cave of caves.filter(c=>c.profile))for(const [i,detail] of cave.details.entries()){
  assert.equal(evidenceAt(cave,i)?.src,detail.frame,cave.id+' needs its precisely identified frame');
  assert(detail.point?.every(n=>n>=0 && n<=1),cave.id+' target outside photograph');
}
for(const c of caves)for(const d of c.details){
  const name=c.id+'--'+d.id,record=index[name];
  assert(record&&record.text===sha(d.text),name+' narration needs updating');
  assert.equal(record.edition,'cn-guide-2',name+' stale voice');
  assert(typeof record.transcript==='string' && record.transcript.length>10 && /^[a-f0-9]{64}$/.test(record.spoken) && /^[a-f0-9]{64}$/.test(record.recipe) && record.seconds>=3,name+' unreviewed spoken edition');
  assert.equal(sha(readFileSync(path('assets/walk/voices/'+name+'.mp3'))),record.audio,name+' wrong audio');
  stops++;
}
assert.equal(Object.keys(index).length,stops);
console.log(works.length+' 件展品均有可用的首展图像或模型，图像署名与细节坐标已核对；'+stops+' 段录音与当前字幕、音轨文件匹配。');

const register=buildCaveRegister(works);
assert.equal(register.length,catalog.length);
const inCave=(site,n,id)=>register.find(row=>row.siteId===site && row.number==='第'+n+'窟')?.related.some(work=>work.id===id);
for(const id of ['longmen-1280-ananda','longmen-1280-yaksha','longmen-1280-kasyapa'])assert(inCave('longmen',1280,id));
for(const n of [28,30])assert(inCave('maijishan',n,'maijishan-28-30-painted-walls'));
assert(inCave('longmen',1443,'longmen-rubbing-niujue'));
console.log(register.length+' 条原始窟龛编目保留独立身份，子件及跨窟材料关联通过。');
