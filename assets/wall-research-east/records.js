// Each work below retains its own accession or excavation identity in the catalogue.
const base = 'assets/wall-research-east/';
const paris = 'Paris Musées / Musée Cernuschi';
const cc0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const cernuschi = (filename, inventory, caption, page) => ({
  src: base + filename, kind: 'document', originalFrame: true, contextOnly: true, relation: 'related',
  contextReason: '取自宾阳中洞同一幅原雕的另一纸拓本，藏于巴黎。', caption,
  credit: paris + ' · ' + inventory, license: 'CC0 1.0', licenseUrl: cc0, source: page,
});

export const evidence = {
  'longmen-cleveland-rubbing': [
    cernuschi('binyang-emperor-cernuschi.webp', 'M.C. 5262',
      '同雕异拓 · 帝王行列。从仪仗上方扇羽的轮廓往下看，可以沿着扇柄找到执扇人。此纸拓于1900至1911年，藏巴黎；克利夫兰所藏为另一纸。',
      'https://www.parismuseescollections.paris.fr/fr/musee-cernuschi/oeuvres/estampage-272'),
    cernuschi('binyang-empress-cernuschi.webp', 'M.C. 5261',
      '同雕异拓 · 文昭皇太后行列。随从的长袖与衣裙在队列下缘连成一片。此纸同样拓于1900至1911年，藏巴黎；克利夫兰所藏为另一纸。',
      'https://www.parismuseescollections.paris.fr/fr/musee-cernuschi/oeuvres/estampage-271'),
  ],
  'longmen-2050': [{
    src: base + 'yakushiji-bussokuseki.webp', kind: 'historical', originalFrame: true, contextOnly: true, relation: 'related',
    contextReason: '故宫院刊作者列为对照的另一方八世纪佛足石，今存日本奈良。',
    caption: '纹样对照 · 日本奈良药师寺佛足石，753年。沿两脚的趾尖向下看，可以辨出足心的轮纹。龙门的佛足刻在一方四面有像的石碑上，曾被砌入擂鼓台南洞外墙。原碑西面见故宫院刊图一。',
    credit: 'Association of Cultural Properties，1955年刊', license: 'Public Domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/', source: 'https://commons.wikimedia.org/wiki/File:Buddha_footprint_Stone_Yakushiji.jpg',
  }],
  'longmen-freer-1911421': [{
    src: base + 'wanfo-miniature-buddhas.webp', kind: 'site', originalFrame: true, contextOnly: true, relation: 'related',
    contextReason: '同遗址、同一时期的小坐佛题材；馆藏残片的具体来窟未定。',
    caption: '题材对照 · 龙门万佛洞原壁。指尖沿着一道横棱移过去，会看见坐佛一尊接一尊，再排成下一行。弗利尔藏石灰岩残片也刻有重复的小坐佛，原窟号尚未确定。',
    credit: 'Gary Todd', license: 'CC0 1.0', licenseUrl: cc0,
    source: 'https://commons.wikimedia.org/wiki/File:Ancient_Buddhist_Grottoes_at_Longmen-_Grotto_of_Buddhas_-_5.jpg',
  }],
  'yungang-west-summit': [{
    src: base + 'west-summit-pigment-grinder.webp', kind: 'object', originalFrame: true, contextOnly: true,
    contextReason: '云冈西区窟顶寺院的出土原物，照片所见为研磨器，塔基和平面另见考古图版。',
    caption: '本址出土 · 云冈窟顶西区北魏寺院石研磨器 T519④:50。中央小凹坑宽约5厘米，坑中仍留有红色粉末。拉曼光谱分析鉴定出赤铁矿。照片右下角的红色标尺长2厘米。',
    credit: 'Xiao Fan、Jianfeng Cui、Shuyu Wang、Lizhong Tai、Jing Guo、Hongbin Yan、Anna Candida Felici、Lucilla Pronti',
    license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    source: 'https://www.mdpi.com/2075-163X/14/3/221#table_body_display_minerals-14-00221-t001',
  }],
  'yungang-shanghai-celestial': [{
    src: 'assets/collection/east/yg17.webp', kind: 'site', originalFrame: true, contextOnly: true,
    contextReason: '上海博物馆记录残首出自第17窟。此图展示原窟主尊，残首肖像另见上博馆藏页。',
    caption: '出土地对照 · 仰看云冈第17窟的交脚菩萨主尊。上海博物馆收藏的天人残首高24.3厘米，同出此窟；馆方记录了它在1948年从日本归国的经过。',
    credit: 'Patrick20242023', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:%E4%BA%91%E5%86%88%E7%9F%B3%E7%AA%9F%E7%AC%AC17%E7%AA%9F%E4%BB%B0%E8%A7%86%E8%A7%86%E8%A7%92.jpg',
  }],
};

export const views = {
  'longmen-cleveland-rubbing': [
    { label: '克利夫兰美术馆 · 帝王行列拓本 1916.64', url: 'https://www.clevelandart.org/art/1916.64' },
    { label: '克利夫兰美术馆 · 皇后行列拓本 1916.65', url: 'https://www.clevelandart.org/art/1916.65' },
    { label: '芝加哥大学 · 比对流散前后的帝后浮雕与不同拓本', url: 'https://caea.lib.uchicago.edu/dcadp/en/longmenbcc/viewers/' },
  ],
  'longmen-2050': [
    { label: '故宫院刊图一 · 佛足迹碑西面原照', url: 'https://img.dpm.org.cn/Uploads/file/2025/06/19/1750318623RzECWSBKq260.pdf#page=2' },
    { label: '故宫院刊图二 · 同一面拓片', url: 'https://img.dpm.org.cn/Uploads/file/2025/06/19/1750318623RzECWSBKq260.pdf#page=3' },
    { label: '奈良药师寺 · 馆藏国宝佛足石', url: 'https://www.yakushiji.or.jp/tw/temples/010.html' },
  ],
  'longmen-freer-1911421': [
    { label: '弗利尔美术馆 · F1911.421 原件照片', url: 'https://asia-archive.si.edu/object/F1911.421/' },
  ],
  'yungang-shanghai-celestial': [
    { label: '上海博物馆 · 石天人头部残件原件照片', url: 'https://www.shanghaimuseum.cn/mu/frontend/pg/article/id/CI00159686' },
  ],
  'yungang-38': [
    { label: '第38窟原拓 · 东壁下层供养人及音乐树（第18页中段 B）', url: 'https://repository.kulib.kyoto-u.ac.jp/server/api/core/bitstreams/b5b5c1ff-6890-46a9-91aa-7000cfd55d05/content#page=18' },
    { label: '京都大学调查原图 · 第38窟外壁、吴氏铭、涅槃与窟顶（图76至81，PDF约70 MiB）', url: 'https://repository.kulib.kyoto-u.ac.jp/server/api/core/bitstreams/1cb7e4f9-419c-4c3c-862f-1a39471d33f6/content' },
    { label: '京都大学 · 核对第38窟图版编号及部位（目录第10页）', url: 'https://repository.kulib.kyoto-u.ac.jp/server/api/core/bitstreams/732038ec-8bc1-48ca-a916-3256f33563d7/content#page=10' },
  ],
  'yungang-west-summit': [
    { label: '发掘报告图版壹 · 窟顶西区北魏寺院遗址', url: 'https://ygx.sxu.edu.cn/static/xzts/4/%E4%BA%91%E5%86%88%E7%9F%B3%E7%AA%9F%E7%AA%9F%E9%A1%B6%E8%A5%BF%E5%8C%BA%E5%8C%97%E9%AD%8F%E4%BD%9B%E6%95%99%E5%AF%BA%E9%99%A2%E9%81%97%E5%9D%80_%E5%BC%A0%E5%BA%86%E6%8D%B7.pdf#page=32' },
    { label: '研究原文 · 研磨器编号、比例与颜料分析', url: 'https://doi.org/10.3390/min14030221' },
  ],
};
