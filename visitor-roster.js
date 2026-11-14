import {hasDisplayMedia} from './public-media.js';
// Gallery names are aliases. Both detail levels for each visitor come from the same subject.
function scan(id,gender,label,description,reference,edition='visitors-fitted'){
  const folder='assets/'+edition+'/'+id+'/';
  const referenceImage = 'assets/visitors-natural/'+id+'/reference.webp';
  return {id,gender,label,description,profile:(gender==='female'?'女访客':'男访客')+' · 真人原型',
    body:folder+'gallery.glb',detailBody:folder+'portrait.glb',portrait:'assets/visitors-fitted/'+id+'/card.webp',
    reference:hasDisplayMedia(referenceImage) ? {image:referenceImage,...reference} : null};
}
export const VISITORS=[
  scan('qing','female','青禾','灰绿衬衣 · 燕麦灰直筒裤与黑白系带鞋',{
    caption:'换装前 · 原模型四面视图 · Atelier Brown',
    url:'https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f'},'visitors-trousers'),
  scan('heng','male','行川','石青圆领短袖 · 深灰斜纹裤与运动鞋',{
    caption:'换装前 · 眼平机位的原始照片 · Yukihiro Iwayama',
    url:'https://github.com/HappyOcean/Full_Body_Photogrammetry'})
];

// Retired choices can still occur in bookmarks, local storage or an older room.
const identities = new Map([
  ...['qing', 'maya', 'rose', 'cardigan', 'slate', 'hoodie'].map(id => [id, 'qing']),
  ...['heng', 'sam', 'denim', 'linen', 'brick', 'sage'].map(id => [id, 'heng'])
]);

export function resolveVisitorId(value) {
  return identities.get(value) ?? null;
}

// The previous presence protocol already had these two gendered wire IDs.
// They never select a file. Keeping them on the wire allows staggered refreshes.
export function legacyVisitorId(canonical) {
  if (canonical === 'qing') return 'maya';
  if (canonical === 'heng') return 'sam';
  return null;
}
