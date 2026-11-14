import {hasDisplayMedia} from './public-media.js';
import {nirvanaEvidence} from './authentic-158.js';
import {collectionEvidence} from './assets/authentic/collection.js';
import {gapPhotos,gapSources} from './assets/authentic/review-gaps.js';
import {archivePhotographs} from './assets/authentic/archive.js';

import {editionImages,editionById,editionViews,editionReferences} from './assets/collection-edition/index.js';

import {evidence as mogaoPhotos,views as mogaoViews} from './assets/wall-research-mogao/records.js';
import {evidence as maijiPhotos,views as maijiViews} from './assets/wall-research-maiji/records.js';
import {evidence as eastPhotos,views as eastViews} from './assets/wall-research-east/records.js';
const researchedPhotos = {...mogaoPhotos,...maijiPhotos,...eastPhotos};
const researchedViews = {...mogaoViews,...maijiViews,...eastViews};

const unavailable = Object.freeze({
  images: Object.freeze([]), source: '', reason: '此项尚待核对原件影像。'
});

function unfilteredEvidence(work) {
  const id = typeof work === 'string' ? work : work?.id;
  const record = collectionEvidence[id];
  const recent=editionImages[id]||[];
  if (!record) {
    const added=editionById.get(id);
    if(!added)return unavailable;
    return {images:recent,source:added.source,reason:added.periodNote,references:added.sources};
  }
  if (id === 'mogao-158') return {...record, ...nirvanaEvidence};
  const additions = [...(archivePhotographs[id] || []), ...(gapPhotos[id] || [])];
  const officialViews=editionViews[id]||[];
  const references=[...(editionReferences[id]||[]),...officialViews,...(gapSources[id]||[])]
    .filter((item,i,list)=>list.findIndex(other=>other.url===item.url)===i);
  if (!recent.length && !additions.length && !references.length) return record;
  const beforePrior=id==='mogao-257'||!record.images.length;
  const plates=beforePrior?[...recent,...record.images,...additions]:[...record.images,...additions,...recent];
  return {
    ...record, officialViews,
    images: plates.filter((photo,i,list)=>list.findIndex(p=>p.src===photo.src)===i),
    references,
    reason: !record.images.length && (recent.length||additions.length) ? '已按具体窟号或藏品号核对原件影像。' : record.reason
  };
}

function uniqueLinks(links) {
  return links.filter((link,index) => links.findIndex(other => other.url === link.url) === index);
}

export function evidenceFor(work) {
  const id = typeof work === 'string' ? work : work?.id;
  const record = unfilteredEvidence(work);
  const photos = [...(researchedPhotos[id] || []), ...record.images];
  const available = photos.filter((photo,index) => hasDisplayMedia(photo.src) && photos.findIndex(other => other.src === photo.src) === index);
  // A direct view takes precedence if a later source only shows the surroundings.
  const rank = photo => photo.relation ? 2 : photo.contextOnly ? 1 : 0;
  available.sort((a,b)=>rank(a)-rank(b));
  const links = photos.filter(photo => !hasDisplayMedia(photo.src)).map(photo => ({label:photo.caption+' · 原图资料',url:photo.source}));
  const views = uniqueLinks([...(researchedViews[id] || []), ...(record.officialViews || []), ...links]);
  return {...record, images:available, officialViews:views, references:uniqueLinks([...views, ...(record.references || [])]),
    reason: available.length || !links.length ? record.reason : '公开版可通过图版来源查阅这件作品。'};
}
