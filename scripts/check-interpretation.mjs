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
  assert(!display.studyPlate && !display.diagram);
  if(w.image!==(display.photo?.coordinateSource||display.image))assert.equal(display.hotspots.length,0,w.id+' obsolete photograph coordinates');
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
for(const c of caves)for(const d of c.details){
  const name=c.id+'--'+d.id,record=index[name];
  assert(record&&record.text===sha(d.text),name+' narration needs updating');
  assert.equal(record.edition,'cn-guide-2',name+' stale voice');
  assert(typeof record.transcript==='string' && record.transcript.length>10 && /^[a-f0-9]{64}$/.test(record.spoken) && /^[a-f0-9]{64}$/.test(record.recipe) && record.seconds>=3,name+' unreviewed spoken edition');
  assert.equal(sha(readFileSync(path('assets/walk/voices/'+name+'.mp3'))),record.audio,name+' wrong audio');
  stops++;
}
assert.equal(Object.keys(index).length,stops);
console.log(works.length+' 件藏品的原件影像或文献入口均与审定记录相符；'+stops+' 段录音与当前字幕、音轨文件匹配。');
