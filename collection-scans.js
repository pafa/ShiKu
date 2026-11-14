// The online viewer is loaded only when a visitor requests the museum's scan.
export const collectionScans = {
  'yungang-20': {
    registration: 'dudva', comparisonNote: '左侧为 Dudva 的原址照片，右侧为同角度的原始扫描。',
    title: '云冈第20窟局部摄影测量', viewer: './real-viewer/?embed=1',
    source: 'https://zenodo.org/records/10362794', credit: 'Di Luo · CC BY 4.0',
    note: 'Di Luo 原址采集。主佛、胁侍与岩壁在采集边界处有缺测。'
  },
  'longmen-met-35146': {
    registration: 'met', comparisonNote: '左侧为大都会馆藏正面照，右侧为依照同一机位显示的馆方三维模型。',
    title: '大都会艺术博物馆 · 孝文帝礼佛图', viewer: './real-viewer/relief.html?embed=1',
    source: 'https://www.metmuseum.org/art/collection/search/42707', credit: '大都会艺术博物馆 · 35.146',
    note: '宾阳中洞原件。馆藏著录高208.3厘米、宽393.7厘米。图像与三维数据来自大都会艺术博物馆。'
  },
  'mogao-328-kneeling': {
    title: '哈佛艺术博物馆 · 第328窟跪姿供养菩萨原件',
    viewer: null,
    source: 'https://sketchfab.com/3d-models/kneeling-attendant-bodhisattva-129635ad396947a7975c9e5ba6095f32',
    credit: '哈佛艺术博物馆 · CC BY 4.0', online: true,
    note: '哈佛艺术博物馆与哈佛图书馆于2024年采集馆藏原件1924.70。泥塑连莲座高121.9厘米。'
  }
};

const academyCaves = new Set([254,257,249,285,301,302,303,390,420,57,220,321,322,323,329,23,66,103,172,194,217,320,112,12,17,107,61,3]);
export function originalCaveResource(work) {
  const match = /^mogao-(\d+)$/.exec(work.id);
  if (!match || !academyCaves.has(Number(match[1]))) return null;
  return 'https://www.e-dunhuang.com/cave/10.0001/0001.0001.' + match[1].padStart(4,'0');
}
