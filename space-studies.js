const survey = 'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/dhyj/dhyj2003/0306pdf/030608.pdf';
const register = 'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/dhyj/dhyj2008/0805pdf/080506.pdf';

// Metres. Box positions are illustrative; dimensions are the reported interior or remnant dimensions.
export const spaceStudies = {
  'maijishan-197': {
    title:'王子洞的方台与窟室', source:survey+'#page=1', sourceName:'麦积山石窟艺术研究所 · 王子洞窟区调查简报',
    note:'窟室宽2.75米、深2.10米、高2.20米。左壁龛前的台座高0.33米，本图仅表现空间与台座。顶面折线示意攒尖形式。',
    rooms:[{width:2.75,depth:2.10,height:2.20,roof:'pyramid'}], platform:{width:.47,depth:.70,height:.33}
  },
  'maijishan-202': {
    title:'前室与后禅室', source:survey+'#page=2', sourceName:'麦积山石窟艺术研究所 · 王子洞窟区调查简报',
    note:'前室宽1.72米、深1.54米、高1.63米。后室宽0.88米、深1.13米、高1.10米。顶面折线分别标示攒尖顶与券顶，地面以水平参照面示意。',
    rooms:[{width:1.72,depth:1.54,height:1.63,roof:'pyramid'},{width:.88,depth:1.13,height:1.10,roof:'vault'}]
  },
  'maijishan-219': {
    title:'崖下只剩多高的窟底', source:register+'#page=5', sourceName:'魏文斌 · 麦积山石窟历次编号及新编窟龛的说明',
    note:'清理时的遗存宽1.36米、深1.30米，残高仅0.23米。三面低壁表示残存范围；壁面起伏、原窟高度和造像形貌均未复原。',
    rooms:[{width:1.36,depth:1.30,height:.23,roof:'remnant'}]
  }
};
export const studyPoster = id => 'assets/space-studies/'+id+'.webp';
export const studyViewer = id => './real-viewer/space-study.html?id='+encodeURIComponent(id);
