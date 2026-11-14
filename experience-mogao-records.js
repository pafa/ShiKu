const academy320='https://www.dha.ac.cn/info/1425/3599.htm';
const academy407='https://www.dha.ac.cn/info/1425/3569.htm';
const digital320='https://www.e-dunhuang.com/cave/10.0001/0001.0001.0320';
const plate320='https://drpress.org/ojs/index.php/hiaad/article/view/11157';
const plate407='https://drpress.org/ojs/index.php/hiaad/article/view/30663';
const stein='https://archive.org/details/in.ernet.dli.2015.69620/page/n319/mode/1up';
const asset='assets/experience/mogao/';
const side='原窟面向西壁正龛，入口在东，南壁在左，北壁在右。';
const detail=(id,title,text,anchor,stand,source)=>({id,title,text,anchor,stand,source});
const stage=(label,detail,instruction)=>({label,detail,instruction});

export const records={
  'mogao-407':{
    width:8.8,depth:9.2,height:5.75,mouthWidth:3.55,
    kind:'三兔莲花藻井 · 隋代覆斗顶',orientation:side,
    note:'第407窟为隋代覆斗顶窟。井心里的三兔取自原壁画研究照片，莲花外围的八身飞天、顶披的幔帷和西壁双层龛见敦煌研究院著录。',
    sources:[{label:'敦煌研究院 · 三兔莲花纹藻井与全窟',url:academy407},{label:'Jiarui Han · 井心三兔图版（图2）',url:plate407},{label:'国际敦煌项目 · 三兔图案与敦煌',url:'https://idp.bl.uk/newsletters/summer-2001/'}],
    obstacles:[{x0:-2.73,x1:2.73,z0:-9.2,z1:-8.45}],
    details:[
      detail('hares','三只耳朵怎样属于三只兔子','莲心绿色圆环里，三只兔子向同一方向奔跑。先认头部，再沿伸向中心的长耳寻找邻兔。画家把相邻两兔的一耳画在同一个位置，三只耳朵就能让每只兔子都显得长着一双耳朵。',[0,5.715,-4.60],[.12,-1.89],academy407),
      detail('petals','八瓣之外还有一圈飞天','窟志记三兔在莲心内，层层花瓣的外围另有八身飞天。有的捧花，有的执香炉。先辨兔群首尾相接的旋转，再读外围人物各不相同的动作，便能把莲心局部与完整藻井联系起来。',[.84,5.70,-4.15],[1.65,-2.70],academy407),
      detail('slopes','从方井沿幔脚看向四披','这座隋窟的井心为方形，四披从方井向墙面斜落。窟志记载，垂角幔帷铺在斜面上，旁边画满千佛。幔脚顺着顶面下垂，使整座岩窟具有张挂帐幕的感觉。',[-3.21,4.525,-4.75],[-1.66,-4.12],academy407),
      detail('recess','正壁的龛口还有第二层','西壁开方口双层龛。由外层向内看，龛楣、龛顶和塑像有前后层次。著录中的龛内塑像保留隋代作品，也经历清代重修；南北壁下部的供养人又有宋代绘制的部分。',[2.32,2.11,-9.055],[1.12,-6.08],academy407)
    ],
    experience:{title:'三兔共耳',medium:'窟内纹样辨读',intro:'从三兔原壁画局部辨认共用的耳朵，再读窟志所载的莲花、顶披和双层龛。',cover:asset+'407-interior.webp',sourceNote:'莲心用原壁画局部摄影，莲花外围及顶披的图像见逐窟著录。',stages:[
      stage('寻找三兔','hares','先在原图中找出三只兔子的头。'),
      {...stage('沿耳辨形','hares','在莲心的壁画局部中，沿一只兔头寻找它与两旁邻兔共用的耳朵。'),fov:34},
      stage('循莲望飞天','petals','对照研究院图录中外围飞天的位置，读清它们与中心三兔的关系。'),
      stage('退至斜披','slopes','读窟志中从方井、幔脚到千佛披面的次序。')
    ]}
  },
  'mogao-320':{
    width:10.0,depth:10.2,height:6.30,mouthWidth:3.8,
    kind:'云头牡丹藻井 · 盛唐覆斗顶',orientation:side,
    note:'盛唐开凿，西壁设龛。北壁净土画的黑白旧影与南壁说法图分属两面墙。牡丹井心、两对散花飞天及颜色变化另据研究院介绍。',
    sources:[{label:'敦煌研究院 · 第320窟洞窟与分壁著录',url:academy320},{label:'数字敦煌 · 第320窟全景',url:digital320},{label:'Su、Bai、Deng · 云头牡丹藻井图版（图3）',url:plate320},{label:'斯坦因《Serindia》第二卷 · 第210图',url:stein}],
    obstacles:[{x0:-2.85,x1:2.85,z0:-10.20,z1:-9.45}],
    details:[
      detail('peony','井心的云头牡丹','窟志将井心纹样辨为云头牡丹，花瓣之外排着菱形方胜和团花。方井外沿接上斜向下降的顶披，四披另画千佛。这个从花心向整片窟顶展开的次序，也是辨认藻井各层的方法。',[0,6.265,-5.10],[.12,-2.08],academy320),
      detail('thousand','四个斜面上的千佛','第320窟的井心较平，四披斜向四壁，盛唐画工把千佛画在这些斜面上。佛身反复出现的头光和坐姿形成行列。从图录中对照两面顶披，可发现它们沿着不同的斜向围住同一方井。',[3.47,5.14,-5.29],[1.88,-4.25],academy320),
      detail('black-flight','南壁说法图上方的黑飞天','南壁树下说法图上方有两对散花飞天。前者回头，后者扬臂，翻起的飘带将两人的动作连在一起。「黑飞天」这个称呼与颜料后来的变色有关，今日的深色不能直接当作画工最初选用的颜色。',[-4.90,3.40,-5.39],[-2.62,-5.30],academy320),
      detail('north-panel','百年前的北壁净土图','北壁的净土图以佛、楼阁与宝池组织画面。斯坦因在《Serindia》把此窟记作第四窟，书中第210图拍到这面北壁的中央画幅。体验中可在同一位置查看黑白印本，比较佛座、台阶和两旁分格在旧影中的位置。',[4.905,2.00,-5.10],[2.65,-5.15],stein),
      detail('aureole','从残存的背光读佛龛','研究院记录，西壁龛内存有浮塑背光、一身弟子和两身菩萨。原本居中的主像已缺失，贴壁的背光和两旁侍像却留了下来；它们各自的位置，仍能指出主像曾坐在何处。',[-.04,2.01,-11.03],[.38,-7.14],academy320)
    ],
    experience:{title:'牡丹井心与散花飞天',medium:'覆斗顶仰观',intro:'从窟志里的牡丹藻井和两对飞天读起，再对照北壁净土经变的早期照片。',cover:asset+'320-interior.webp',sourceNote:'北壁收录历史摄影，窟顶与南壁以敦煌研究院分壁图录解读。',stages:[
      stage('仰看井心','peony','依窟志辨认牡丹、方胜和团花的内外层次。'),
      stage('查看四披','thousand','读窟志怎样记录各披上的千佛行列。'),
      stage('转向南壁','black-flight','在研究院南壁资料中寻找两对前后相逐的飞天。'),
      stage('对读北壁旧影','north-panel','来到对面，在刊于1921年的北壁黑白图版上找佛座、宫殿和两旁的分格。')
    ]}
  }
};
