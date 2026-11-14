const surveySource = 'https://doi.org/10.21203/rs.3.rs-40594/v1';
const surveyCredit = 'Chenglei Meng、Shiqiang Fang、Qian Ma、Wenjing Hu、Xiaobin Liu、Ye Zheng、Guangqiang Dong、Yongqiang Yue、Bingjian Zhang，2020年';

function surface(file, figure, caption) {
  return {src:'assets/wall-research-maiji/'+file+'.webp', kind:'site', caption,
    credit:surveyCredit+'，图'+figure, source:surveySource, license:'CC BY 4.0',
    licenseUrl:'https://creativecommons.org/licenses/by/4.0/', originalFrame:false, contextOnly:true};
}
export const evidence = {
  'maijishan-44': [surface('44-wall-surface','5','第44窟壁面近照。研究者从左到右圈出裂纹、空鼓和变色。正壁主佛的面部可在外部原址照片中观看。')],
  'maijishan-59': [surface('59-flaking','6右','第59窟受潮后的壁面。方框圈出表层剥落处。这幅近照未摄到清晰的墨书字迹；马千的修复前后对照照片另见下方。')],
  'maijishan-123': [surface('123-surfaces','7A、B','第123窟修复壁面。A处白色霉斑沿不平的表层生长，B处可见颜色较深的痕迹。童男、童女的原址近照收在数字敦煌。')],
  'maijishan-135': [surface('135-painted-wall','7C、D','第135窟壁面与紧邻的两身立像。左图从上向下标出旧壁画、修复层与岩体；右图方框标的是两像之间尚存的画面和地仗。')],
  'maijishan-133-stele-one': [{
    src: 'assets/authentic/chambers/maiji-133-stele.webp',
    kind: 'site',
    caption: '同窟另一通碑作对照。第133窟十号碑的正面用分格叙述佛传故事。一号碑以四面千佛得名，可从下方研究所图版查看。',
    credit: 'Zejie Lin、Zhijun Li、Meizi Xie，《Religions》15(3)，图1',
    source: 'https://doi.org/10.3390/rel15030254',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    originalFrame: false,
    contextOnly: true
  }]
};

const artVolume = 'https://www.sohu.com/a/501588569_466973';
const fieldNotes = 'https://zgysyyw.shcmusic.edu.cn/2018/1229/c2939a6331/page.htm';
const newsPhotos = 'https://www.xinhuanet.com/politics/20241028/4044d0039eb9470785943b48542439ed/c.html';
const historicalVolume = 'https://www.sohu.com/a/464950773_501362';
const digitalCatalog = 'https://ip.e-dunhuang.com/photography.html';
const library = 'https://ygx.sxu.edu.cn/db/期刊/';
const princeCaves = library + 'dhyj/dhyj2003/0306pdf/030608.pdf#page=3';
const newCaves = library + 'dhyj/dhyj2008/0805pdf/080506.pdf';

function atCaption(label, page, caption) {
  return {label, url: page + '#:~:text=' + encodeURIComponent(caption)};
}

function artPlate(caption) {
  return atCaption('《中国美术全集》图版 · ' + caption, artVolume, caption);
}

export const views = {
  'maijishan-1': [artPlate('第1窟涅槃像')],
  'maijishan-11': [{label:'夏朗云原址调查 · 图14菩萨、图15主尊',url:library+'20260417/936麦积山石窟东崖大型洞窟的关系——以千佛廊为纽带的北周和隋代皇家石窟营造.pdf#page=17'}],
  'maijishan-14': [atCaption('名取洋之助1956年摄影 · 左壁力士',historicalVolume,'14号窟 力士')],
  'maijishan-26': [atCaption('研究所供图 · 西壁佛座下的乐伎',fieldNotes,'第26窟西壁佛座下方正向面浮塑菩萨乐伎'),atCaption('研究所供图 · 东壁佛座下的乐伎',fieldNotes,'第26窟东壁佛座下方正向面浮塑菩萨乐伎')],
  'maijishan-27': [atCaption('上海音乐学院考察记录 · 北披《法华经变》图版',fieldNotes,'第27窟窟顶北披《法华经变》')],
  'maijishan-42': [atCaption('名取洋之助1956年摄影 · 第42窟坐佛',historicalVolume,'42号窟 坐佛')],
  'maijishan-43': [artPlate('第43窟前廊左侧力士'),artPlate('第43窟右侧胁侍菩萨')],
  'maijishan-44': [atCaption('国家民委道中华 · 第44窟西魏坐佛','https://www.neac.gov.cn/seac/c103391/202302/1160985.shtml','44窟坐佛，西魏时期')],
  'maijishan-59': [atCaption('马千 · 墨书修复前后照片，图08-1、08-2','https://www.sohu.com/a/116566741_501362','第59窟宋人墨书题记修复前')],
  'maijishan-60': [artPlate('第60号龛左壁胁侍菩萨'),artPlate('第60号龛右壁胁侍菩萨')],
  'maijishan-74': [atCaption('中国大运河博物馆 · 第74窟菩萨头像（同窟参考）','https://www.grandcanalmuseum.cn/yunbozixun/889.html','该头像出自第74窟')],
  'maijishan-90': [artPlate('第90窟正壁左侧弟子迦叶')],
  'maijishan-102': [artPlate('第102窟左壁维摩居士'),artPlate('第102窟右壁文殊菩萨')],
  'maijishan-105': [artPlate('第105窟右壁左侧胁侍菩萨'),artPlate('第105窟左壁左侧弟子阿难')],
  'maijishan-115': [atCaption('《中国美术全集》 · 正壁主佛（题记所在佛座的同窟参考）',artVolume,'第115窟正壁阿弥陀佛')],
  'maijishan-121': [atCaption('数字敦煌 · 右侧低语组像局部',digitalCatalog,'麦积山石窟-第121窟-右侧窃窃私语局部'),atCaption('研究所与新华社 · 菩萨和弟子原址照',newsPhotos,'图为麦积山石窟第121窟前壁的菩萨与弟子造像')],
  'maijishan-123': [atCaption('数字敦煌 · 右壁童女',digitalCatalog,'麦积山石窟-第123窟-右壁右侧童女'),atCaption('数字敦煌 · 左壁童男',digitalCatalog,'麦积山石窟-第123窟-左壁左侧童男')],
  'maijishan-133-novice': [atCaption('研究所与新华社 · 小沙弥立像',newsPhotos,'这是麦积山石窟第133窟小沙弥立像')],
  'maijishan-133-rahula': [artPlate('第133窟前室释迦佛与罗睺罗'),atCaption('中国大运河博物馆 · 第133窟全景','https://www.grandcanalmuseum.cn/yunbozixun/924.html','麦积山第133窟全景')],
  'maijishan-133-stele-one': [{label:'麦积山石窟艺术研究所 · 一号千佛碑图组',url:'https://www.sohu.com/a/462970959_120207621'}],
  'maijishan-135': [artPlate('第135窟石雕立像'),atCaption('上海音乐学院考察记录 · 第135窟测绘图',fieldNotes,'第135窟测绘图')],
  'maijishan-165': [{label:'名取洋之助1956年原址摄影 · 供养人旧照',url:'https://commons.wikimedia.org/wiki/File:Maijishan,_grotto_165_-_1956_-_Natori_Y%C5%8Dnosuke.png'},artPlate('第165窟正壁左侧供养人')],
  'maijishan-197': [{label:'王子洞调查简报 · 图2，第197窟实测平、剖面',url:princeCaves}],
  'maijishan-202': [{label:'王子洞调查简报 · 图3，第202窟前后双室实测图',url:princeCaves}],
  'maijishan-218': [{label:'新增窟龛调查 · 图5，第16窟与第218窟残龛相对位置',url:newCaves+'#page=4'}],
  'maijishan-219': [{label:'新增窟龛调查 · 图6，第219窟遗迹平、立面',url:newCaves+'#page=5'}]
};
