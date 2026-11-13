// Local coordinates follow the gallery convention. The visitor enters from +Z.
const archive='https://ygx.sxu.edu.cn/db/';
const gazette='https://www.gsdfszw.org.cn/gsxz/tss_270/mjq/202101/P020210129643376043243.pdf';
const survey=archive+'%E6%9C%9F%E5%88%8A/dhxjk/dhxj2001/0101pdf/010106.pdf';
const tablets=archive+'%E4%BC%9A%E8%AE%AE/20230410hybuc/120.pdf';
const niche=archive+'%E6%9C%9F%E5%88%8A/mszy/mszy2020/2002pdf/200210.pdf';
const photo='https://doi.org/10.3390/rel15030254';
const detail=(id,title,text,anchor,stand,source)=>({id,title,text,anchor,stand,source});
const obstacle=(x0,x1,z0,z1)=>({x0,x1,z0,z1});

export const records={
  'maijishan-133':{
    width:12.2,depth:10.83,height:5.8,mouthWidth:1.8,kind:'inscription',
    orientation:'原窟南侧开门。前堂东侧为十号碑，西侧为一号碑，北端的岩墙隔出两间后室。',
    note:'原窟前堂有一号千佛碑和十号佛传碑，北边又分出两间后室。碑面图版和1956年人物摄影各自标明取景范围；未进入镜头的侧面、顶面装饰据窟志和专门研究说明。',
    sources:[
      {label:'《麦积区志》下卷 · 第133号窟及一、十、十一、十六号碑',url:gazette},
      {label:'项一峰 · 西崖东中下三区内容总录',url:survey},
      {label:'谢生保、陈玉英 · 石刻造像碑实地调查',url:tablets},
      {label:'张铭 · 第133窟第11龛维摩变考',url:niche},
      {label:'Lin、Li、Xie · 十号碑全幅图版及图像研究',url:photo},
      {label:'名取洋之助 · 1957年岩波书店原摄影集',url:'https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605'}
    ],
    obstacles:[
      obstacle(4.62,6.1,-4.52,-2.35),obstacle(-6.1,-4.67,-4.52,-2.37),
      obstacle(-1.22,1.01,-6.06,-4.50),obstacle(-.47,.47,-10.83,-6.53),
      obstacle(-6.1,-4.94,-10.83,-4.55),obstacle(4.94,6.1,-10.83,-4.60),
      obstacle(-6.1,6.1,-10.83,-9.83)
    ],
    experience:{
      title:'万佛洞的两座造像碑',medium:'石刻造像碑与影塑',cover:'assets/experience/maiji/stele-cover.webp',
      intro:'从十号碑的整幅摄影开始，比较一号碑的千佛排列，再去后室与前堂驻足点对读。',
      credits:'./assets/experience/maiji/SOURCES.md',
      sourceNote:'十号碑用本件图录摄影，前堂、后室的其他造像另有1956年摄影和窟志可对读。',
      stages:[
        {label:'细读十号碑',detail:'stele',fov:49,instruction:'在整碑正面照片中，沿中央三层主像读到两旁的故事画格。'},
        {label:'绕看千佛',detail:'thousand',instruction:'从一号碑图版辨认成列的小坐佛，再查窟志对窄侧的记录。'},
        {label:'近读龛楣',detail:'lintel',fov:50,instruction:'读研究记录中第十一龛的泥塑山石和龛楣画。'},
        {label:'辨认窟顶',detail:'ceiling',fov:65,instruction:'在窟志中辨认前堂平顶右侧的覆斗藻井。'},
        {label:'进入后室',detail:'crossed',instruction:'在左后室旧照中找到交叠的双足与垂下的披帛。'},
        {label:'对看父子',detail:'rahula',instruction:'在前堂旧照中看大像的手与孩子的头顶之间留下的空隙。'}
      ]
    },
    details:[
      detail('stele','十号碑正面怎样分层','正面照片留下了十号碑龛柱、衣褶与残彩。沿中轴从一层移到下一层，会遇到并坐的二佛、交脚菩萨和坐佛说法。两旁另有故事画格。先辨中轴与侧格，再读人物动作，就容易找回整碑的构图。',[4.79,1.14,-3.48],[3.18,-3.44],photo),
      detail('thousand','千佛一直刻到碑侧','一号碑用大理石刻成，过去曾经敷彩。照片里可沿横排、竖列寻找山形碑额以下的众佛。窟志记碑身厚约十六厘米，小佛也刻到两个窄侧面，因此正面图只展示了四面造像中的一部分。',[-4.90,1.18,-3.38],[-3.43,-3.09],gazette),
      detail('lintel','烟熏的第十一龛','前堂左侧这座龛口保存一层层塑出来的山、人物与龛楣。现存坐佛的衣裾垂到座前。张铭在烟熏较重的龛楣画中辨出与维摩诘经有关的形象，龛楣上方另有悬塑说法场面，两处媒材、位置各有不同。',[-5.46,2.83,-1.58],[-3.75,-1.58],niche),
      detail('ceiling','平顶右侧的一方覆斗','地方志记录，第133窟前堂大部分是平顶，中央有半圆形涡阙，右侧还开出覆斗形藻井。平顶与斜披相邻，顶面便有了高低转折。窟顶留下的天人和羽人，也是从原址调查中辨识出来的。',[2.49,5.69,-3.91],[2.10,-2.83],gazette),
      detail('crossed','左后室的交脚菩萨','走过岩墙，左内室的左壁龛内有一尊菩萨装弥勒。双足在座前交叠，披帛从肩臂垂向座侧，身上的浮雕衣纹较疏。在一九五六年的黑白照片中，冠饰、膝部和相交的双脚仍可辨认。',[-5.35,1.04,-7.98],[-3.55,-7.57],gazette),
      detail('rahula','前堂里的释迦会子','一九五六年的照片中，大像的面部已在画幅之外。能看清的是下垂的手掌、孩子合拢的双手和身形的高低差。两只手仍有一段距离。宋代塑工让父子相见的故事停在将触未触的一刻。',[-.82,1.84,-4.96],[-1.85,-3.33],survey)
    ]
  }
};
