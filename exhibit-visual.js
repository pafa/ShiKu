import {works} from './dynasty-exhibition.js';
import {evidenceFor} from './object-evidence.js';
import {spaceStudies,studyPoster} from './space-studies.js';
import {hasDisplayMedia} from './public-media.js';
import {comparisons} from './visual-comparisons.js';

const catalogue = new Map(works.map(work => [work.id,work]));

export function visualLabel(image) {
  if (!image) return '文献记录';
  if (image.kind === 'space') return '窟室尺度模型';
  if (image.relation === 'comparison') return '其他作品对照';
  if (image.relation === 'related') return '相关实物对照';
  if (image.contextOnly) return '同址参考图';
  return {site:'原址实拍',historical:'历史摄影',object:'馆藏原件',document:'文献图版'}[image.kind] || '实物图版';
}

export function exhibitVisual(work, evidence=evidenceFor(work)) {
  const photo = evidence.images[0];
  if (photo) return photo;
  const study = spaceStudies[work.id];
  if (study && hasDisplayMedia(studyPoster(work.id))) {
    return {kind:'space',src:studyPoster(work.id),caption:study.title+'。'+study.note,
      credit:'ShiKu · 据调查尺寸建模',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:study.source};
  }
  const pair = comparisons[work.id];
  if (!pair) return null;
  const other = catalogue.get(pair[0]);
  const photos = other ? evidenceFor(other).images : [];
  const reference = pair[3] ? photos.find(photo=>photo.src===pair[3]) : photos[0];
  if (!reference) return null;
  const sameCave = other.siteId === work.siteId && /^第\d+窟/.test(other.number) && other.number.match(/^第\d+窟/)[0] === work.number.match(/^第\d+窟/)?.[0];
  return {...reference,originalFrame:false,details:[],contextOnly:sameCave,relation:sameCave?undefined:'comparison',relatedId:other.id,
    caption:other.siteName+' · '+other.number+'《'+other.title+'》。'+reference.caption,
    comparisonTitle:pair[1],comparisonNote:pair[2]};
}

export function visualCategory(image) {
  if (!image) return 'text';
  if (image.kind==='space') return 'space';
  if (image.relation==='comparison'||image.relation==='related') return 'comparison';
  return image.contextOnly?'context':'photo';
}

export function visualCounts(works) {
  const counts={photo:0,context:0,space:0,comparison:0,text:0};
  for (const work of works) counts[visualCategory(exhibitVisual(work))]++;
  return counts;
}
