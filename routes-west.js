// 构件用于展陈解读，不代表现场测绘。照片热点以完整原图的宽、高为单位。
const digital = (number, site = '0001') =>
  'https://www.e-dunhuang.com/cave/10.0001/0001.' + site + '.' + String(number).padStart(4, '0');
const academy = (page) => 'https://www.dha.ac.cn/info/1425/' + page + '.htm';
const maijiResearch = 'https://www.mjssk.cn/ht/desc?id=482';
const northDynasties = 'https://www.neac.gov.cn/seac/c103391/202302/1160985.shtml';

const mogao = [
  {
    number: 332, title: '文殊问疾', era: '武周', form: 'mural',
    motifs: ['人字披顶', '中心塔柱', '北壁经变'],
    feature: '北壁后部的维摩诘经变，占据高约三米七、宽约六米一的画面。',
    story: '维摩诘居士称病，文殊菩萨前往探问。画家让两位辩者隔着听众对话。居士坐在帷帐里，身体前探，扬起手中的麈尾；周围人物的朝向把视线带回这场论辩。西壁龛中另有卧佛，与南壁的涅槃故事相互呼应。',
    look: '打开第332窟的窟志，将文殊、维摩诘与前来听法的人分别定位，再追踪他们相对的视线。',
    source: 'https://www.dha.ac.cn/info/1425/3575.htm', sourceName: '敦煌研究院 · 第332窟',
    imageNote: '壁画局部图像。图源未记载拍摄或复制方式。',
    marks: [[.70,.60,'经变中的听众','文殊与维摩诘的问答周围聚集着听众，群像的朝向让论辩也有了可见的场面。']]
  },
  {
    number: 96, title: '九层楼里的北大像', era: '武周 · 695年初建', form: 'sculpture',
    motifs: ['倚坐弥勒', '崖壁石胎', '九层窟檐'],
    feature: '弥勒倚坐像沿崖而起，通高35.5米，窟前由高大的木构楼阁遮护。',
    story: '古人称这尊弥勒为“北大像”。信众相信弥勒将来会降世成佛。造像的双腿向下垂落，参拜者从足下仰视；如此高大的体量也决定了窟前建筑的高度。今天从远处可见的九层楼，把一处崖壁造像的所在标了出来。',
    look: '顺着袈裟的横向衣纹朝上看，佛身、脸部和窟顶木构之间的距离在仰视中十分鲜明。',
    source: academy(3648), sourceName: '敦煌研究院 · 第96窟',
    imageNote:'仰视北大像现状。佛像与窟前楼阁历经重修，近代重新妆彩。',
    marks: [[.53,.52,'仰视北大像','摄影者从佛像下方仰拍。前景被拉长的衣纹和上方的木构，能帮助辨认拍摄位置。']]
  },
  {
    number: 254, title: '一杆秤与一只鸽子', era: '北魏', form: 'pillar',
    motifs:['中心塔柱','北壁尸毗王本生','南壁萨埵本生'],
    feature:'塔柱两侧的故事画分别讲述尸毗王护鸽与萨埵舍身。',
    story:'鹰追逐一只鸽子。尸毗王愿意割下与鸽子等重的肉，保全鸽子的性命，然而秤盘始终不能平衡，最后他自己走上秤盘。北壁画家把国王置于中央，割肉、称量和众人惊动的几幕环列在他周围，把一连串选择压进同一幅画。',
    look:'打开数字敦煌本窟图版，先认出坐着的王，再比较周围人物的身量。哪些人物被故意画得更大？',
    source:digital(254),sourceName:'数字敦煌 · 第254窟北壁',
    imageNote:'北壁尸毗王本生壁画图像。',
    marks:[[.52,.57,'中央的尸毗王','王在画中居于中央。周围人物把护鸽、割肉、称量和赞叹的时刻连在一起。']]
  },
  {
    number:257,title:'九色鹿的证言',era:'北魏',form:'mural',
    motifs:['西壁横卷','两端起读','中段相遇'],
    feature:'西壁把九色鹿救人、被告密和面见国王的情节布置在横向画幅里。',
    story:'九色鹿从水中救起一个人，叮嘱他不要泄露自己的行踪。王后想要得到鹿，获救者却向王廷告密。国王找到鹿时，鹿讲出了事情的经过。读这幅本生故事要看画面的两端：救人的往事和王廷的行动从两边逐步向中央会合。',
    look:'在官方西壁图上找到河水和王的车马，分别顺着两支叙事线移动，在鹿与国王相遇处停下。',
    source:digital(257),sourceName:'数字敦煌 · 第257窟西壁',
    imageNote:'西壁鹿王本生局部，保留原图画幅。',
    marks:[[.59,.47,'斑点鹿王','浅色的鹿身布有点纹，足下贴近山石与河水。通壁画中的鹿多次出现，标记着同一主角先后行动的时刻。']]
  },
  {
    number:285,title:'窟顶的神灵与山林',era:'西魏',form:'ceiling',
    motifs:['覆斗顶四披','山林禅僧','对称禅室'],
    feature:'四披窟顶的神灵和瑞兽下方环绕山林禅僧，两侧壁面开出小禅室。',
    story:'抬头所见是伏羲、女娲、雷神等不同传统中的形象，沿窟顶向下，画中僧人在山林间禅坐。再向下，主室两侧各开四个小禅室。仰望的神话世界、壁上的修行者和脚边的洞室，在同一空间里依次相接。',
    look:'南壁旧照留下了五百强盗故事的一段，先认骑乘与行进的人物。窟顶的山林与禅僧另见数字敦煌的四披图。',
    source:digital(285),sourceName:'数字敦煌 · 第285窟',
    imageNote:'第285窟题材图像，上传者未注明制作方式。',
    marks:[[.66,.48,'翼形与飘带','深色的翼形和长飘带斜穿画面。此图用于观察线条，具体神灵的身份请参看研究院窟顶说明。']]
  },
  {
    number:302,title:'塔柱上的开皇纪年',era:'隋',form:'inscription',
    studyPlate:'assets/west/study-mogao302.svg',studyPlateAlt:'中心柱的七级倒塔、四面龛和双层方座',studyPlateNote:'依据窟志独立绘制的中心柱构件关系图。',
    motifs:['七级倒塔','双层方座','开皇四年题记'],
    feature:'塔柱上端向外层层展开，下方双层台座的北面保留纪年文字。',
    story:'为什么研究者能把一座洞窟的营造时间定位到公元584年前后？线索藏在中心柱底座北侧：“开皇四年六月十一日”等字仍可辨认。绕柱一周，能依次看到四面的圆券形龛；抬头再看，方形基座托起倒塔，直抵窟顶。',
    look:'在官方图录中先找北向面的底层，再向上辨认龛口和倒塔。题记在台座上，而非龛中佛像旁。',
    source:digital(302),sourceName:'数字敦煌 · 第302窟中心柱',
    mediaPage:'https://guimet-photo-pelliot.fr/notice/notice.php?id=1319',mediaPageName:'吉美国立亚洲艺术博物馆 · 1908年塔柱原照'
  },
  {
    number:401,title:'环壁而行的供养菩萨',era:'隋',form:'shrine',
    motifs:['西壁双层龛','龛顶飞天','环壁供养菩萨'],
    feature:'南、西、北壁各有佛龛，靠近地面的画带由姿态各异的供养菩萨相连。',
    story:'窟顶四披布满千佛，而贴近礼拜者视线的下方，呈现的是一个又一个做出供养姿态的菩萨。行走改变了观看的节奏：远看是一圈连续的画带，靠近时可以分辨每一身的转身、手势与衣带。',
    look:'观察这身菩萨的手腕、伸出的手掌和垂至足边的衣带，再看身体重心偏向哪一边。',
    source:academy(3601),sourceName:'敦煌研究院 · 第401窟',
    imageNote:'第401窟供养菩萨壁画局部。',
    marks:[[.49,.53,'供养的姿态','伸出的手与身侧垂落的衣带形成两种方向。绕窟下缘，画工以不同的姿势变化同一供养主题。']]
  },
  {
    number:217,title:'池上楼阁',era:'初、盛唐之交',form:'architecture',
    motifs:['宝池平台','两层楼阁','十六观'],
    feature:'北壁《观无量寿经变》把经文中的净土画成了可以循路想象的建筑群。',
    story:'这一铺壁画的中部画阿弥陀净土，楼阁、水池与平台相接。东侧展开“十六观”，西侧与下方讲述韦提希夫人一家遭逢变故的故事。观看时既可以沿楼阁的屋檐游目，也可以从两侧读出信众为何祈求见到净土。',
    look:'先核对图版壁向。南壁旧照所见是经变的一部分；北壁的净土楼阁、未生怨故事和十六观可在数字敦煌中对读。',
    source:digital(217),sourceName:'数字敦煌 · 第217窟北壁',
    imageNote:'北壁净土经变中的建筑局部。',
    marks:[[.29,.32,'画里的楼阁','画工用红柱、层叠的屋顶和栏杆组织建筑的前后关系。壁画中的净土获得了唐人熟悉的楼阁形制。']]
  },
  {
    number:61,title:'一面墙上的五台山',era:'五代',form:'hall',
    motifs:['中央双层佛坛','西壁五台山图','下部佛传连屏'],
    feature:'西壁长约13米的山图展开五台山风物，中央佛坛与这面圣地地图相望。',
    story:'曹元忠夫妇营建这座家窟时，将文殊菩萨的道场带到了敦煌。画中的路径串起寺院、山岭与前往朝礼的人。站在窟内的观者可以在一面墙前完成一次想象中的行旅。转向邻壁，还能沿较低处的连屏阅读佛传。',
    look:'进入官方西壁图，从一条山路追到第一座寺院，再往远处看山之间的题榜。',
    source:digital(61),sourceName:'数字敦煌 · 第61窟西壁',
    imageNote:'西壁五台山图局部，图源为1999年出版的图版。',
    marks:[[.48,.50,'山路与寺院','山岭、建筑和榜题交织在同一画幅。沿着山路的线条，很容易从一组院落走到另一组院落。']]
  },
  {
    number:17,title:'经卷堆起的藏经洞',era:'晚唐',form:'hall',
    motifs:['第16窟甬道北壁','洪辩影堂','西壁告身碑'],
    feature:'第16窟甬道旁的一间小室，起初是纪念河西高僧洪辩的影堂。',
    story:'1900年，王圆箓发现了这间封存经卷的洞室。文书、绢画和佛事器物使人们认识到，敦煌保存下来的还有文字与日常生活。1908年的历史照片中，伯希和俯身翻检文书，堆叠的卷轴占据了身边大半空间。',
    look:'先看照片中地面上的文书，再打开今天的洞窟资料，比较经卷移出以后显露的北壁和低坛。',
    source:digital(17),sourceName:'数字敦煌 · 第17窟',
    imageNote:'1908年历史照片，Charles Nouette 摄。',
    marks:[[.33,.75,'1908年的文书现场','伯希和在狭小洞室内翻检文书。摄影者夏尔·努埃特记录下这一历史时刻。'],[.27,.48,'壁边堆积的卷轴','堆叠的文书显示了当时的室内占用情况。今日洞窟的陈设需对照研究院记录。']]
  }
];

const maijishan = [
  {
    number:4,title:'散花楼的七间佛阁',era:'北周',form:'architecture',
    motifs:['七间八柱','七帐形龛','薄肉塑飞天'],
    feature:'东崖上部的七开间崖阁，前有廊，后列七座帐形大龛。',
    story:'远处看，散花楼像一座贴着崖壁建起的殿堂。靠近前廊，斗栱、额枋和屋檐让石崖有了木构的节律。廊上方的飞天把两种工艺接在一起：面部和手足微微凸起，衣饰、花朵和流云则画在壁面上。',
    look:'照片记录一龛内的造像。先看一佛与左右人物的层次，再到来源中的外景图，数一数这类龛室沿崖排列的开间。',
    source:northDynasties,sourceName:'国家民委 · 麦积山石窟的历史与艺术',
    imageNote:'上七佛阁龛内现存造像。崖阁开凿于北周，龛中塑像历经重塑、重妆。',
    marks:[[.49,.58,'七龛中的一组造像','后室由七座帐形大龛横向排开。图中这组塑像展示的是一个局部，整座崖阁还包括前廊和檐下构件。']]
  },
  {
    number:5,title:'牛儿堂的三座圆拱龛',era:'隋至初唐',form:'shrine',
    motifs:['三间四柱','马蹄形圆拱','踏牛天王'],
    feature:'平顶崖阁的长方形前廊后，三座马蹄形圆拱龛并列。',
    story:'牛儿堂的名字来自中龛外天王脚下的一头牛犊。居中的佛与胁侍塑像和旁龛造像分属隋唐不同阶段，后来又有重妆。今天近看塑像面部与背光的颜色，眼前的面貌包含了多次营造留下的痕迹。',
    look:'照片给出龛内佛像近景。从脸部外缘向后看，背光以层层彩色轮廓向外展开。',
    source:'https://zgysyyw.shcmusic.edu.cn/ysyyen/2018/1229/c1316a17918/pagem.htm',sourceName:'上海音乐学院 · 麦积山现场调查',
    imageNote:'第5窟佛像近景，踏牛天王在照片范围之外。',
    marks:[[.55,.32,'佛像与彩色背光','头像后方环绕着彩绘背光。可在现场调查资料中对读前廊、三龛以及天王的位置。']]
  },
  {
    number:9,title:'中七佛阁的横向礼拜空间',era:'北周开凿，宋、明、清重修',form:'hall',
    motifs:['中七佛阁','横列佛龛','宋代修缮'],
    feature:'在东崖，宽阔的七佛阁沿水平方向展开。',
    story:'通常所说的中七佛阁就是第9窟。地方志记录其面宽约24米，而进深约4.6米。这样的比例让人沿崖移动时一龛接一龛地观看。地方志还记载宋、明、清的重修。眼前的头像展示了现存塑像的细部。',
    look:'图中保存一身造像的头部和冠饰；把一个头部的尺度与整列佛龛的面宽放在一起想象。',
    source:'https://www.gsdfszw.org.cn/gsxz/tss_270/mjq/202101/P020210129643376043243.pdf',sourceName:'天水市麦积区地方志编纂委员会 · 麦积区志',
    imageNote:'第9窟塑像局部。',
    marks:[[.47,.47,'中七佛阁的一身塑像','侧面光线把眉弓、鼻梁与冠饰的边缘勾出。这幅局部照片取自中七佛阁内。']]
  },
  {
    number:13,title:'沿栈道望东崖大佛',era:'隋，宋代重修',form:'cliff',
    motifs:['摩崖三尊','石胎泥塑','沿崖栈道'],
    feature:'正中的阿弥陀佛高约15.7米，两侧菩萨与主尊同向面向山外。',
    story:'隋代工匠利用崖壁做石胎，再以泥塑刻画面容与衣饰。这是一组要从山前远望、也可沿栈道侧看的摩崖造像。两侧的观音和大势至与阿弥陀佛组成一组。到了宋代，人们又对大像进行了大规模修缮。',
    look:'照片从侧方拍摄。沿岩壁边线向下看左侧的栈道，借此辨认造像与参观者的位置关系。',
    source:northDynasties,sourceName:'国家民委 · 东崖大佛',
    imageNote:'从栈道侧方观看东崖摩崖造像。',
    marks:[[.50,.47,'侧望三尊','近处和远处的造像在侧视中彼此遮挡。换到正面，才容易辨认一佛二菩萨的组合。'],[.20,.78,'贴崖的栈道','栈道与立像处在同一片崖面，扶栏和步道提供了视觉尺度。']]
  },
  {
    number:44,title:'垂目而笑的西魏佛像',era:'西魏',form:'sculpture',
    studyPlate:'assets/west/study-maiji44.svg',studyPlateAlt:'主佛眼睑、唇角与鹅蛋形轮廓的形态研究图',studyPlateNote:'依据研究所图录的描述绘制，局部形态为示意。',
    motifs:['正壁主佛','两侧菩萨','垂目微笑'],
    feature:'正壁的一佛二菩萨中，主佛以细长眉眼和微收的嘴角著称。',
    story:'观察这一尊主佛，最先形成表情的往往不是嘴，而是微微垂下的眼睑。两侧菩萨又衬出主佛稳定的正面姿态。展览中常把这尊佛与乙弗皇后的故事联系起来，这属于对其营造背景的一种解释。',
    look:'在来源的主佛近照中沿眉梢、眼角看到嘴角，再用全组照片比较三身塑像的姿态。',
    source:'https://www.mjssk.cn/ht/desc?id=175',sourceName:'麦积山石窟艺术研究所 · 第44窟展览图录',
    mediaPage:'https://www.mjssk.cn/ht/desc?id=175',mediaPageName:'研究所图录 · 主佛近照与正壁全组'
  },
  {
    number:120,title:'佛龛之间的僧人',era:'北朝，北周重绘窟顶',form:'shrine',
    motifs:['两身坐佛','僧人立像','窟顶重绘'],
    feature:'1956年的现场照片把相邻坐佛和僧像收入同一画面，照明从一侧擦过造像。',
    story:'名取洋之助把镜头架在一尊坐佛的背后。近处的肩背挡住一部分光，龛里的另一尊佛和僧人从阴影中显出。这一选择记录了洞窟里人与像之间的距离，也让窟内不同方向的造像相遇。研究所记录，第120窟窟顶还保留北周重绘的壁画。',
    look:'先找前景中背向镜头的头部，再看明处的佛和僧人，留意光怎样从轮廓移到脸部。',
    source:maijiResearch,sourceName:'麦积山石窟艺术研究所 · 第120窟重绘记录',
    imageNote:'1956年历史照片，名取洋之助摄，1957年刊于《麦積山石窟》。',
    marks:[[.62,.46,'相邻造像','照片中的比丘立在坐佛旁边；前景还有一尊背向镜头的造像。三者的关系在侧光下尤其清楚。']]
  },
  {
    number:121,title:'转角处的低语',era:'北魏晚期',form:'sculpture',
    studyPlate:'assets/west/study-maiji121.svg',studyPlateAlt:'菩萨与弟子相邻、侧首及肩线的组合研究图',studyPlateNote:'依记载绘制两尊塑像的邻接关系；具体表情请参看机构摄影。',
    motifs:['正壁右角','胁侍菩萨','侧首弟子'],
    feature:'正壁右侧的菩萨和弟子相互倾靠，两张脸的距离构成观看中心。',
    story:'这对塑像常被称作“窃窃私语”。工匠只稍稍改变两人头与肩的方向，就让观者在静止的泥塑中读出交流。一尊造像的视线落向另一尊，也把观看者从正壁中央引向容易错过的角落。',
    look:'先看肩膀之间的间隔，再看两人侧头的角度。一组像的关系可以通过这两处细节读出。',
    source:'https://art.people.com.cn/n1/2019/0805/c226026-31276345.html',sourceName:'人民网 · 麦积山第121窟造像',
    mediaPage:'https://ip.e-dunhuang.com/item.html?id=11312',mediaPageName:'敦煌研究院摄影库 · 窃窃私语局部（可能需登录）'
  },
  {
    number:165,title:'供养人的侧脸',era:'北朝开凿，宋代重塑',form:'sculpture',
    motifs:['正壁主像','两侧女供养人','重塑衣冠'],
    feature:'第165窟经宋代重修，正壁主像两侧各有一身女供养人。',
    story:'这身供养人的发髻束在头顶，脸微微偏转。1956年的黑白照片利用斜光留下鼻梁、眼睑和手部的高低变化。早期洞窟在宋代重新塑造了像群，衣冠和神情也把当时人的面貌带进窟中。今天，研究人员已为整窟泥塑和壁画建立三维记录。',
    look:'先看眉眼和嘴部之间的阴影，再看颈部转向。与后方粗粝岩面相对照，能看清工匠怎样用泥塑出柔和的曲面。',
    source:'https://www.mjssk.cn/ht/desc?id=324',sourceName:'麦积山石窟艺术研究所 · 第165窟数字化记录',
    imageNote:'1956年历史照片，名取洋之助摄，1957年刊于《麦積山石窟》。',
    marks:[[.45,.46,'女供养人','这是窟中供养人物的局部，侧方光线勾出眼睑与面庞，记录了1956年摄影者所见的造像状态。']]
  },
  {
    number:127,title:'帐顶上的睒子故事',era:'北朝（分期有不同观点）',form:'ceiling',
    motifs:['横长方形窟','三壁三龛','前披连环画'],
    feature:'帐形顶前披以横向连续画面讲述睒子和盲父母的经历。',
    story:'国王出猎，误射了替盲父母取水的睒子。画面依次展现睒子倾诉、国王前去探望父母、父母悲泣和天神相救。约七米二的长幅放在倾斜的窟顶上。视线沿画面移动，同一个人物会在新的情节中再次出现。',
    look:'在官方主室南披图里找到国王出行的队列，再顺着横幅寻找射猎与探望两个场面。',
    source:digital(127,'0004'),sourceName:'数字敦煌 · 麦积山第127窟南披',
    mediaPage:digital(127,'0004'),mediaPageName:'数字敦煌 · 第127窟影像',
    imageNote:'睒子本生全幅图版，麦积山石窟艺术研究所提供，载 Zhang Yang（2024）图1。',
    marks:[[.30,.62,'山林中的故事','树木、岩石与流水隔开长幅里的场景。随着人物在不同位置再现，时序在同一片山林中向前推进。']]
  },
  {
    number:133,title:'万佛洞的石刻故事碑',era:'北朝',form:'inscription',
    motifs:['四壁影塑小佛','第十号碑','浮雕分格'],
    feature:'以影塑小佛得名的万佛洞还保存多块石刻造像碑，第十号碑用分格叙述佛传。',
    story:'在以泥塑闻名的麦积山，这块石碑让人近距离读石雕。碑面按层、按格安排人物，将不同阶段的佛传放在相邻的画面里。一个格子容纳一次事件，多个格子相接，阅读方式便接近连环画。',
    look:'在研究图版里先顺着碑的边框找出层次，再看各格人物的转身与朝向。',
    source:'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/xbms/xbms2017/1704pdf/170419.pdf',sourceName:'《西北美术》 · 第133窟十号造像碑研究',
    mediaPage:'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/xbms/xbms2017/1704pdf/170419.pdf',mediaPageName:'西北美术 · 十号造像碑研究图版',
    imageNote:'十号碑下龛局部，Li Jingjie 摄，载 Qiuhong Li（2025）图4b。',
    marks:[[.49,.29,'龛楣上的莲花化生','下层龛楣的中间刻有从莲花化生的人物，两侧卷草间也嵌入小像。靠近看，一道龛楣上便能容纳一整组形象。']]
  }
];

const images = {
  mj127: {
    image:'assets/west/mj127.jpg',
    credit:{author:'麦积山石窟艺术研究所供图，Zhang Yang，Art and Performance Letters 5(5)，图1',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:'https://doi.org/10.23977/artpl.2024.050502'}
  },
  mj133: {
    image:'assets/west/mj133.jpg',
    credit:{author:'Li Jingjie 摄，Qiuhong Li，Religions 16(10)，图4b',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:'https://doi.org/10.3390/rel16101282'}
  },
  mj120: {
    image:'assets/west/mj120.png',
    credit:{author:'名取洋之助 · 1956',license:'Public domain · 日本历史照片',licenseUrl:'https://commons.wikimedia.org/wiki/Template:PD-Japan-oldphoto',source:'https://commons.wikimedia.org/wiki/File:Maijishan,_grotto_120_-_1956_-_Natori_Y%C5%8Dnosuke.png'}
  },
  mj165: {
    image:'assets/west/mj165.png',
    credit:{author:'名取洋之助 · 1956',license:'Public domain · 日本历史照片',licenseUrl:'https://commons.wikimedia.org/wiki/Template:PD-Japan-oldphoto',source:'https://commons.wikimedia.org/wiki/File:Maijishan,_grotto_165_-_1956_-_Natori_Y%C5%8Dnosuke.png'}
  },
  mg257: {
    image: 'assets/west/mg257.jpg',
    credit: {author:'北魏画工，姓名不详',license:'Public domain',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',source:'https://commons.wikimedia.org/wiki/File:Nine-coloured_deer.jpg'}
  },
  mg61: {
    image: 'assets/west/mg61.jpg',
    credit: {author:'五代画工，姓名不详',license:'Public domain',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',source:'https://commons.wikimedia.org/wiki/File:Mogao_Cave_61,_painting_of_Mount_Wutai_monasteries.jpg'}
  },
  "mg17": {
    "image": "assets/west/mg17.jpg",
    "credit": {
      "author": "Charles Nouette (1869-1910)",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Paul_Pelliot_examining_manuscripts_in_Cave_17_at_Mogao_Caves_in_1908.jpg"
    }
  },
  "mg96": {
    "image": "assets/west/mg96.jpg",
    "credit": {
      "author": "David Tansey",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:Great_Buddha,_Cave_96,_Mogao_Caves.jpg"
    }
  },
  "mg285": {
    "image": "assets/west/mg285.jpg",
    "credit": {
      "author": "Zeno1994",
      "license": "CC0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Mogao_285.jpg"
    }
  },
  "mg254": {
    "image": "assets/west/mg254.jpg",
    "credit": {
      "author": "北魏画工，姓名不详",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Mogao_Cave_254,_Shibi_Jataka,_Northern_Wei_period.jpg"
    }
  },
  "mg217": {
    "image": "assets/west/mg217.jpg",
    "credit": {
      "author": "画工姓名不详",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Mogao_Cave_217.jpg"
    }
  },
  "mg401": {
    "image": "assets/west/mg401.jpg",
    "credit": {
      "author": "隋代画工，姓名不详",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Offering_Bodhisattva_from_Cave_401,_Mogao_Caves,_Dunhuang.jpg"
    }
  },
  "mj5": {
    "image": "assets/west/mj5.jpg",
    "credit": {
      "author": "Shizhao",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Majishan_grotto_005.jpg"
    }
  },
  "mj9": {
    "image": "assets/west/mj9.jpg",
    "credit": {
      "author": "Shizhao",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Majishan_grotto_009.jpg"
    }
  },
  "mj13": {
    "image": "assets/west/mj13.jpg",
    "credit": {
      "author": "颐园居",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Cave13,_East_Cliff_Buddha,_Maijishan_Cave_20260929.jpg"
    }
  },
  "mg332": {
    "image": "assets/photo/mogao-332.png",
    "credit": {
      "author": "LIJIHENG",
      "license": "CC0 1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Cave_332,_Virmalakirti_and_Manjushri.png"
    }
  },
  "mj4": {
    "image": "assets/photo/maijishan-4.jpg",
    "credit": {
      "author": "Shizhao",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Majishan_grotto_004.jpg"
    }
  }
};

function prepareRoute(stops, prefix) {
  return stops.map(({ marks = [], ...scene }) => {
    const media = images[prefix + scene.number];
    return {
      ...scene,
      image: media?.image ?? null,
      credit: media ? {...media.credit, modified: '按屏幕缩放显示'} : null,
      hotspots: marks.map(([x, y, title, body]) => ({
        x, y, title, body, source: scene.source, sourceName: scene.sourceName
      }))
    };
  });
}

export const westRoutes = {
  mogao: prepareRoute(mogao, 'mg'),
  maijishan: prepareRoute(maijishan, 'mj')
};
