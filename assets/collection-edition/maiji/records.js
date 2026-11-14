// Historical photographs are from Yōnosuke Natori's 1956 fieldwork.
const folder = 'assets/collection-edition/maiji/';
const book = 'https://ndlsearch.ndl.go.jp/books/R100000002-I000000964605';
const plates = 'https://www.sohu.com/a/464950773_501362';
const registry = 'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/dhxjk/dhxj2001/0101pdf/010106.pdf';
const survey = 'https://zgysyyw.shcmusic.edu.cn/2018/1229/c2939a6331/page.htm';
const gazette = 'https://www.gsdfszw.org.cn/gsxz/tss_270/mjq/202101/P020210129643376043243.pdf';
const thesis = 'https://ygx.sxu.edu.cn/db/%E5%AD%A6%E4%BD%8D/D01767911.pdf';
const course = 'https://mooc1.chaoxing.com/mooc-ans/ztnodedetailcontroller/visitnodedetail?_fromV2_=&_from_=&courseId=214270353&knowledgeId=343765';
const rubbingPage = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent('SZ_Shenzhen_南山_Nanshan_南頭街_Nantou_Street_深圳南山博物館_Nanshan_Museum_展覽_exhibition_甘肃_Gansu_麥積山石窟_Maijishan_Grottoes_文物保護歷史_conservation_history_October_2023_R12S_112.jpg');

function photograph(file, caption) {
  return {src:folder + file + '.jpg', kind:'historical', caption:caption + '（1956年摄）',
    credit:'名取洋之助，《麦積山石窟》，岩波书店，1957年', source:book, edition:plates,
    license:'公有领域 · 日本历史摄影', licenseUrl:'https://commons.wikimedia.org/wiki/Template:PD-Japan-oldphoto', originalFrame:false};
}
export const images = {
  'maijishan-105':[photograph('105-companions','第105窟菩萨与比丘像上半身，两人的脸和不同的领口在同一画面内')],
  'maijishan-60':[photograph('60-attendant','第60窟胁侍菩萨上半身，可见高冠、胸前抬起的手及衣纹')],
  'maijishan-26':[photograph('26-musician','第26窟左壁佛座下面的浮塑飞天，腰身和飘带贴近座面，投影横过残损部分')],
  'maijishan-27':[photograph('27-wall-canopy','第27窟壁画局部，立像围绕圆光人物，树冠和屋檐横列上方'),
    photograph('27-wall-assembly','第27窟另一处壁画局部，两层人物与横向界栏仍可辨认')],
  'maijishan-14':[photograph('14-guardian','第14窟左壁力士面部和双肩，侧转的脸、耳轮与向外突出的下颌可辨')],
  'maijishan-42':[photograph('42-seated','第42窟坐佛侧前方全像，光照到头顶、双膝和座前垂下的衣裾')],
  'maijishan-90':[photograph('90-kasyapa','第90窟迦叶像，手在胸前相握，眉骨和颊部有深刻起伏')],
  'maijishan-1':[photograph('1-nirvana','第1窟涅槃组像局部，两身人物俯向卧佛一侧，画面只收入佛身一角')],
  'maijishan-4-yuxin':[{
    src:folder+'4-yuxin-rubbing.webp', kind:'document', caption:'深圳南山博物馆展出的《秦州天水郡麦积崖佛龛铭并序》拓片，右侧留有题名，横向裂痕贯穿纸面。2023年摄。',
    credit:'KWUNGAM Haueng Chanem，2023年深圳南山博物馆展场摄影。裁去展柜边框，转为 WebP。',
    source:rubbingPage, license:'CC BY-SA 4.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/', originalFrame:false}],
  'maijishan-123':[photograph('123-vimalakirti','第123窟右壁维摩诘像，身体微俯，一手举至胸前'),photograph('123-manjusri','第123窟左壁文殊像，冠带和肩部朝向可与对壁的维摩诘比较')],
  'maijishan-4':[photograph('4-king-left','第4窟长廊左端天王全身，两腿分开立于台上'),photograph('4-king-right','第4窟长廊右端天王全身，双臂横于胸腹之间')],
  'maijishan-13':[photograph('13-cliff','第13窟东崖摩崖大像与木构栈架，旧栈道在照片中沿崖上下相接')],
  'maijishan-43':[photograph('43-attendant','第43窟胁侍菩萨，面部微倾，拍摄范围包括上半身和胸前手势')],
  'maijishan-165':[photograph('165-donor','第165窟供养人侧前方近照，可见发式、眉眼和转向的下颌')]
};

function exhibition(id, number, title, era, homeHall, form, motifs, sourceName, source, feature, story, look, reason) {
  const key='maijishan-'+id;
  const plate=images[key][0];
  return {id:key,siteId:'maijishan',number,title,era,homeHall,hallId:homeHall,form,motifs,source,sourceName,
    feature,story,look,reason,periodNote:reason,newAcquisition:true,image:plate.src,alt:plate.caption,
    credit:{author:plate.credit,license:plate.license,licenseUrl:plate.licenseUrl,source:plate.source},
    chapters:[{title:'观看实物',body:feature},{title:'造像与营建',body:story}],
    sources:[{label:sourceName,url:source},{label:plate.kind==='document'?'展场摄影及署名':'1957年摄影原集书目',url:plate.source}]};
}
export const newWorks = [
  exhibition('105','第105窟','并肩的菩萨与比丘','西魏开窟，历代重修','western-wei','sculpture',['菩萨','比丘','衣领'],
    '国家民委 · 丝路明珠麦积山石窟的历史与艺术','https://www.neac.gov.cn/seac/c103391/202302/1160985.shtml',
    '左侧人物戴宝冠，胸前衣带交叠。右侧比丘低下头，两人的肩几乎相接；一边层层装饰，一边留出简洁的面庞。',
    '第105窟属于麦积山西魏营造的窟群。只看脸容易把这两位看成同类人物，冠饰和僧衣却点出了两种身份。',
    '先比较两人的头顶，再沿胸前的衣领分辨谁是比丘。','以同框的一僧一菩萨，对读西魏第60窟的单身胁侍。'),
  exhibition('60','第60窟','小龛中的冠与手','西魏 · 胁侍菩萨','western-wei','shrine',['胁侍菩萨','穹窿顶','举手'],
    '项一峰 · 麦积山石窟内容总录',registry+'#page=3',
    '菩萨抬起一手，指尖与胸口相近，高冠则拉长了整尊像的轮廓。冠后的暗色与脸颊上的亮面把人物从龛壁中托出。',
    '西崖大佛下方的第60窟很小，窟志著录龛深约六十三厘米。佛与胁侍都塑在这处浅龛里，近照把菩萨的冠式和手势单独留了下来。',
    '从冠顶下移至举起的右手，看肩线怎样连接二者。','近看西魏小龛内一身可辨冠式与手势的胁侍。'),
  exhibition('26','第26窟','佛座下的乐伎飞天','北周','northern-zhou','relief',['佛座','浮塑','伎乐'],
    '上海音乐学院 · 麦积山实地考察',survey,
    '人物浮起在左壁佛座的正面。飘带拉出弧线，肩头和头部因浮雕的高低接住光线；投到座上的两道阴影还遮住了部分细节。',
    '第26窟两侧佛座下共见四身乐伎，考察者辨认出腰鼓与排箫。仰望窟顶看涅槃故事之后，还可以把目光放低，找这些藏在座边的演奏者。',
    '看头部凸出的亮面和座面的阴影，再找飘带伸向何处。','用佛座正面的浮塑补足北周馆的乐舞造像。'),
  exhibition('27','第27窟','斜顶上听法的人群','北周 · 法华经变','northern-zhou','ceiling',['法华经变','窟顶北披','听法人物'],
    '上海音乐学院 · 麦积山实地考察',survey,
    '近照中，树枝、屋檐和圆形头光仍能逐一辨认。人物有些只余轮廓，画工用方向一致的面孔把分散的人群聚成一场听法。',
    '与第26窟相邻的第27窟，在窟顶北披描绘《法华经》故事。考察记录指出其中有释迦、多宝二佛并坐和两侧听众。两幅原址摄影留下壁画的局部，可逐层细看。',
    '沿头光和屋檐寻找队列，换到第二张照片再看上下层分界。','用同窟两幅人物壁画近照展示北周经变画的叙事。'),
  exhibition('14','第14窟','转头的门侧力士','隋','sui','sculpture',['左壁力士','侧转头部','护法'],
    '刘丹 · 麦积山石窟残损洞窟的复原研究',thesis,
    '眉弓向前突出，头转向一侧，下颌和耳垂的轮廓明确。近照保留了泥层的斑驳，尤其能看清眉眼、嘴唇怎样被塑得厚实。',
    '第14窟位于东崖，前部曾经坍塌，左壁的力士仍能辨认。相对于主尊的正面端坐，这身护法通过转头和展开的肩膀把视线带向两旁。',
    '先看耳朵和鼻尖的前后关系，再看硕宽的颈部。','以左壁现存力士展示隋代东崖残窟中的护法形象。'),
  exhibition('42','第42窟','照到佛座的斜光','隋代营造','sui','sculpture',['坐佛','佛座','垂衣'],
    '麦积山石窟专题课程 · 隋唐造像',course+'229&rtag=',
    '摄影者从侧前方取景，人物低头而坐，膝前垂衣落在方形座上。前方明亮的岩面和身后深黑的阴影让佛座的进深十分清楚。',
    '第42窟列入麦积山隋代洞窟的造像研究。保留下来的这张全身照片既拍到坐像，也拍到承托它的座，能够用头部和膝部的比例观察坐姿。',
    '循额头至衣裾一路往下，看衣纹在哪里转为座前垂直的线。','与隋代第14窟力士的局部摄影构成坐姿与立姿对照。'),
  exhibition('90','第90窟','迦叶胸前交叠的手','宋代重修 · 早期窟室','song','sculpture',['迦叶','宋代重塑','弟子'],
    '项一峰 · 麦积山石窟内容总录',registry+'#page=9',
    '迦叶的眉骨隆起，双颊在侧光下显得深陷。脸颊朝向一侧，袖口处的双手却在胸前相合，指节和教衣分出了两种质感。',
    '这座早期开凿的洞窟经过多次修缮。宋代重塑时，正壁佛旁的组合由菩萨转为迦叶和阿难两位弟子。馆中所看的是宋代改塑留下的迦叶形貌。',
    '从突起的眉骨看到指节，比较面部和双手哪些地方接住了光。','按重塑的迦叶弟子像而非始凿年代归入宋馆。'),
  exhibition('1','第1窟','卧佛身旁的弟子','北魏开窟 · 唐宋明重修','chronology','sculpture',['涅槃','卧佛洞','弟子'],
    '天水市麦积区地方志编纂委员会 · 麦积区志',gazette,
    '画面中的人物向前倾身，视线落在照片外延伸的卧佛身上。最下方的一角衣褶，提示这幅局部照片只截取了横长佛床的一端。',
    '东崖第1窟俗称卧佛洞。地方志记载，窟室由北魏开凿，唐、宋、明各有修缮，现存涅槃造像经明代重修。沿六米多长的佛床排列的人物，让卧佛的横姿有了一连串回应。',
    '顺着两人的目光向照片下方看，再想象佛床沿水平方向延伸。','用旧影分辨北魏窟形、后世涅槃造像与1956年的记录时间。'),
  exhibition('4-yuxin','第4窟 · 龛铭','庾信写下的七佛龛','北周撰文 · 明代重刻','northern-zhou','inscription',['庾信','七佛龛','铭文拓片'],
    '天水市麦积区地方志编纂委员会 · 麦积区志',gazette,
    '纸上白字自右向左排成直行。最右一行标出“秦州天水郡麦积崖佛龛铭并序”，移向中间便能读到“七佛龛”；断裂处的纸墨也留下了石面的形状。',
    '庾信在北周为这座七佛龛撰写铭序，记下发愿和营造的缘由。地方志著录的明嘉靖四十三年重刻本作于1564年。展厅里所见是拓片在现代展览中的照片，文字的撰写、石上的重刻和今天的观看各有时间。',
    '由右侧题名向左找“王父”“七佛龛”，再与第4窟七间并列的格局对读。','以北周原文归入北周馆，标明重刻年代与现代展场摄影。')
];

export const references = {
  'maijishan-44':[
    {label:'敦煌研究院 · 第44窟原址合影（九美旦增摄影）',url:'https://www.dha.ac.cn/info/1018/7670.htm#:~:text=麦积山石窟第44窟的西魏泥塑'},
    {label:'数字敦煌 · 正壁主佛近照',url:'https://ip.e-dunhuang.com/item.html?id=11306'}],
  'maijishan-133-novice':[{label:'敦煌研究院 · 第133窟小沙弥原址配图',url:'https://www.dha.ac.cn/info/1018/7670.htm#:~:text=北魏时期的麦积山石窟第133窟'}],
  'maijishan-31':[{label:'麦积山石窟艺术研究所 · 第31窟原址调查，图版与测绘',url:'https://ygx.sxu.edu.cn/db/%E6%9C%9F%E5%88%8A/20260417/371%E9%BA%A6%E7%A7%AF%E5%B1%B1%E7%9F%B3%E7%AA%9F%E7%AC%AC31%E7%AA%9F%E7%9A%84%E8%B0%83%E6%9F%A5%E4%B8%8E%E7%A0%94%E7%A9%B6.pdf#page=3'}]
};
