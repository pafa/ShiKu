// Image records refer to photographs of objects in Mogao 158. Dimensions are
// image pixel dimensions, not inferred dimensions of a sculpture or a wall.
const directory = 'assets/authentic/mogao158/';
const academy = 'https://www.dha.ac.cn/info/1425/3663.htm';
const paper = 'https://link.springer.com/article/10.1007/s11263-022-01665-x#Fig1';
const ccBy = 'https://creativecommons.org/licenses/by/4.0/';
const publicDomain = 'https://creativecommons.org/publicdomain/mark/1.0/';

const westBuddha = {
  src: directory + 'west-buddha.webp',
  kind: 'site',
  caption: '莫高窟第158窟西壁卧佛原址彩照，画面可见佛首、颈部、枕和肩上的衣褶。',
  credit: 'Tianxiu Yu、Cong Lin、Shijie Zhang 等 / International Journal of Computer Vision（2022），图1a',
  source: paper,
  license: 'CC BY 4.0',
  licenseUrl: ccBy,
  modified: '从论文图1取出完整子图a，裁除白边与编号，保留原彩色，转为WebP。',
  width: 769,
  height: 440,
};

function originalPlate(file, number, caption, width, height, detail = false) {
  return {
    src: directory + file + '.webp',
    kind: 'historical',
    caption,
    credit: '夏尔·努瓦特摄（1908），伯希和《敦煌石窟》第一卷，第' + number + '图',
    source: 'https://dsr.nii.ac.jp/reference/pelliot/entry/1-' + String(number).padStart(3, '0') + '.html.zh',
    license: '公有领域（1908年摄影，1920年出版）',
    licenseUrl: publicDomain,
    modified: detail ? '原书扫描的细部裁切，保留黑白影调。' : '从原书扫描中提取照片，校正页面朝向，保留黑白影调。',
    width,
    height,
  };
}

const south = originalPlate('south', 62, '南壁与佛坛一角，立佛右侧是迦叶、阿难与举哀者。', 1012, 1381);
const west = originalPlate('west', 63, '西壁北段与卧佛下身，实物衣缘遮住一部分壁画，后方可见多层人物。', 1388, 1026);
const guardians = originalPlate('guardians', 63, '西壁北段原壁画局部，护法的冠饰与头光并列在衣缘上方。', 1119, 508, true);
const north = originalPlate('north', 64, '北壁各国王子举哀图，左下方伸入画面的是卧佛足端。', 1378, 1011);
const feet = originalPlate('feet', 64, '北壁旧影局部，前方是卧佛的足趾，后方是壁画上的举哀者。', 903, 352, true);
const east = originalPlate('east', 57, '东壁门北《金光明最胜王经变》，下方屏风画与上方说法会同在一个画面内。', 1395, 1020);

export const nirvanaDetails = {
  threshold: westBuddha,
  cheek: westBuddha,
  kasyapa: south,
  assembly: west,
  guardians,
  royals: north,
  folds: feet,
  east,
};

export const nirvanaEvidence = {
  images: [westBuddha, south, west, guardians, north, feet, east],
  source: academy,
  reason: '佛首可对照原址彩照，壁面与佛足可对照1908年原窟旧影。各图保留镜头所及的范围。',
};
