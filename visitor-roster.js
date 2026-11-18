import {hasDisplayMedia} from './public-media.js';
// The museum and its presence protocol identify visitors independently of their art files.
function photographedVisitor(id, folder, gender, label, description, source, caption) {
  const root = 'assets/visitors-recast/' + folder + '/';
  const image = root + 'reference.webp';
  return {
    id, gender, label, description,
    profile: (gender === 'female' ? '女访客' : '男访客') + ' · 整身扫描',
    body: root + 'gallery.glb',
    walkingBody: root + 'walking.bin',
    detailBody: root + 'portrait.glb',
    portrait: root + 'card.webp',
    reference: hasDisplayMedia(image) ? {image, caption, url: source} : null
  };
}

export const VISITORS = [
  photographedVisitor('qing', 'ning', 'female', '宁遥', '浅青色短袖 · 炭黑运动裤与系带跑鞋',
    'https://huggingface.co/datasets/digitalrealitylab/HSRD-100/tree/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-093',
    '拍摄时的跑步姿态 · 原作者四面视图 · Digital Reality Lab'),
  photographedVisitor('heng', 'lin', 'male', '林澈', '棒球帽与紫色连帽衫 · 牛仔裤和灰白运动鞋',
    'https://sketchfab.com/3d-models/full-body-scan-clean-pose-ae9559912f6240a8a87057911b69edd0',
    '原始全身扫描 · OverseerThuror')
];

// Retired choices can still occur in bookmarks, local storage or an older room.
const identities = new Map([
  ...['ning', 'qing', 'maya', 'rose', 'cardigan', 'slate', 'hoodie'].map(id => [id, 'qing']),
  ...['lin', 'heng', 'sam', 'denim', 'linen', 'brick', 'sage'].map(id => [id, 'heng'])
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
