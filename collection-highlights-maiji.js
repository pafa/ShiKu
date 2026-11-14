// Each object has its own source. Historic photographs are explicitly dated;
// reproductions and the following reading plates have separate media records.
const folder='assets/experience/maiji/';
const archive='https://ygx.sxu.edu.cn/db/';
const gazette='https://www.gsdfszw.org.cn/gsxz/tss_270/mjq/202101/P020210129643376043243.pdf';
const field=archive+'%E6%9C%9F%E5%88%8A/dhxjk/dhxj2001/0101pdf/010106.pdf';
const tablets=archive+'%E4%BC%9A%E8%AE%AE/20230410hybuc/120.pdf';
const western='https://www.neac.gov.cn/seac/c103391/202302/1160985.shtml';
const teaching='https://mooc1.chaoxing.com/mooc-ans/ztnodedetailcontroller/visitnodedetail?_fromV2_=&_from_=&courseId=214270353&knowledgeId=343765227&rtag=';
const printed='https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605';
const facsimiles='https://www.sohu.com/a/464950773_501362';
const opening='https://wtl.sz.gov.cn/bsfw/mzwhhd/mzzl/content/post_10704843.html';
const museum='https://www.mjssk.cn/ht/desc?id=501';
const song='https://www.grandcanalmuseum.cn/yunbozixun/924.html';
const text115=archive+'%E6%9C%9F%E5%88%8A/dhxjk/dhxj2004/0401pdf/040116.pdf';
function picture(file,alt,credit,note){return {image:folder+file,alt,credit,imageNote:note};}
function historic(file,alt,change='从原书黑白图版等比例转制。'){
  return picture(file,alt,{author:'名取洋之助，1956年摄；岩波书店，1957年刊',license:'公有领域 · 日本历史摄影',licenseUrl:'https://commons.wikimedia.org/wiki/Template:PD-Japan-oldphoto',source:printed,modified:change},'1956年历史摄影。'+change);
}
const commonsName=n=>n===215?'文物保護歷史_conservation_history_October_2023_R12S_215.jpg':'東方微笑_Oriental_Smile_October_2023_R12S_111.jpg';
const cataloguePhoto=n=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent('SZ_Shenzhen_南山_Nanshan_南頭街_Nantou_Street_深圳南山博物館_Nanshan_Museum_展覽_exhibition_甘肃_Gansu_麥積山石窟_Maijishan_Grottoes_'+commonsName(n));
function exhibitionPhoto(file,n,alt){
  return picture(file,alt,{author:'KWUNGAM Haueng Chanem，2023年深圳南山博物馆展场摄影',source:cataloguePhoto(n),license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',modified:'裁出展品，按比例缩小并转为 WebP，沿用原许可。'},'原件在2023年展览中的摄影。');
}
const readingPlate=(file,alt,note,source)=>({image:null,studyPlate:folder+file,studyPlateAlt:alt,studyPlateNote:note,mediaPage:source});
function make(id,number,title,era,hallId,form,motifs,periodNote,look,chapters,sources,media,spots=[],category){
  const src=sources.map(([label,url])=>({label,url}));
  const item={id:'maijishan-'+id,siteId:'maijishan',number,title,era,hallId,periodNote,form,motifs,
    feature:chapters[0][1],look,story:chapters[0][1],chapters:chapters.map(([title,body])=>({title,body})),sources:src,
    sourceName:src[0].label,source:src[0].url,...media,hotspots:spots.map(([x,y,title,body])=>({x,y,title,body,source:src[0].url}))};
  if(category)item.objectType=category;
  if(category==='馆藏文物')item.holding='麦积山石窟艺术研究所';
  return item;
}
export const additions=[
  make('west-tower','西崖出土石塔','从四面绕观的造像塔','北魏','northern-wei','architecture',['西崖堆积层','仿木塔顶','供养人'],'据研究所藏品展签归北魏。','从檐角沿石柱向下，看塔身佛龛和基座供养人如何占据不同层次。',
    [['从堆积层来到展柜','麦积山石窟加固工程开始前，工作人员清理西崖的堆积层，发现了这件石造像塔。它曾埋在崖下，原来安放的具体地点仍需与出土位置区别。'],['石头上的小殿堂','上部用石刻模拟四面坡屋顶。塔身每面开方龛，一佛与两位菩萨组成一组。下面的塔基刻供养人，人的形象由基座仰望佛龛。']],
    [['研究所藏品 · 西崖石造像塔原展签',cataloguePhoto(215)],['深圳市文旅局 · 东方微笑展',opening]],exhibitionPhoto('stone-tower.webp',215,'北魏塔形石雕，坡屋顶下方龛中立有造像，塔基另分出供养人的小格'),[[.5,.33,'四坡屋顶','石工在塔顶刻出屋面和突出檐角，把建筑轮廓缩进一件可移动的石雕。'],[.51,.79,'塔基的人像','塔基另有整排较小的人像，展签记为供养人。']],'馆藏文物'),
  make('vajra-printblock','馆藏木雕版','在木板上反读经文','明','chronology','inscription',['阳刻经板','金刚经启请','一佛二弟子'],'依据研究所藏原板展签归明代，陈列于断代研读馆。','顺着文字栏和插图之间的分界看，木刻表面保存了纸上经页印出之前的工序。',
    [['一页经文在木板上的样子','这块传世木版正面一边是说法图，另一边排经文。剔去不着墨的木质，让文字笔画和人物轮廓凸起。把墨从板面转到纸上，印文的方向就与眼前木版相反。'],['版面上的人物','展签将中央人物认作一佛二弟子。弟子上方还各排出一组持法器的人物。花纹和字都靠同一片起伏的木面留在纸上，印刷的观看方式由雕工在刻板时预先安排。']],
    [['研究所藏品 · 《金刚经启请》木雕版原展签',cataloguePhoto(1111)],['2023年展览 · 敦煌研究院与南山博物馆',opening]],exhibitionPhoto('printing-block.webp',1111,'长方形木版，一侧雕佛像及人物，另一侧雕成行列的反字'),[[.34,.52,'经首的说法图','佛和两位弟子的轮廓占住插图中心。版上人物和字保留了准备着墨的凸线。'],[.74,.52,'将印在纸上的文字','木面上的阳文在印刷时向纸张翻转，字栏的位置与佛像之间预留了清楚边界。']],'馆藏文物'),
  make('133-stele-one','第133窟 · 一号碑','千佛碑的第四面','北魏','northern-wei','relief',['千佛碑','四面雕刻','山形碑额'],'据窟志归北魏，保留1956年初版图录所见的碑容。','先看山形碑额的说法像，再侧目碑的厚度，体会千佛在四面延续的排布。',
    [['一块碑为什么要绕着看','造像排列在正、背和两个窄侧面。平直的行列到了碑棱仍在延续。四个面以及碑额上的人物合在一起，地方志记录其大小雕像共有一千三百一十二身。'],['碑首变成了山','碑额上部隆起，正面和背面都有浅龛。龛内坐佛的两旁立着菩萨，龛柱外还有弟子。碑额与碑身的构图相互区分，让读者能从一幅说法图移向密集的众佛。']],
    [['《麦积区志》· 第一号造像碑',gazette],['谢生保、陈玉英 · 十八通碑的实地调查',tablets],['岩波书店原摄影集',printed]],historic('first-entire.webp','1956年所摄千佛碑，一尊圆拱形说法龛居顶，碑身横竖排列多行小坐佛'),[[.55,.19,'山形说法龛','这一龛位于碑额；从莲瓣和山峰形的轮廓向内看，会找到正中的坐佛。'],[.55,.50,'行列延伸到窄边','重复的坐佛在各面排布，碑首的说法像则明显大于碑身的小像。']],'窟内碑刻'),
  make('133-rahula','第133窟 · 宋塑','父亲伸向罗睺罗的手','宋','song','sculpture',['释迦会子','前堂中轴','宋塑'],'主展集中观看宋代在较早洞窟中塑成的一大一小两身立像。','找到大佛俯下的手，再看小佛合拢的双掌和两双赤足之间的距离。',
    [['留在手掌之间的空隙','小佛站在大佛身旁，双掌合在胸前，大佛的手落向孩子头顶。佛教故事把小佛认作释迦之子罗睺罗。两身立像以明显的身高差，把低头、仰接和相见放在同一个空间里。'],['从窟门进来时的视线','这组宋塑立在前堂中央。1956年的摄影把大像的面部裁在画面之外，保留了双手、垂下的衣裾和小佛。即使只能看见父亲的一部分身体，动作的关系仍可读出。']],
    [['中国大运河博物馆 · 麦积山上的父与子',song],['《麦积区志》· 窟中大小站佛',gazette],['岩波书店原摄影集',printed]],historic('song-father-son.webp','1956年宋塑局部，小佛合掌站在大佛赤足旁，大佛一只手垂至其头顶上方'),[[.37,.47,'伸向孩子的手','大佛的手在小佛头顶上方停住。人物之间留出的空间让两人的姿势互相呼应。'],[.36,.59,'罗睺罗的合掌','小佛将两臂弯向胸口。衣纹从两只袖口向身下延伸，能看出整具身体的朝向。']],'窟内彩塑'),
  make('133-novice','第133窟 · 第九龛','侧耳微笑的小沙弥','北魏','northern-wei','sculpture',['沙弥','第九龛','泥塑弟子'],'研究所按北魏泥塑著录。','顺着下垂的眼睑看到略倾的头，再看肩、颈怎样接住这一动作。',
    [['藏在一处小龛旁的微笑','第九龛外侧站着一位不足一米高的弟子。头稍偏、肩窄、眼睑微合，笑意在嘴角刚要展开。沙弥是年轻的出家修行者，作者让这种年少的神情保留在礼拜空间中。'],['同窟的两位年轻人','从前堂的大佛与罗睺罗来到这一龛，所见已是另一身塑像。北魏的小沙弥独自站在龛侧；前堂大小佛组像保留宋人的造像手法。留意位置，就能把相隔数百年的作品分别读清。']],
    [['麦积山石窟艺术研究所 · 微笑千年',museum],['第九龛小沙弥 · 展览记录','https://mzj.sh.gov.cn/lnb-xw/20250812/9be1cb79404a4fb89b489ff77eadb44a.html']],readingPlate('novice-study.webp','低首、侧耳与唇线的观察示意','本站依研究所和原展陈说明绘制的姿态图，头面轮廓为释读示意。',museum),[],'窟内彩塑'),
  make('123','第123窟','童男与童女的衣冠','西魏','western-wei','sculpture',['圆领袍','童男童女','文殊问疾'],'据魏文斌的麦积山西魏窟群分期。','把两张旧照片并排看，比较毡帽、发髻和交握在身前的手。',
    [['在说法者身边看见孩童','第123窟两侧表现文殊与维摩诘对坐，身边还有童男和童女。两位孩子的圆领衣、细小手臂和不同的发式，为说法场景带来当时日常服饰的线索。'],['照片把左右两边带到一起','童男戴圆顶帽，双手拢在身前。童女挽发髻，神情安静。1956年摄影者分别靠近两人，本馆将两张历史照片并列，方便比对衣领和头饰，拼图次序不指示人物原位。']],
    [['魏文斌 · 西魏窟群与彩塑',teaching],['魏文斌 · 丝路明珠麦积山石窟',western],['名取洋之助 · 摄影图版选刊',facsimiles]],historic('123-children.webp','1956年童男与童女的两张独立黑白近照，从左至右可比较圆顶帽与发髻','两张照片等高并置，左童男、右童女。'),[[.27,.22,'童男的帽子','圆顶毡帽贴着额头，帽缘和脸部在侧光中分开。'],[.73,.16,'童女的双髻','头上的发髻与另一位孩子的毡帽形成对照，两人的年龄感也通过细小的肩颈表现出来。']]),
  make('102','第102窟','两壁之间的问疾','西魏','western-wei','shrine',['维摩诘','文殊','对坐'],'据魏文斌所列西魏洞窟与问疾题材。','先看历史摄影中居士的面容，再把他的身体朝向放回洞窟两侧相对的布局中。',
    [['对话横跨一间窟','礼拜者正面所见为说法佛，两侧壁则把文殊与维摩诘置于相对的位置。一侧是菩萨，一侧是在家的居士。诵读经文时才发生的对话，通过窟内人物的位置呈现出来。'],['从冠巾辨认说话人','名取洋之助走近维摩诘，镜头留下头上的冠巾、长眉、下垂的衣领和安定的目光。图版所见只有一位人物，对面的文殊可以从整窟的调查叙述中找回。']],
    [['魏文斌 · 第102、123窟的文殊问疾布局',teaching],['《西北美术》· 第102窟维摩诘图版',archive+'%E6%9C%9F%E5%88%8A/xbms/xbms2018/1804pdf/180423.pdf'],['岩波书店原摄影集',printed]],historic('102-vimalakirti.webp','第102窟维摩诘黑白近景，戴冠巾，颈部衣带相交'),[[.48,.21,'居士的冠巾','冠巾与衣领一起标明人物的装束。此处用冠巾近景观察维摩诘的世俗人物形象。']]),
  make('115','第115窟','佛座上的景明三年','北魏 · 502年','northern-wei','inscription',['景明三年','须弥座','墨书发愿文'],'正壁佛座墨书题记载景明三年，折合公元502年。','先读题记保留下来的年代，再看这四个字出现于佛身下方的何处。',
    [['佛座也保存时间','在第115窟正壁坐佛的须弥座前，考察者辨出了景明三年的发愿题记。这个明确的年号把一组造像落到公元502年，为比较其他没有纪年的北魏窟龛提供了参照。'],['沿着三壁认识小窟','调查记载小窟为方形平顶，三壁有低坛，正面坐佛与左右菩萨各占一个位置。题记写在坐佛所倚的台座上，追问佛像何时营造，也就需要把视线从面容移到座前。']],
    [['项一峰 · 麦积山北魏115窟造像壁画内容考释',text115],['《麦积区志》· 北魏题记',gazette]],readingPlate('115-inscription.webp','景明三年与公元502年对照的纪年释文','根据题记考释排印。字形使用现代字体。',text115)),
  make('135','第135窟','三明窗下的三尊像','北朝 · 窟期分说','chronology','architecture',['三明窗','平顶窟','天堂洞'],'地方志从北魏讨论开凿，魏文斌将本窟列入西魏窟群，展线并置两种资料。','先看照片中三身人物的大小关系，再读窟志中从前壁三扇窗进入的光。',
    [['天堂洞的三个光口','这间横向方室俗称天堂洞，前壁上部并排开三扇明窗，中间一扇稍高。它们将光送到室内的造像和壁画。旧照片虽然不把窗拍入画面，仍保存了三身造像在有限光线中的层次。'],['如何读这个窟的年代','地方志的登记和后来的分期研究用不同线索讨论开窟。佛与胁侍的衣纹、窟内的建筑结构、后世修整过的局部，都应分别说明。本馆以北朝归类，保存两种可查的断代意见。']],
    [['《麦积区志》· 第135号窟三明窗与造像',gazette],['魏文斌 · 西魏窟群分期',western],['岩波书店原摄影集',printed]],historic('135-triad.webp','1956年摄影中的第135窟佛三尊，中央佛像与两侧的人物处于阴影和亮部之间'),[[.49,.44,'三尊相对的比例','中央坐佛居主要位置，两旁人物的衣领、肩线和站姿提供比较。']])
];
