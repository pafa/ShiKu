// Local +x is the visitor's right. The entrance is z = 0.
const museum='https://www.lmsk.cn/Gywm_id_5.html';
const lotusSurvey='https://shilun.xafa.edu.cn/info/1036/7408.htm';
const musicStudy='https://ygx.sxu.edu.cn/db/期刊/20260417/499云冈石窟乐器图像再识.pdf';
const atlas='https://lib.hifa.edu.cn/info/1083/1419.htm';
const photo=n=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(n.replaceAll(' ','_'));
const musicPhoto=photo('云冈石窟第十二窟前殿窟顶.jpg');
const lotusPhoto=photo('Ancient Buddhist Grottoes at Longmen- Lianhua (Lotus Flower) Grotto Ceiling.jpg');
const ground=(x0,x1,z0,z1)=>({x0,x1,z0,z1});
const point=(id,title,text,anchor,stand,source)=>({id,title,text,anchor,stand,source:new URL(source).href});

export const records={
  'yungang-12':{
    width:7.2,depth:10.4,height:6.65,mouthWidth:3.7,
    kind:'前后室佛殿窟 · 石刻伎乐与仿木构',
    orientation:'云冈第12窟原址南面为入口，前室北壁设明窗和通向后室的窟门。',
    note:'赵昆雨、贾争慧调查记前室东西宽7.2米、进深4.1米、高6.65米。原址照片分别记录窟顶平棊、明窗、成列乐伎与仿木建筑，适合按壁面辨认相邻的细部。',
    sources:[{label:'赵昆雨、贾争慧 · 云冈石窟乐器图像再识',url:new URL(musicStudy).href},{label:'湖北美术学院图书馆 · 云冈石窟艺术展',url:atlas},{label:'Patrick20242023 · 第12窟前室窟顶实摄及许可',url:musicPhoto}],
    obstacles:[ground(-3.6,-1.08,-4.37,-3.97),ground(1.08,3.6,-4.37,-3.97),ground(-2.60,2.60,-10.4,-9.63)],
    details:[
      point('coffers','抬头辨认莲花平棊','前室顶心有一格一格的平棊。圆瓣莲花与格边的飞天沿顶面铺开，再向下与北壁的天宫乐伎相接。先沿一道横梁看相邻两格，再转向高处正壁，能读出从窟顶转入乐列的层次。',[.12,6.35,-2.64],[-.28,-1.18],musicPhoto),
      point('ensemble','十四个尖拱里的乐队','北壁上层由十四个相邻的小尖拱组成，各坐一身乐伎。衣袖下面露出的手与乐器相接。沿拱口逐个找，有人抱持弦乐器，有人把吹管举到口边。同在一列，身体与双手的朝向各不相同。',[-1.454,5.225,-3.859],[-1.05,-1.20],musicStudy),
      point('window','明窗边正在奏乐的人','从上方列龛往下看，明窗斜边上的乐伎改变了姿态，有人屈膝，有人侧首。研究者在三条斜边上辨出十七身乐伎。师傅把演奏的人刻进窗的边界，留出中间的采光开口。',[1.20,3.77,-3.90],[.75,-1.50],musicStudy),
      point('eaves','侧壁上的石造殿檐','原址照片中，坐佛上方挑出一道石檐。沿檐往下，是横枋、斗拱和立柱。不同方向的构件把上下几层龛像隔开，也让一整面石壁呈现出殿堂的层次。',[3.459,2.806,-2.097],[1.23,-2.22],atlas)
    ],
    experience:{title:'云冈天宫伎乐',medium:'乐器图像辨读',intro:'入前室仰看莲格，再循乐伎的手势辨认合奏、明窗和殿檐。',cover:'assets/experience/east/yg-cover.webp',sourceNote:'各驻足的原址照片分别标明窟顶、北壁乐列、明窗与仿木雕刻。',
      stages:[
        {label:'仰看平棊',detail:'coffers',fov:61,instruction:'沿格边看两朵莲花之间的天人。'},
        {label:'寻找乐队',detail:'ensemble',fov:57,instruction:'在北壁照片中沿尖拱寻找乐伎，比较手和乐器的姿势。'},
        {label:'转读明窗',detail:'window',instruction:'沿明窗的斜边寻找屈膝和侧首的乐伎。'},
        {label:'侧看檐下',detail:'eaves',instruction:'在侧壁照片上，从屋檐依次找到横枋、斗拱和龛中造像。'}
      ]}
  },
  'longmen-712':{
    width:6.22,depth:9.78,height:5.9,mouthWidth:2.05,
    kind:'穹窿顶石窟 · 倒垂莲花高浮雕',
    orientation:'莲花洞原址由东侧入窟，正壁在西。立佛位于中轴前端，莲花刻在头顶。',
    note:'龙门石窟研究院公布原窟高5.9米、宽6.22米、深9.78米。窟顶照片可辨花盘和花瓣的遮叠，正壁造像另有原址图版。飞天的方位由考察记录补充。',
    sources:[{label:'龙门石窟研究院 · 莲花洞',url:museum},{label:'西安美术学院 · 莲花洞现场考察',url:lotusSurvey},{label:'Gary Todd · 莲花洞窟顶实摄及 CC0 说明',url:lotusPhoto}],
    obstacles:[ground(-3.11,3.11,-9.78,-8.62)],
    details:[
      point('petals','花心为什么垂在头顶','在窟顶原址照片中，花心的莲子和围着它展开的花瓣仍可分辨。石匠将周围岩面向后剔去，把一个厚实的花盘留在顶部。沿莲瓣外缘看，能辨出这朵花向下突出的轮廓。',[.014,5.436,-5.361],[.12,-2.75],museum),
      point('edge','瓣缘之间的明暗交界','照片里，一圈莲瓣的亮边紧挨着下一圈的暗部。花瓣层层向外伸出，遮住相邻部分的光线。顺着照片里已有的明暗交界，可以分清相叠的顺序，也能找到尖端翻卷或残损的位置。',[-.869,5.542,-5.155],[-1.16,-3.62],lotusSurvey),
      point('flight','南北两侧的飞天','考察记录把飞天分列在莲花南、北两侧，每侧三身，方向朝向西壁主尊。居中的莲花向下突出，飞天却横向飞行。二者共同将礼拜者头顶的空间与前方佛像联系起来。',[2.132,5.318,-5.696],[.78,-4.20],lotusSurvey),
      point('image','与窟顶相对的立佛','西壁照片里，居中的释迦牟尼和两旁的弟子、菩萨都是立姿。主像袈裟的线条垂向脚边。原窟中，这组向下延伸的身形与头顶向四周张开的莲花同处一个空间。',[.121,2.716,-8.855],[.18,-6.34],lotusSurvey)
    ],
    experience:{title:'莲花洞的花盘与飞天',medium:'窟顶雕刻细读',intro:'从窟顶原址照片辨认花盘和莲瓣，再读飞天的方向，对照正壁立佛。',cover:'assets/experience/east/lm-cover.webp',sourceNote:'窟顶莲花与正壁各有原址照片。飞天的朝向据石窟调查记录。',stages:[
      {label:'从花心看起',detail:'petals',fov:55,instruction:'从中轴仰视，辨认莲蓬和数层花瓣。'},
      {label:'看花瓣的边缘',detail:'edge',fov:50,instruction:'在窟顶照片中，沿瓣缘辨认相邻两层花瓣的亮边和暗面。'},
      {label:'读飞天的方位',detail:'flight',instruction:'从调查记录辨认南、北两列飞天如何朝向西壁。'},
      {label:'回看立佛',detail:'image',instruction:'转向西壁，对照立佛的衣纹与头顶花冠。'}
    ]}
  }
};
