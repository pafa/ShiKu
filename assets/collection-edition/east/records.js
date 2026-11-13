// Original photographs are individually credited in plates.js.
import {plates} from './plates.js';
import {gapSources} from '../../authentic/review-gaps.js';

const longmen = 'https://en.lmsk.cn/Gywm';
const gate = 'https://lib.zafu.edu.cn/info/1148/4235.htm';
const moya = 'https://ygx.sxu.edu.cn/db/期刊/20230419/24637_唐武周时期洛阳龙门石窟中弥勒造像的特征及原因.pdf';
export const newWorks = [
  {
    id:'longmen-rubbing-niujue',siteId:'longmen',homeHall:'northern-wei',number:'古阳洞 · 牛橛造像记',era:'北魏太和十九年原刻 · 后世纸本墨拓',form:'inscription',
    title:'母亲为牛橛造弥勒像',feature:'拓片右上角只剩一小块突出的字口，「太和」二字就在这里。顺着右侧第一列往下读，刻石的年月逐渐显出。',
    look:'从右向左读。找到「太和十九年十一月」，再沿下一行寻找「夫人尉迟」和「亡息牛橛」。',
    story:'北魏太和十九年（495）十一月，尉迟氏为亡子牛橛发愿造弥勒像。这篇题记把造像的缘由写在古阳洞的石面上。拓本把石上阴刻的字口留白，纸面墨色深浅则保留了石面起伏和局部缺损的痕迹。放大后可以同时读到一个具体的家庭和一个具体的年号。',
    reason:'495年原刻是龙门早期有明确纪年的造像题记；展出的纸本为东京国立博物馆藏 TB-665。',motifs:['古阳洞','太和十九年','弥勒发愿','纸本墨拓'],
    source:'https://online.bunka.go.jp/heritages/detail/549440/114255',sourceName:'日本文化厅、东京国立博物馆 · 牛橛造像记'
  },
  {
    id:'yungang-8-east-mahesvara',siteId:'yungang',homeHall:'northern-wei',number:'第8窟 · 窟门东壁',era:'北魏 · 云冈中期',form:'sculpture',
    title:'乘牛的摩醯首罗天',feature:'门侧石面很窄。人物盘坐在牛背上，几只手臂沿躯干两旁向上展开。',
    look:'先找足下牛头和伸出的双角，再顺着肘弯才能分清各只手的位置。',
    story:'穿过第8窟窟门，礼拜者从两身护法之间走过。西壁的鸠摩罗天乘孔雀，东壁的摩醯首罗天乘牛。开窟人将来自印度的天神放在佛窟入口，两种坐骑使位置相对的两身造像各有可辨的身份。',
    reason:'展出第8窟东门侧的独立护法，与原有西侧鸠摩罗天展位配对。',motifs:['摩醯首罗天','骑牛','门道护法'],source:gate,sourceName:'浙江农林大学图书馆 · 云冈石窟艺术展'
  },
  {
    id:'yungang-9-crossed-bodhisattva',siteId:'yungang',homeHall:'northern-wei',number:'第9窟 · 前室东壁',era:'北魏 · 云冈中期',form:'relief',
    title:'东壁龛里的交脚菩萨',feature:'菩萨坐在龛中，双膝向两边分开，小腿在脚踝处交叠。龛楣和两侧的层层小像把视线引向中央。',
    look:'从两只相交的脚向上看，辨认覆在膝头的衣缘、上身的饰带和头上的冠。',
    story:'第9、10窟的前室保留着成组的佛龛。第9窟东壁这一尊通常释作弥勒菩萨，脚踝交叉的坐姿清楚可见。龛外立像面向龛心，中央人物的安坐与两侧人物的站立形成了一场有方向的礼拜。',
    reason:'单独展示前室东壁交脚菩萨龛，与本馆第9窟殿门的仿木构雕刻对应。',motifs:['交脚菩萨','前室东壁','弥勒'],source:'https://smarthistory.org/yungang-grottoes/',sourceName:'赵金超 · 云冈洞窟的图像与空间'
  },
  {
    id:'longmen-435-attendant',siteId:'longmen',homeHall:'wu-zhou',number:'第435龛 · 摩崖三佛胁侍',era:'唐 · 武周前后',form:'sculpture',
    title:'粗石中显出的胁侍菩萨',feature:'立像的冠顶、脸和下垂的手已可辨认，前胸和足边还留有体积很大的粗面。',
    look:'先辨出一只手，再向下跟到两足之间。轮廓由清楚变得含混的地方，仍可看出崖石的形状。',
    story:'摩崖三佛龛把多尊像直接雕在临河崖壁上。远看，三尊主佛的轮廓最醒目。移到这身胁侍跟前，同一批造像在雕刻进度上的差别变得具体：头冠和持手已经显形，衣裙却还留有整片未收细的石面。',
    reason:'以胁侍本身作为观察对象，补充第435龛原站主佛的正面照。',motifs:['胁侍菩萨','未竟雕刻','摩崖三佛'],source:moya,sourceName:'康丹丹等 · 唐武周时期洛阳龙门石窟中弥勒造像的特征及原因'
  },
  {
    id:'longmen-1280-ananda',siteId:'longmen',homeHall:'tang',number:'第1280龛 · 阿难像',era:'唐 · 高宗时期',form:'sculpture',
    title:'站在大佛身边的阿难',feature:'圆润的头部前方没有宝冠。耳郭、眼睑和微微闭拢的唇线在近照中都可看清。',
    look:'先看全身像中胸前垂落的僧衣，再放大第二张照片，比较眉脊明暗和两边嘴角的起伏。',
    story:'奉先寺大像龛除了卢舍那佛，还雕有弟子、菩萨、天王和力士。阿难的年轻面貌与迦叶的老者形象相对。近看这尊弟子像，最能说明身份的线索集中在剃发的头部和朴素的僧衣上。',
    reason:'单独展出阿难立像和面部实拍，补全奉先寺群像中弟子的细看位置。',motifs:['阿难','弟子','僧衣'],source:longmen,sourceName:'龙门石窟 · 奉先寺造像'
  },
  {
    id:'longmen-1280-yaksha',siteId:'longmen',homeHall:'tang',number:'第1280龛 · 天王座下',era:'唐 · 高宗时期',form:'sculpture',
    title:'天王足下的夜叉',feature:'夜叉伏在地面，头却向前抬起，背上压着一只巨大的靴子。两者的大小放到同一张图中才容易辨认。',
    look:'先看夜叉支地的手臂，再在第二张照片中顺着那只靴子向上，找到站立的天王。',
    story:'来到奉先寺北壁，目光容易先落在护法高大的身形上。从脚边看过去，雕刻家又安排了一个很低的观看位置。夜叉屈肢，天王踏立；一伏一直的身体，让守护佛龛的力量落实在两尊石像接触的一点。',
    reason:'单独呈现北壁天王足下被踩的夜叉，图组同时保留与上方天王的关系。',motifs:['夜叉','天王','北壁'],source:longmen,sourceName:'龙门石窟 · 奉先寺造像'
  }
];

export const images = {
  'longmen-rubbing-niujue':[plates.niu],
  'yungang-8-east-mahesvara':[plates.deva],
  'yungang-9-crossed-bodhisattva':[plates.crossed],
  'longmen-435-attendant':[plates.attendant],
  'longmen-1280-ananda':[plates.ananda,plates['ananda-face']],
  'longmen-1280-yaksha':[plates.yaksa,plates['guard-pair']],
  'longmen-435':[plates.unfinished],
  'longmen-2194':[plates.arhats,plates['arhats-2']],
  'longmen-fengxian-timber':[plates.holes]
};

// Attributed links open the repository's image viewer or exact published plate.
export const officialViews = {
  'longmen-2050':gapSources['longmen-2050'],
  'longmen-freer-1911421':gapSources['longmen-freer-1911421'],
  'longmen-cleveland-rubbing':gapSources['longmen-cleveland-rubbing'],
  'yungang-shanghai-celestial':gapSources['yungang-shanghai-celestial'],
  'yungang-west-summit':gapSources['yungang-west-summit']
};
