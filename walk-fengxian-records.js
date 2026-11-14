// In this west-facing approach the north wall is on the visitor's right.
// Surveyed sculpture heights and the visitor route are documented separately.
const survey='https://ir.pku.edu.cn/handle/20.500.11897/581545?mode=full';
const field='https://shilun.xafa.edu.cn/info/1036/7408.htm';
const inscription='https://www.dpm.org.cn/Uploads/File/2023/03/21/u6419115098b3d.pdf';
const henan='https://ytsc.rootinhenan.gov.cn/sitesources/ytsc/page_pc/hnly/fjms/articlec716b8d99f6b4aa3ad4309161ed024db.html';
const cornice='https://ygx.sxu.edu.cn/db/期刊/20230419/24618_龙门石窟大卢舍那像龛窟檐建筑复原设计研究.pdf';
const northPhoto='https://commons.wikimedia.org/wiki/File:Luoyang_2006_7-27.jpg';
const detail=(id,title,text,anchor,stand,source)=>({id,title,text,anchor,stand,source:new URL(source).href});
const details=[
  detail('approach','从崖前认出三面像龛','奉先寺大像龛坐西向东。站在阶下，先看中央端坐的卢舍那佛，再看两翼伸到前方的石壁。大佛、弟子、菩萨和护法分布在三个方向，龛口这一面向着伊河敞开。',[0,12.728,-35.344],[0,-1.05],survey),
  detail('cornice','抬头看崖檐，再找梁孔','西壁原址照片里，大像上方还有伸出的岩檐。考古记录中的梁孔，表明窟前曾有木构与山体相接。把岩檐和孔槽对应起来，可以理解今天露天的龛壁过去怎样受到窟前建筑遮护。',[-5.901,17.944,-38.12],[-.35,-8.9],cornice),
  detail('assembly','登上露台，五尊像排开','从正面照片看，中央一佛、两弟子、两菩萨共五身。原址岩壁在外侧向前折转，天王、力士另立在两翼。朝正面和侧面分别观看，才能把三面岩壁上的九身大像合成一组。',[0,11.449,-35.379],[-.15,-16],survey),
  detail('vairocana','近看卢舍那佛低垂的眼睑','卢舍那佛通高17.14米，单是头部就高约4米。走近看，眉弓和鼻梁突在岩壁之前，眼睑稍稍低垂。由近处抬头，先看到脸，再顺着耳垂落到肩头，和阶下望见的整身轮廓很不一样。',[0,16.927,-34.453],[-.7,-22.2],henan),
  detail('pedestal','在莲座前看承托的层次','在佛身下方，伸出的莲瓣接着收窄的座腰，底部再向外展开。造像坐在八角束腰叠涩式莲座上。佛座两侧还保存有造像题记；开元十年的重刻本，留下了大卢舍那像龛营造和施资的记载。',[-1.18,4.394,-35.51],[-2.3,-29.5],inscription),
  detail('attendants','弟子与菩萨之间','在西壁照片上，从中间的卢舍那向外看，先遇到身着僧衣的弟子，再遇到戴冠的菩萨。弟子的僧衣垂成大片衣褶，菩萨胸前的璎珞却是一串串细小装饰。衣着的差异让两位立像即使相邻也容易区分。',[8.086,12.6,-37.084],[4.9,-28.7],field),
  detail('guardians','北壁的天王与力士','转向北壁，持塔的天王与袒露上身的力士比邻而立。看天王承托宝塔的手，再沿甲胄与衣带看到脚下受制的夜叉。转身后的这组相对位置，站在崖前正中很难一次看清。',[17.147,11.338,-33.554],[9.55,-24.3],northPhoto)
];
const stages=[
  ['崖前','从山崖和群像的整幅轮廓起步。'],
  ['登阶看檐','在阶间看岩檐与一排排木构梁孔。'],
  ['上台见五尊','从正壁中央看到左右两端。'],
  ['走近面容','抬眼看眉弓和低垂的眼睑。'],
  ['看莲座','沿台基向上看承托大佛的莲座。'],
  ['横看胁侍','由僧衣移向冠饰，再回望主佛。'],
  ['转向北壁','在北壁辨认天王手里的宝塔。']
];
export const records={'longmen-1280':{
  width:36,depth:39,height:28.6,mouthWidth:35.5,kind:'伊水西崖 · 三面露天摩崖群像',
  orientation:'在导览路线从东面登阶，依次停在西壁卢舍那、弟子、菩萨的照片前，右侧是北壁天王与力士的图版。',
  note:'原址大卢舍那像龛坐西向东，卢舍那通高17.14米。展馆的登阶路线将西壁与两侧不同方向的原址摄影相连；台阶和步行距离按展览需要安排。',
  sources:[{label:'北京大学 · 大卢舍那像龛补凿与加建研究',url:survey},{label:'西安美术学院 · 正壁与群像实地考察',url:field},{label:'故宫博物院院刊 · 佛座两侧像龛记',url:inscription},{label:'河南省 · 奉先寺与主尊尺寸',url:henan},{label:'窟檐建筑研究 · 梁孔与平面',url:new URL(cornice).href}],
  ground:[[0,0],[3,0],[7.8,1.44],[10.3,1.44],[15.1,2.88],[39,2.88]],
  obstacles:[{x0:-18,x1:-6.17,z0:-15.45,z1:-2.7},{x0:6.17,x1:18,z0:-15.45,z1:-2.7},{x0:-18,x1:18,z0:-39,z1:-32.3},{x0:-18,x1:-14.5,z0:-32.3,z1:-18.2},{x0:14.3,x1:18,z0:-32.3,z1:-17.5}],
  details,
  stroll:{name:'由崖前走近卢舍那',intro:'沿露天石阶上行，走到莲座前，再沿北壁回望大佛。',path:details.map(d=>d.stand)},
  experience:{title:'由崖前走近卢舍那',medium:'露天登阶与崖前群像',cover:'assets/walk/fengxian/approach.webp',intro:'从东面的两段石阶走向西壁全景，在原址摄影中辨认大佛的眼睑与莲座，再转向北壁护法。',credits:'./assets/walk/fengxian/SOURCES.md',sourceNote:'展馆将原址龛壁摄影沿登阶路线布置，原像尺寸见造像调查。',
    stages:stages.map(([label,instruction],i)=>({label,instruction,detail:details[i].id}))}
}};
