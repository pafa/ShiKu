// A detail may be documented in text without surviving in an available photograph.
// Only list an image for that detail when the photographed subject can be identified.
import {hasDisplayMedia} from './public-media.js';
import {evidenceFor} from './object-evidence.js';
import {nirvanaEvidence,nirvanaDetails} from './authentic-158.js';

const commons = file => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replaceAll(' ', '_'));
function plate(src, caption, credit, source, license, kind='site') {
  return Object.freeze({src,caption,credit,source,license,kind});
}
const feng = {
  west: plate('assets/walk/fengxian/west.webp','奉先寺西壁 · 卢舍那佛、弟子、菩萨与上方岩檐','Zhangzhugang',commons('Luoyang Longmen Shiku 2018.12.16 09-43-06.jpg'),'CC BY-SA 4.0'),
  north: plate('assets/walk/fengxian/north.webp','奉先寺北壁 · 天王与力士','G41rn8',commons('Luoyang 2006 7-27.jpg'),'CC BY-SA 4.0'),
  south: plate('assets/walk/fengxian/south.webp','奉先寺南壁 · 现存护法造像','Gary Todd',commons('Southern Wall, Fengxian Temple, Longmen Grottoes (10240301646).jpg'),'CC0 1.0')
};
const east=(file,caption,name)=>plate('assets/authentic/chambers/'+file+'.webp',caption,'Patrick20242023',commons('云冈石窟第十二窟'+name+'.jpg'),'CC BY-SA 4.0');
const longmen=(file,caption,name)=>plate('assets/authentic/chambers/'+file+'.webp',caption,'Gary Todd',commons('Ancient Buddhist Grottoes at Longmen- Lianhua (Lotus Flower) Grotto'+name+'.jpg'),'CC0 1.0');
const stein=plate('assets/experience/mogao/320-stein-north.webp','第320窟北壁 · 阿弥陀净土变','Aurel Stein，《Serindia》卷二，1921年，图210','https://archive.org/details/in.ernet.dli.2015.69620/page/n319/mode/1up','公有领域','historical');
const firstStele=plate('assets/experience/maiji/first-entire.webp','麦积山第133窟 · 一号千佛碑','名取洋之助，1956年摄影','https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605','公有领域','historical');
const rahula=plate('assets/experience/maiji/song-father-son.webp','麦积山第133窟 · 释迦会子，1956年所摄局部','名取洋之助，1956年摄影','https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605','公有领域','historical');
const print=plate('assets/experience/print/print.webp','《金刚经》卷首和经文 · Or.8210/P.2','大英图书馆',commons('Diamond Sutra of 868 AD - The Diamond Sutra (868), frontispiece and text - BL Or. 8210-P.2.jpg'),'CC0 1.0','document');
const star=plate('assets/experience/mogao/sky-scroll.webp','《敦煌星图》天图部分 · Or.8210/S.3326','大英图书馆',commons('Dunhuang Star Atlas - complete.jpg'),'公有领域','document');
const eastCliff=plate('assets/authentic/chambers/maiji-13-triad.webp','麦积山东崖第13窟 · 三尊造像、泥层剥蚀处与栈阁','Anagoria',commons('2016-12-15 Maijishan Grotten 麥積山石窟 anagoria 06.JPG'),'CC BY 3.0');
const special = {
  'maijishan-13':{face:eastCliff,flanks:eastCliff,core:eastCliff},
  'longmen-1280':{approach:feng.west,cornice:feng.west,assembly:feng.west,vairocana:feng.west,pedestal:feng.west,attendants:feng.west,guardians:feng.north},
  'yungang-12':{
    coffers:east('yg-ceiling','云冈第12窟前室 · 窟顶','前殿窟顶'),
    ensemble:east('yg-northoblique','云冈第12窟前室 · 明窗上方乐列','前殿正壁侧面视角'),
    window:east('yg-window','云冈第12窟前室 · 明窗','前殿正壁明窗特写'),
    eaves:east('yg-east','云冈第12窟前室 · 右壁仿木构','前殿右壁正面视角')
  },
  'longmen-712':{petals:longmen('lm-ceiling','龙门莲花洞 · 原址窟顶莲花',' Ceiling'),image:longmen('lm-main','龙门莲花洞 · 正壁造像',', Main Buddhist Statue, Northern Wei')},
  'mogao-61':{
    princess:plate('assets/caves/mogao/61-benefactress.webp','第61窟东壁北侧 · 女供养人','五代画工',commons('Dunhuang Mogao cave Cao donor figures.jpg'),'公有领域'),

  },

  'mogao-320':{'north-panel':stein},
  'maijishan-133':{
    stele:plate('assets/authentic/chambers/maiji-133-stele.webp','第133窟十号佛传碑 · 完整正面原图','Zejie Lin、Zhijun Li、Meizi Xie，《Religions》15(3)，图1','https://doi.org/10.3390/rel15030254','CC BY 4.0'),
    crossed:plate('assets/authentic/chambers/maiji-133-crossed.webp','第133窟 · 交脚菩萨，1956年完整摄影','名取洋之助，1956年摄影','https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605','公有领域','historical'),
    thousand:firstStele,rahula
  },
  'maijishan-4':{coffers:plate('assets/authentic/chambers/maiji-4-roof.webp','第4窟 · 廊顶残片，彩绘马匹与人物','Shizhao',commons('Majishan grotto 004 (5).jpg'),'CC BY-SA 3.0')},
  'longmen-543':{ceiling:plate('assets/caves/east/wan-ceiling.webp','龙门万佛洞 · 窟顶原址摄影','Gary Todd',commons('Ancient Buddhist Grottoes at Longmen- Grotto of Buddhas Ceiling.jpg'),'CC0 1.0')},
  'mogao-bl-or8210-p2':{front:print,cut:print,type:print,sky:star,pole:star}
};
special['longmen-712'].edge=special['longmen-712'].petals;
special['mogao-158']=nirvanaDetails;

// Only the known original catalogue plate is assigned to these fine details.
// A new photograph of the same site may show a completely different wall.
const catalogueDetails = {
 'yungang-20':['assets/photo/yungang-20.jpg','robe','east','fracture'],
 'mogao-257':['assets/west/mg257.jpg','deer'],
 'mogao-401':['assets/west/mg401.jpg','donor'],
 'longmen-543':['assets/east/wanfo.jpg','lotus-tree'],
 'mogao-217':['assets/west/mg217.jpg','paradise'],
 'mogao-96':['assets/west/mg96.jpg','face','lap'],
 'longmen-435':['assets/east/moya.jpg','mainsitting','side-sitting','unworked'],
 'longmen-1387':['assets/east/yaofang.jpg','different-dates','attendant'],
 'maijishan-13':['assets/west/mj13.jpg','face','flanks','silhouette'],
 'maijishan-165':['assets/west/mj165.png','donor'],
 'maijishan-120':['assets/west/mj120.png','monk'],
 'maijishan-133':['assets/west/mj133.jpg','stele'],
 'mogao-407':['assets/experience/mogao/407-hare.webp','hares'],
 'yungang-3':['assets/east/y3.jpg','triad'],
 'mogao-98':['assets/collection/mogao/cave-98.webp','family']
};
// The catalogue OCR and the Academy occasionally disagree on a wall direction.
// The plate numbers below only link a station when both subject and cave match.
const archiveDetails={
  'mogao-249':{asura:'179'},
  'mogao-257':{deer:'189'},
  'mogao-285':{bandits:'252'},
  'mogao-61':{wutai:'221',gate:'198'},
  'mogao-217':{monk:'120'},
  'mogao-302':{tower:'294'},
  'mogao-98':{family:'134',khotan:'133'},
  'mogao-146':{layers:'23'}
};
export function evidenceAt(c,index){
  const detail=c?.details[index];
  if(!detail)return null;
  const precise=special[c.id]?.[detail.id];
  if(precise && hasDisplayMedia(precise.src))return precise;
  const record=evidenceFor(c.work),rule=catalogueDetails[c.id];
  const feature=(record.images||[]).find(image=>!image.relation && image.details?.includes(detail.id));
  if(feature)return feature;
  if(c.id==='mogao-285'&&detail.id==='dated')return record.images.find(p=>p.src.endsWith('285-yu-4a.webp'))||null;
  const plateNumber=archiveDetails[c.id]?.[detail.id];
  if(plateNumber){const found=record.images.find(image=>image.plate===plateNumber);if(found)return found;}
  if(rule?.slice(1).includes(detail.id))return record.images.find(image=>image.src===rule[0])||null;
  return null;
}
export function chamberPhotos(c){
  const photos=[...(c.id==='mogao-158'?nirvanaEvidence.images:[]),...Object.values(special[c.id]||{}),...evidenceFor(c.work).images];
  if(c.id==='longmen-1280')photos.push(feng.south);
  return [...new Map(photos.filter(image=>image && !image.relation && hasDisplayMedia(image.src)).map(image=>[image.src,image])).values()];
}
