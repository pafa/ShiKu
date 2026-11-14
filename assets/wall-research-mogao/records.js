// Printed figure numbers and digital scan pages refer to the editions in SOURCES.md.
const folder = 'assets/wall-research-mogao/';
const pd = 'https://creativecommons.org/publicdomain/mark/1.0/';
const chen = 'https://commons.wikimedia.org/wiki/File:NLC416-08jh010325-9256_西陲壁畫集.pdf';
function chenPhoto(file, plateNumber, caption, contextOnly = false) {
  return {src:folder + file + '.webp', kind:'historical', originalFrame:false, caption,
    credit:'陈万里摄，《西陲壁画集》（1928年）图' + plateNumber + '，中国国家图书馆藏本',
    source:chen, license:'公有领域', licenseUrl:pd, contextOnly};
}

function steinPhoto(file, figure, leaf, caption, contextOnly = false) {
  return {src:folder + file + '.webp', kind:'historical', originalFrame:false, caption,
    credit:'Aurel Stein，1907年敦煌调查，《Serindia》卷二（1921年）图' + figure,
    source:'https://archive.org/details/steinaurelserindiavoliitext_180_O/page/n' + leaf + '/mode/1up',
    license:'公有领域', licenseUrl:pd, contextOnly};
}

export const evidence = {
  'mogao-3': [
    steinPhoto('003-stein-north', 205, 306, '第3窟北壁的十一面千手观音。许多细长的手臂从身后伸出，密密围成光轮；两侧较大的侍者勾出壁画的边界。'),
    steinPhoto('003-stein-south', 204, 297, '同窟南壁局部，圆形的千手轮延伸到画幅边缘，下方飞天的衣带从观音身侧卷过。'),
  ],
  'mogao-45': [
    steinPhoto('045-stein-niche', 212, 319, '第45窟西壁佛龛。坐佛两旁依次分立弟子、菩萨和护法，近前的肩线与后方的画壁叠成数层。这张历史照片摄于1907年的调查。'),
  ],
  'mogao-55': [
    steinPhoto('055-stein-altar', 213, 336, '第55窟主室马蹄形佛坛。正中像前临坛缘，两侧另有相向而坐的佛像；沿三组造像往上看，中央背屏一直连到覆斗顶。'),
  ],
  'mogao-61-deva-questions': [
    steinPhoto('061-stein-questions', 224, 371, '第61窟北壁西起第二铺《天请问经变》。上方庭院与围坐听众围住中央佛座，下方另有一铺较小的说法场面。'),
  ],
  'mogao-61-buddha-screens': [
    steinPhoto('061-stein-wutai', 222, 370, '第61窟西壁《五台山图》局部，城墙、山路与殿宇转折相接。佛传小屏风另在墙脚，本张照片的主体是上部山图。', true),
  ],
  'mogao-146': [
    steinPhoto('146-stein-healing', 235, 433, '第146窟北壁东起第三铺《药师经变》。坛前楼台与佛座沿中轴向上展开，右下角弯斜的裂痕可与原壁近照对认。下部《贤愚经》屏风在这张照片的取景之外。', true),
  ],
  'mogao-285-flower-offering': [
    chenPhoto('285-chen-offerings', 6, '第285窟北壁前段，两位供养菩萨相向持花，面对坐佛的莲座。细看花朵与袖口，两个身影各向中央探出一只手。'),
  ],
  'mogao-285-amitayus': [
    chenPhoto('285-chen-north-halo', 7, '陈万里拍到第285窟西壁北侧佛背光上方的飞天，弯月般的飘带绕过身体。东壁门南的无量寿佛与双龙华盖见另附原图。', true),
  ],
  'mogao-98-tiger-screen': [
    {src:'assets/gallery-mogao/098-donors.webp', kind:'site', originalFrame:false, contextOnly:true,
      caption:'第98窟女供养人局部。可从冠饰与宽袖观察同窟的人物画法；饲虎故事画在南壁的屏风里。', credit:'五代敦煌佚名画师，图版经 Wikimedia Commons',
      source:'https://commons.wikimedia.org/wiki/File:Buddhist_donors_from_Cave_98_at_Mo-kao.jpg', license:'公有领域', licenseUrl:pd},
  ],
};

export const views = {
  'mogao-45': [{label:'西壁龛内菩萨彩照 · 孙志军摄，联合国教科文组织',url:'https://whc.unesco.org/en/documents/209041'}],
  'mogao-55': [{label:'第55窟宋代壁画贴金细部 · 敦煌研究院等原位调查图2',url:'https://www.nature.com/articles/s40494-025-02101-2/figures/2'}],
  'mogao-335': [{label:'南壁三身跪姿供养菩萨残片 · 哈佛艺术博物馆1924.47',url:'https://harvardartmuseums.org/collections/object/210060'}],
};
