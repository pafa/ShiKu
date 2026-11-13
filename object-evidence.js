import {hasDisplayMedia} from './public-media.js';
import {nirvanaEvidence} from './authentic-158.js';
import {collectionEvidence} from './assets/authentic/collection.js';
import {gapPhotos,gapSources} from './assets/authentic/review-gaps.js';
import {archivePhotographs} from './assets/authentic/archive.js';

import {editionImages,editionById,editionViews,editionReferences} from './assets/collection-edition/index.js';

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

export function evidenceFor(work) {
  const record = unfilteredEvidence(work);
  const available = record.images.filter(image => hasDisplayMedia(image.src));
  if (available.length === record.images.length) return record;
  const links = record.images.filter(image => !hasDisplayMedia(image.src))
    .map(image => ({label: image.caption + ' · 原图资料', url: image.source}));
  const references = [...new Map([...(record.references || []), ...links].map(link => [link.url, link])).values()];
  return {...record, images: available, references, officialViews: [...(record.officialViews || []), ...links],
    reason: available.length ? record.reason : '公开版可通过图版来源查阅这件作品。'};
}
