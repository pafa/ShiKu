import * as scriptures from './scriptures/records.js';

import * as wallColour from './wall-colour/records.js';
import * as mogao from './mogao/records.js';
import * as maiji from './maiji/records.js';
import * as east from './east/records.js';
const groups=[scriptures,wallColour,mogao,maiji,east];
export const editionImages=Object.assign({},...groups.map(group=>group.images));
export const editionViews=Object.assign({},maiji.references,...groups.map(group=>group.officialViews||{}));
export const editionReferences=Object.assign({},...groups.map(group=>group.references||{}));
export const editionDetails=Object.fromEntries(Object.values(editionImages).flat()
  .filter(p=>p.detailSrc && p.detailSrc!==p.src).map(p=>[p.src,p.detailSrc]));

export const editionWorks=groups.flatMap(group=>group.newWorks.map(work=>{
  const first=group.images[work.id][0];
  const source={label:work.sourceName,url:work.source};
  const sources=[...(work.sources||[source])];
  for(const picture of group.images[work.id]){
    if(!sources.some(s=>s.url===picture.source))sources.push({label:picture.credit+' · 图版原记录',url:picture.source});
  }
  return {...work,hallId:work.hallId||work.homeHall,periodNote:work.periodNote||work.reason,
    image:first.src,alt:first.caption,imageNote:first.caption,
    credit:{author:first.credit,license:first.license,licenseUrl:first.licenseUrl||first.source,source:first.source},
    chapters:work.chapters||[{title:'从哪里看起',body:[work.feature,work.look].join(''),source},
      {title:'来历与年代',body:work.story,source}],sources,hotspots:work.hotspots||[],newAcquisition:true};
}));
export const editionById=new Map(editionWorks.map(work=>[work.id,work]));
