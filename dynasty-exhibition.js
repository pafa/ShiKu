import { eastRoutes } from './routes-east.js';
import { westRoutes } from './routes-west.js';
import { designs } from './station-designs.js';
import {additions} from './collection-extension.js';

export const sites = [
  {id:'yungang', name:'云冈石窟', location:'山西 · 大同', source:'https://whc.unesco.org/en/list/1039/'},
  {id:'mogao', name:'莫高窟', location:'甘肃 · 敦煌', source:'https://whc.unesco.org/en/list/440/'},
  {id:'longmen', name:'龙门石窟', location:'河南 · 洛阳', source:'https://whc.unesco.org/en/list/1003/'},
  {id:'maijishan', name:'麦积山石窟', location:'甘肃 · 天水', source:'https://whc.unesco.org/en/list/1442/'}
];

const routes = {...eastRoutes, ...westRoutes};
const originalWorks = sites.flatMap(site => routes[site.id].map(entry => {
  const cave = String(entry.number).match(/\d+/)[0];
  const id = site.id + '-' + cave;
  return {
    ...entry, id, number:'第'+cave+'窟', siteId:site.id, siteName:site.name, design:designs[id]
  };
}));
const siteById = new Map(sites.map(site=>[site.id,site]));
export const works = [...originalWorks,...additions.map(entry=>{
  const site=siteById.get(entry.siteId);
  return {...entry,siteName:site.name,hotspots:entry.hotspots||[],design:designs[entry.id]};
})];
const byId = new Map(works.map(work => [work.id, work]));

// Each work appears once as a principal exhibit. A comparison refers to another
// principal exhibit and carries its own reason for being shown in this room.
const program = [
  {
    id:'northern-wei', name:'北魏馆', period:'386—534年', style:0,
    intro:'从平城的巨像走到洛阳的莲花窟顶，再沿敦煌的长壁读两则本生故事。巨像、塔柱、题记和叙事画构成四种观看尺度。',
    focus:'巨像、塔柱与叙事长壁', source:byId.get('yungang-20').source,
    primary:[
      ['yungang-20','昙曜五窟之一。原来面向窟内的巨像，因南壁坍塌而在今天的天光下显现。'],
      ['yungang-19','昙曜五窟中的三世佛组合分置主窟和两侧耳洞。'],
      ['yungang-18','北魏早期大像的袈裟上有密集的小坐佛。'],
      ['yungang-5','北魏中期第5、6窟成组营造。照片中的第5窟大佛表面经过后世包泥、彩绘。'],
      ['yungang-6','北魏中期中心塔柱窟，佛传叙事随礼拜者的绕行而展开。'],
      ['yungang-8','北魏中期门道雕刻引入多首、多臂的护法形象。'],
      ['yungang-9','北魏中期的殿门将木构建筑的层次转译为石雕。'],
      ['yungang-12','北魏中期的伎乐雕刻保存了乐器和持奏姿势。'],
      ['yungang-13','北魏中期工匠用力士形象承托上方大像的手臂。'],
      ['longmen-140','北魏皇家营建的宾阳中洞，在公元500至523年间开凿。'],
      ['longmen-712','北魏莲花洞以窟顶的倒垂莲花聚集视线。'],
      ['longmen-1443','古阳洞诸龛的北魏造像题记将发愿者与具体佛像联系起来。'],
      ['mogao-254','北魏中心塔柱窟在壁面讲述尸毗王割肉贸鸽等故事。'],
      ['mogao-257','北魏壁画用横向连续场景展开九色鹿王本生。'],
      ['maijishan-121','北魏晚期窟内，两身泥塑在转角处相向。对应图像由馆藏页面提供。']
    ],
    comparisons:[['maijishan-165','用宋代重塑的供养人侧脸，对读本馆第121窟相向人物的身体朝向。']]
  },
  {
    id:'western-wei',name:'西魏馆',period:'535—557年',style:1,
    intro:'从第285窟东壁坐佛的华盖移到北壁两位持花人，再看麦积山第105窟并肩的菩萨与比丘。留意相邻两人如何用一束花、一个转头或挨近的肩膀彼此呼应。',
    focus:'窟顶神灵与垂目佛像',source:byId.get('mogao-285').source,
    primary:[
      ['mogao-285','西魏莫高窟以满绘的窟顶和壁面组织神灵、山林与禅修空间。'],
      ['maijishan-44','西魏彩塑以细微的眼睑与嘴角刻画主佛表情；原图见研究所图录。']
    ],
    comparisons:[
      ['maijishan-4','第4窟崖阁开凿于北周，龛中造像历经重修。以这张现状图对读第44窟，观察人物在龛内怎样排列。'],
      ['yungang-18','回看北魏石雕衣纹与化佛，比较体量、材料怎样影响观看距离。'],
      ['longmen-712','以北魏龙门窟顶的立体莲花，对读西魏莫高窟顶铺展的彩绘空间。']
    ]
  },
  {
    id:'northern-zhou',name:'北周馆',period:'557—581年',style:3,
    intro:'沿上七佛阁的柱列看龛，再低头找第26窟佛座下的乐伎，最后读庾信所记的七佛龛。拓片同时保存了后世重刻的痕迹。',
    focus:'崖阁、柱列与并置佛龛',source:byId.get('maijishan-4').source,
    primary:[
      ['maijishan-4','北周七间八柱的上七佛阁仿照殿堂，檐下飞天结合浅浮塑和彩绘。照片展示一龛内历经重修的现状。'],
      ['maijishan-9','主展取北周开凿的横向崖阁布局。龛内景物历经宋、明、清重修，照片展示其中一身塑像。']
    ],
    comparisons:[
      ['yungang-9','观看北魏石刻殿门的柱与檐，比较殿堂形式怎样转化为石窟正面。'],
      ['mogao-217','壁画中的楼阁、平台与池水，提供唐代画面构筑建筑空间的例子。'],
      ['longmen-140','北魏宾阳中洞把华盖与足下莲池配成一体，可与北周前廊的视线安排对照。']
    ]
  },
  {
    id:'sui',name:'隋馆',period:'581—618年',style:1,
    intro:'从第302窟开皇题记辨认年代，再仰看第295窟西披涅槃图里举起的双手。转到麦积山第14窟，看守在门侧的力士如何扭头回望。',
    focus:'纪年题记、环壁与摩崖',source:byId.get('mogao-302').source,
    primary:[
      ['mogao-302','开皇四年（584）的题记为营造年代提供线索；第302窟后来在五代重修。'],
      ['mogao-401','隋代供养菩萨沿四壁连续铺开，适合沿壁观察。'],
      ['maijishan-13','主展以隋代石胎泥塑的大佛组合为线索，其现存面貌也包含宋代重修。']
    ],
    comparisons:[
      ['yungang-6','与北魏第6窟的四面塔柱比较，观察绕行路线怎样把图像串联起来。'],
      ['longmen-1443','北魏古阳洞的题记提供另一种有文字可读的造像现场。']
    ]
  },
  {
    id:'tang',name:'唐馆',period:'618—907年间 · 武周另展',style:2,
    intro:'从宾阳南洞的续刻进入初唐，到奉先寺前看群像，再转向敦煌净土壁画与晚唐藏经洞。',
    focus:'续刻工程、大像龛与净土',source:byId.get('longmen-1280').source,
    primary:[
      ['longmen-159','宾阳南洞起于北魏皇家营建，本馆所看的是初唐续成的主要造像。'],
      ['longmen-20','潜溪寺为初唐窟，本展围绕阿弥陀与两侧胁侍的组合。'],
      ['longmen-1280','奉先寺大像龛在675年完工，当时仍属唐高宗时期。'],
      ['longmen-543','万佛洞题记指向唐高宗永隆元年（680），可据此读龛内的小佛与莲枝。'],
      ['mogao-217','初、盛唐之交的阿弥陀净土变以楼阁和水池组织画面。'],
      ['mogao-17','洞室最初是晚唐洪辩的影堂。展出的历史照片摄于1908年。']
    ],
    comparisons:[
      ['yungang-20','从北魏露天大佛与奉先寺大像的正面关系，比较观者需要站在哪里。'],
      ['maijishan-5','第5窟的三龛包含隋至初唐不同阶段；用它观察共同空间中的先后工程。']
    ]
  },
  {
    id:'wu-zhou',name:'武周馆',period:'690—705年',style:2,
    intro:'695年开建的敦煌北大像、龙门留下凿痕的弥勒像，以及壁画中的问疾群像，把观者带到武周时期不同的营造现场。',
    focus:'弥勒大像、未竟工程与群像',source:'https://www.dha.ac.cn/info/1425/3648.htm',
    primary:[
      ['mogao-96','敦煌研究院记载北大像初建于695年，属武周。今天的窟前楼阁经历多次改建。'],
      ['mogao-332','武周开凿的第332窟以经变与塑像组织多壁叙事。'],
      ['longmen-435','武周时期的弥勒大像工程留下了未完成的凿刻表面。'],
      ['longmen-2194','学界通常将看经寺系于武则天主政时期。窟内缺少确切的开凿纪年，三壁僧人群像的身份亦有讨论。']
    ],
    comparisons:[
      ['yungang-19','用北魏主窟和耳洞中的大像，比较巨像如何改变观者视野。'],
      ['maijishan-13','麦积山隋代大像以石胎泥塑营建，提供与武周敦煌北大像比较的材料实例。']
    ]
  },
  {
    id:'five-dynasties',name:'五代馆',period:'907—960年 · 敦煌归义军时期',style:1,
    intro:'循五台山图中的山路找到寺院，再看第98窟南壁屏风怎样分格讲饿虎故事。走到印本前，读曹元忠为敦煌来往行人祈愿的文字。',
    focus:'山水图中的礼佛行旅',source:byId.get('mogao-61').source,
    primary:[['mogao-61','五代曹氏归义军时期的家窟，西壁五台山图把曲折的朝礼路径收在一面墙上。']],
    comparisons:[
      ['yungang-6','沿北魏塔柱绕行的身体路线，与五台山图中眼睛行走的路线形成对读。'],
      ['longmen-2194','龙门看经寺的僧人群像沿三壁排列，可比较转身与移动如何改变读图次序。'],
      ['maijishan-9','北周崖阁沿崖连成一排，实地礼拜需要横向移动。']
    ]
  },
  {
    id:'song',name:'宋馆',period:'960—1279年',style:3,
    intro:'宋代修缮与重塑为旧窟留下新的面貌。先看供养人的发髻，再回看早期窟室和后世影像各自记录了什么。',
    focus:'重塑、重修与旧窟的新面貌',source:byId.get('maijishan-165').source,
    primary:[['maijishan-165','第165窟始于北朝，本馆专看宋代重塑的供养人物。展图为1956年历史照片。']],
    comparisons:[
      ['mogao-17','以晚唐影堂的近代历史照片，对照洞窟、文物与拍摄年代三个时间层次。'],
      ['yungang-18','从北魏第18窟弟子群像的动态，对读麦积山宋塑人物的身体姿态。'],
      ['longmen-159','宾阳南洞从北魏始凿到初唐续成，提供跨越多个时期的营造实例。']
    ]
  },
  {
    id:'chronology',name:'断代研读馆',period:'北朝至唐 · 跨期证据',style:0,
    intro:'把开窟、造像、壁画重绘、窟外题刻和近代拍摄放回各自的时间。每件主展都留下需要分别阅读的证据。',
    focus:'北齐风格、重绘与断代分歧',source:'https://www.nlc.cn/pcab/xctg/bd/20190121_175422.shtml',
    primary:[
      ['yungang-3','第3窟北魏开凿，后室三尊另有后世续雕及不同断代意见。'],
      ['longmen-1387','药方洞开凿、正壁造像与洞口药方石刻分属多个问题。主尊具有北齐风格。'],
      ['maijishan-5','主龛与旁龛存在隋至初唐的阶段差异，现存面貌还包含后世重妆。'],
      ['maijishan-120','北朝洞室的窟顶有北周重绘。1956年照片记录的是坐佛与龛间僧像。'],
      ['maijishan-127','第127窟细分年代有不同观点，本展依据图版观察睒子本生的叙事顺序。'],
      ['maijishan-133','窟内保存多块来自北朝的石刻造像碑，本展专看第十号碑下龛图像。']
    ],
    comparisons:[['mogao-302','开皇四年题记提供明确时间线索，可与依据造型和画风推定的断代比较。'],['mogao-96','将695年的初建资料与后来重建的窟前楼阁对读，区分图像和建筑的年代。']]
  }
];

for(const record of additions){
  const hall=program.find(h=>h.id===record.hallId);
  if(!hall)throw Error('无有效展馆：'+record.id);
  hall.primary.push([record.id,record.periodNote]);
}
const homeHall = new Map();
for(const room of program)for(const [id] of room.primary)homeHall.set(id,room.id);
for(const work of works)work.homeHall=homeHall.get(work.id);

export const halls=program.map(({primary,comparisons,...room})=>{
  const scenes = [
    ...primary.map(([id,periodNote])=>({...byId.get(id),crossPeriod:false,comparisonNote:'',periodNote})),
    ...comparisons.map(([id,comparisonNote])=>({...byId.get(id),crossPeriod:true,comparisonNote,periodNote:comparisonNote}))
  ];
  return {...room,scenes};
});
