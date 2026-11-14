const gazette = 'https://www.gsdfszw.org.cn/gsxz/tss_270/mjq/202101/P020210129643376043243.pdf';
const history = 'https://www.neac.gov.cn/seac/c103391/202302/1160985.shtml';
const eastCliffStudy = 'https://ygx.sxu.edu.cn/db/期刊/20260417/936麦积山石窟东崖大型洞窟的关系——以千佛廊为纽带的北周和隋代皇家石窟营造.pdf';
const pigments = 'https://doi.org/10.3390/cryst15040339';
const paintedWalls = 'https://doi.org/10.3389/fmicb.2025.1657118';
const nicheSurvey = 'https://doi.org/10.1371/journal.pone.0179718.g001';
const commons = 'https://commons.wikimedia.org/wiki/File:';
const anagoria = '2016-12-15_Maijishan_Grotten_麥積山石窟_anagoria_';

function fieldPhoto(file, caption, author, name, license, licensePath, contextOnly=false) {
  return {src:'assets/gallery-maiji/'+file+'.webp', kind:'site', caption, credit:author, source:commons+encodeURIComponent(name),
    license, licenseUrl:'https://creativecommons.org/licenses/'+licensePath+'/', originalFrame:false, contextOnly};
}

function studyPhoto(file, caption, author, source, kind='site', details=[]) {
  return {src:'assets/gallery-maiji/'+file+'.webp', kind, caption, credit:author, source, details,
    license:'CC BY 4.0', licenseUrl:'https://creativecommons.org/licenses/by/4.0/', originalFrame:false};
}

const wang = 'Jiakun Wang, Miaoying Lv, Nan Song, Huan Zhang, Bokai Xu, Hui Zhang';
const ma = 'Wenxia Ma, Qiqi Chen, Fasi Wu, Dongpeng He, Yulong Duan, Yongqiang Yue, Ji-Dong Gu, Xiaoyan Yang, Huyuan Feng';
const duan = 'Yulong Duan, Fasi Wu, Wanfu Wang, Dongpeng He, Ji-Dong Gu, Huyuan Feng, Tuo Chen, Guangxiu Liu, Lizhe An';

export const evidence = {
  'maijishan-98':[
    fieldPhoto('west-cliff-98','从第98号摩崖脚下仰望，画面左侧的胁侍与中间的立佛仍可分辨。胸中发现的钱币幡未入镜。','Anagoria',anagoria+'43.jpg','CC BY 3.0','by/3.0',true),
    fieldPhoto('clouds-98','西崖大佛足下的卷云。高高托起的云头在仰角中遮住部分双脚。','Anagoria',anagoria+'46.JPG','CC BY 3.0','by/3.0',true)],
  'maijishan-120':[
    studyPhoto('green-120','第120窟现场。坐像左侧壁画上的小框标出取样处，左下角是同一块绿色颜料的放大图。',wang,pigments,'site',['paint']),
    studyPhoto('layer-120','第120窟绿色颜料样品的截面显微照片。原作者从上到下标出深绿、浅绿和地仗三层。',wang,pigments,'document',['paint'])],
  'maijishan-28-30-painted-walls':[
    studyPhoto('wall-paint-28-30','第28、30窟联合调查图版1E。彩绘衣缘下方留有白色痕迹，右侧色卡提供比例。论文将两窟合并著录。',ma,paintedWalls),
    studyPhoto('wall-marks-28-30','同组图版1I。箭头标出壁面近地处的深色斑块，墙脚保留着现场色标。',ma,paintedWalls)],
  'maijishan-4-fourth-niche':[
    studyPhoto('group-4-centre','上七佛阁第四龛正中坐佛。图上字母和圈线是研究人员添加的观察位置。',duan,nicheSurvey),
    studyPhoto('group-4-north','第四龛北侧立像。图1C保留了北侧菩萨从冠饰到衣摆的形貌。',duan,nicheSurvey),
    studyPhoto('group-4-south','第四龛南侧立像。图1E中可见层层下垂的衣褶与胸前手势。',duan,nicheSurvey)],
  'maijishan-5-armoured-guardian':[
    fieldPhoto('guardian-5','第5窟中龛外的踏牛天王上身。胸甲、双拳和短须可见，牛犊在照片下缘之外。','Anagoria',anagoria+'35.JPG','CC BY 3.0','by/3.0')],
  'maijishan-4-corridor-guardian':[
    fieldPhoto('guardian-4','第4窟长廊端部的金刚力士。红色躯干前缠着帔帛，屈起的一臂高过头顶。','Shizhao','Majishan_grotto_004_(4).jpg','CC BY-SA 3.0','by-sa/3.0')]
};

function exhibition(id, number, title, era, homeHall, form, motifs, chapters, look, reason, sources) {
  const key = 'maijishan-'+id;
  const plate = evidence[key][0];
  return {
    id:key, siteId:'maijishan', number, title, era, homeHall, hallId:homeHall, form, motifs,
    image:plate.src, alt:plate.caption, credit:{author:plate.credit,source:plate.source,license:plate.license,licenseUrl:plate.licenseUrl},
    source:sources[0].url, sourceName:sources[0].label, chapters, feature:chapters[0].body, story:chapters[1].body,
    look, reason, periodNote:reason, sources, newAcquisition:true
  };
}

const district = {label:'天水市麦积区志 · 石窟篇第四章',url:gazette};

export const additions = [
  exhibition('28-30-painted-walls','第28、30窟','衣缘下方的两片壁色','初建分期有争议，历代重修','western-wei','mural',['彩绘壁面','龛内色层','壁画保护'],[
    {title:'沿衣缘往下看',body:'曲线勾出的衣褶到了下摆便停住，底下露出一大片浅色壁面。蓝色箭头指向两处发白的痕迹。翻到另一张照片，深色斑块聚在墙脚，旁边的色标只有手掌大小。'},
    {title:'两座相邻的崖阁',body:'第28、30窟都在东崖，前面开廊，廊后各有三龛。孙晓峰将它们列入西魏，地方志记作北魏；另有研究按东崖各窟的上下层位，提出了隋代营造的解释。两窟经历多次重修，这组近照记录了今日壁面的保存状态。'}],
    '比较浅壁上的白痕与墙脚的深斑，再沿色标估一估它们的范围。','依孙晓峰的营建分期归入西魏；图版记录现代调查时的壁面，颜料年代未逐层确定。',
    [{label:'孙晓峰 · 麦积山石窟的历史与艺术',url:history},{label:'Ma 等 · 图1E、I现场调查',url:paintedWalls},district,{label:'麦积山石窟东崖大型洞窟的关系 · 隋代营造说',url:eastCliffStudy}]),
  exhibition('4-fourth-niche','第4窟第四龛','围在坐佛两侧的立像','北周建阁，后世重修','northern-zhou','shrine',['上七佛阁','第四龛','彩绘泥塑'],[
    {title:'走进七龛正中',body:'沿上七佛阁数到第四龛，中间的坐佛垂目向前。换看两侧，站立的菩萨挽起头发，手臂绕着帔帛。把正中和两侧的照片连起来，才能体会一龛人物环绕主尊的安排。'},
    {title:'同一屋檐下的不同表面',body:'第四龛位于北周开建的崖阁。2017年发表的现场调查分别拍摄主佛和南北两侧的菩萨，比较龛内不同位置的彩层。照片上较暗的面容和粉白的衣裳对应着实际保存状态，圈线是研究者留下的标记。'}],
    '从正中坐佛转看北侧、南侧两组立像，比较一只手在胸前、一只手沿衣摆下垂的姿态。','以北周崖阁的第四龛展示多面观看方式，现状包含后世重修。',
    [{label:'Duan 等 · 上七佛阁第四龛现场图1',url:nicheSurvey},district]),
  exhibition('5-armoured-guardian','第5窟中龛外','踏牛天王胸前的铠甲','初唐塑像，明代重妆','tang','sculpture',['牛儿堂','踏牛天王','护胸甲'],[
    {title:'看守中龛的武将',body:'天王在龛门旁平举双拳。先看脸上的赤须，再看身前鼓起的两块胸甲：嘴和双眼刻出紧张的神态，胸甲和袖口却用连续弧线收得很整齐。身后还能望见龛内彩绘的一角。'},
    {title:'为何叫牛儿堂',body:'地方志记下，这尊三米多高的护法脚下蹲着一头扭颈的牛犊，整座崖阁便得了“牛儿堂”的名字。中龛的佛与弟子出于隋代，龛外天王和两侧小龛造像成于初唐，明人又重妆彩色。近照停在腰部，足下的牛犊要从窟志中接着读。'}],
    '从胡须向下看两层甲片，再找龛门竖线与天王身体的关系。','用一身有明确唐代分期的守门造像说明牛儿堂的得名。',
    [district,{label:'龛外天王实景摄影',url:evidence['maijishan-5-armoured-guardian'][0].source}]),
  exhibition('4-corridor-guardian','第4窟廊端','藏在力士身后的支撑','宋代圆塑，北周崖阁','song','sculpture',['长廊端部','金刚力士','帔帛'],[
    {title:'一臂高过头顶',body:'力士臂弯朝上，腰腹转向一侧。浅色的帔帛从双臂间绕过，和深红色身体分出两重轮廓。抬头还可看见上方另有小龛与群像，门前的武将一下显得格外高大。'},
    {title:'泥塑怎样站稳',body:'上七佛阁开建于北周，长廊两端这对金刚力士则著录为宋塑。两尊都在四米上下。地方志特别记下，甩到身后的战裙接触地面，给大幅度转动的身躯再添一处支撑；背后还用木桩与崖壁连接。'}],
    '沿高举的手臂往下看，找出从肩侧绕至腰间的帔帛。','区分北周崖阁与宋代补塑，观察大型泥塑怎样平衡重量。',
    [district,{label:'Shizhao · 第4窟宋塑金刚力士摄影',url:evidence['maijishan-4-corridor-guardian'][0].source}])
];

const paint120 = evidence['maijishan-120'][0];
export const revisions = {
  'maijishan-120':{
    title:'坐像身旁的两层绿色', motifs:['坐佛','壁画颜料','重绘'],
    feature:'坐像左侧的墙面留下斑驳的青绿。照片里的白框只有一小块，虚线把取样位置与左下方的颜料放大图连接起来。',
    story:'研究人员从第120窟的壁画取得一块绿色样品，截面在地仗之上显出浅绿、深绿两道颜料层。靠近看，今天肉眼所见的一片绿色，曾经由两次上色叠成。麦积山石窟艺术研究所另有这座窟顶北周重绘的记录，这块样品本身没有给出两层彩色各自的年代。',
    look:'从坐像左侧的白框找到取样位置，再看截面照片中上下排列的两层绿色。',
    image:paint120.src, alt:paint120.caption, imageNote:'Wang 等，《Crystals》2025，图3a与图3c。',
    credit:{author:paint120.credit,license:paint120.license,licenseUrl:paint120.licenseUrl,source:pigments},
    hotspots:[], source:pigments,sourceName:'Wang 等 · 第120窟壁画颜料图3',
    chapters:[
      {title:'一小块墙皮记录了什么',body:'研究者把坐像旁的一小块绿色颜料放大，再沿截面辨认出上部的深绿色、中间的浅绿色和底部的地仗。两种颜色各自成层，留下先后敷彩的痕迹。'},
      {title:'洞窟也有自己的时间',body:'第120窟的造像、壁面和窟顶有各自的修整经历。窟顶的北周重绘见于研究所的记录，坐像旁的两层绿色则来自另一项实测。它们让我们从不同位置观察一座洞窟的变化。'}],
    sources:[{label:'Wang 等 · 壁画颜料与截面图',url:pigments},{label:'麦积山石窟艺术研究所 · 张铭文中第120窟窟顶重绘记录',url:'https://www.mjssk.cn/ht/desc?id=482'}]
  }
};
