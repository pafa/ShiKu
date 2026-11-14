// New works retain their individual recording institutions and image status.
const collectionRoot='assets/experience/east/';
const npm=id=>'https://digitalarchive.npm.gov.tw/Collection/Detail/'+id+'?dep=P';
const institute='https://www.dpm.org.cn/study_detail/100169.html';
const localRubbings='https://ygx.sxu.edu.cn/db/期刊/wenx/wenx2005/0504pdf/050405.pdf';
const music='https://ygx.sxu.edu.cn/db/期刊/20260417/499云冈石窟乐器图像再识.pdf';
const source=(label,url)=>({label,url:new URL(url).href});
const studyRoot='assets/experience/east/';
const W='northern-wei',R='chronology';
export const additions=[];
function work({id,siteId,hallId=W,number,title,era,form,periodNote,motifs,feature,look,story,chapters,sources,...media}){
  additions.push({id,siteId,hallId,number,title,era,form,periodNote,motifs,feature,look,story,
    chapters:chapters.map(([title,body])=>({title,body})),sourceName:sources[0][0],source:new URL(sources[0][1]).href,
    sources:sources.map(([label,url])=>source(label,url)),...media});
}
function study(name,caption,note){
  return {studyPlate:studyRoot+name+'.svg',studyPlateAlt:caption,studyPlateNote:note,hotspots:[]};
}
work({id:'yungang-38',siteId:'yungang',number:'第38窟',title:'亡子、百戏与会奏乐的树',era:'北魏晚期',form:'relief',
  periodNote:'云冈西部的晚期家族供养窟。窟门上的吴氏造窟铭记给出父亲与亡儿的关系。',
  feature:'窟内几组小乐队既出现在缘竿表演的场面里，也出现在表现净土的音乐树旁。',
  look:'从直立的幢竿看向两边的乐师，再寻找佛龛下部题铭两侧向上生长的树枝。',
  story:'吴忠伟为亡子吴天恩开窟。竿上的表演者倒悬或腾转，下面有人奏乐。窟内另有成对的音乐树，让乐器与净土的想象发生联系。相同的乐器进入了含义不同的两种场景。',
  motifs:['吴天恩造窟记','幢倒伎','音乐树'],chapters:[
    ['先找到竿，再找伴奏','百戏图像里的幢是立起的竿。若只盯住竿顶的一个动作，很容易错过旁边分层安排的乐师。把表演者和伴奏者一起读，便能辨出这是一组相互配合的人。'],
    ['父亲为何将乐声留在窟中','父亲的发愿把世俗的娱戏与净土的愿望连起来。东、西壁题铭旁另有音乐树图像，树上可辨人和乐器。它们把窟内的乐声引向亡儿往生的祈愿。']],
  sources:[['赵昆雨、贾争慧 · 云冈石窟乐器图像再识',music],['中国社会科学网 · 云冈百戏图像考察','https://www.cssn.cn/lsx/lsx_kgx/202212/t20221207_5569352.shtml']],
  ...study('study-music-tree','幢竿表演、伴奏与树上乐器的阅读示意','依据云冈研究院乐器图像调查绘制的阅读示意，具体形貌见逐窟研究。')});
work({id:'yungang-shanghai-celestial',siteId:'yungang',hallId:R,number:'第17窟出土 · 上海博物馆藏',title:'回到国内的天人头像',era:'北魏 · 云冈一期',form:'sculpture',
  objectType:'馆藏文物',holding:'上海博物馆',periodNote:'原件出自云冈第17窟。按国内接收及入藏记录陈列于断代研读馆。',
  feature:'在第17窟清理中取得的石雕头部，与一批云冈残件一同经历调查、流转与追索。',
  look:'留意原馆所示圆润的脸廓，再沿时间线对照发现、回国和入藏三个时点。',
  story:'1939至1940年，调查队在清理昙曜五窟时采集了包括这件天人头像在内的造像。它们在抗战结束前被运往京都。1948年这批残件被追索回国，1955年入藏上海博物馆。',
  motifs:['第17窟','天人残首','文物归还'],chapters:[
    ['一件残首的出土地','上海博物馆把这件天人头像明确著录为第十七窟出土。圆润的面部与集中布置的五官可以讨论风格，具体窟号则有调查与馆藏记录作为依据。'],
    ['两次移交之间','1948年的追索和1955年的入藏是两次不同的事件。从最初清理、运离，到回国后由博物馆接收，顺次读这条路径，今日藏地与造像原先所在的位置便都能交代清楚。']],
  sources:[['上海博物馆 · 云冈石窟天人头部','https://www.shanghaimuseum.cn/mu/frontend/pg/article/id/CI00159686'],['师若予 · 上海博物馆藏云冈石窟造像残件整理','https://www.dpm.org.cn/Uploads/File/2020/08/31/u5f4cce2464710.pdf']],
  ...study('study-return','云冈造像调查、归国和入藏时间线','依原馆的发掘与移交记录绘制。通过资料链接可看原件摄影。')});
work({id:'yungang-chuanzuo-tile',siteId:'yungang',number:'第3窟窟前出土 · 文字瓦当',title:'檐口上的「传祚无穷」',era:'北魏',form:'architecture',
  objectType:'馆藏文物',holding:'云冈研究院',periodNote:'大同市考古研究所的平城陶瓦研究将这件窟前出土的文字瓦当归入北魏。',
  feature:'外圈、分格和乳钉把祝愿的话安排在圆形檐头。瓦当与筒瓦相接，将铭文送到屋顶的边缘。',
  look:'依上、下、右、左的次序读四字，再看中央和四角的凸点如何隔开字位。',
  story:'大佛之外，考古发掘还留下了窟前屋檐的部件。第3窟前出土的一件灰陶瓦当带四字阳文，研究记录其直径约15厘米。“祚”在此联系皇位传承，原先仰头就可能望见的祝语也成了建筑身份的线索。',
  motifs:['文字瓦当','乳钉','窟前建筑'],chapters:[
    ['怎样读圆形题字','井字分界把当面分出若干格。中央乳钉及四角小乳钉外又有圆圈，与文字相间。释读要跟随记录的四个字位，不宜套用今天横排的阅读次序。'],
    ['屋面如何留下证据','筒瓦与板瓦负责屋面上的搭接，末端圆形当面既遮护檐口，也把文字朝外展示。结合出土地点观察这些部件，就能看见石窟前木构建筑曾经占据的空间。']],
  sources:[['刘俊喜 · 北魏平城遗址陶瓦的初步研究','https://ygx.sxu.edu.cn/db/期刊/sxdtdxxb-shkxb/sxdt2009/0906pdf/090611.pdf'],['大同大学云冈文化研究中心 · 云冈考古','https://ygwh.sxdtdx.edu.cn/news-show-247.html']],
  ...study('study-tile','文字瓦当的九格、乳钉和四字阅读顺序','按考古报告所记构造和读序绘制，字形以今字释读。')});
work({id:'yungang-west-summit',siteId:'yungang',hallId:R,number:'窟顶西区 · 北魏塔院遗址',title:'从第33窟上方找到寺院',era:'北魏 · 后世叠压',form:'architecture',
  objectType:'建筑遗址',periodNote:'依据分层发掘报告，以山顶北魏佛寺及上覆辽金、明清活动面作断代对照。',
  feature:'窟顶西区遗址内存塔基和数列房址。地层里出土的瓦片、陶器与泥层记录着不同年代的活动。',
  look:'发掘报告的平面图标出了塔基与房址，剖面图记录地层的上下关系。先看两列房址在塔基的哪一侧，再去剖面辨认后来的活动面。',
  story:'在第33窟上方的山顶，考古工作者发现北魏佛教寺院遗址。平面上有塔院的组织，剖面上有先后形成的地层。窟口只给人看见崖面，山顶的房址则补上了礼佛与日常活动的另一部分空间。',
  motifs:['窟顶寺院','塔基','叠压地层'],chapters:[
    ['让平面与山崖相接','站在原崖下观看造像，难以知道山顶也有建筑。调查记录把窟沿、塔基和廊房一起定位，可以沿着山顶与崖面的上下关系重新理解云冈寺院的范围。'],
    ['同一地点怎样判断先后','发掘者记录探方内的土色、瓦片和叠压关系。北魏遗存与辽金活动面或后来的堆积可能紧贴在一起，资料图中一条线的上下，有时就代表了长期使用的时间差。']],
  sources:[['云冈石窟研究院等 · 窟顶西区北魏佛教寺院遗址','https://ygx.sxu.edu.cn/static/xzts/4/云冈石窟窟顶西区北魏佛教寺院遗址_张庆捷.pdf'],['故宫博物院 · 石窟寺考古的空间','https://www.dpm.org.cn/journal/378534.html']],
  ...study('study-court','窟顶塔院与崖壁上下位置关系','据发掘报告绘制的关系示意，平面与剖面分别表达相邻和叠压。')});

function rubbing(key,number,title,feature,look,story,chapters,info){
 const {id,accession,original,peak}=info;
 const url=npm(id),holding='国立故宫博物院（台北）';
 work({id:'longmen-rubbing-'+key,siteId:'longmen',number,title,era:original,form:'inscription',objectType:'馆藏文物',holding,accession,
  periodNote:'原刻属北魏，展品为后世纸本墨拓。馆藏号指向本次展示的拓本。',
  motifs:['古阳洞','造像题记','纸本墨拓'],feature,look,story,chapters,
  sources:[[holding+' · '+number,url],['龙门石窟研究院作者 · 龙门四品杂谈',institute],['国家图书馆王丽燕 · 龙门题记拓本概况',localRubbings]],
  image:collectionRoot+'rubbing-'+key+'.webp',alt:title+'，纸本墨拓',credit:{author:holding,source:url,license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modified:'国立故宫博物院开放影像，按比例缩放并转为 WebP，部分裁去周边色卡。'},
  hotspots:[{x:peak[0],y:peak[1],title:peak[2],body:peak[3],source:url}]
 });
}
rubbing('shiping','始平公造像记 · 旧拓第一叶','为何白地上留下黑字','题记原石以阳文刻成，字在石面凸起。拓纸上字迹受墨，黑与白的关系与常见阴刻拓片不同。','先读界格中的黑色笔画，再和隔壁孙秋生拓本的白字相对照。','比丘慧成为亡父始平公造像。孟达撰文、朱义章书写，太和二十二年（498）告成。拓本保留捶拓时原石的状态，界格和凸起字口也被一同移到了纸上。',[
 ['题记中能知道谁做了什么','发愿者、写字者与撰文者在这一件原刻中各有姓名。把刻石日期与后来的纸本拓制分开，再读册页上的题额和正文，就能分清立愿、写字、刻石与捶拓几个环节。'],
 ['阳文为何留下墨线','工匠把笔画周围的石地剔低，让字口和界格作为凸面留下。拓纸贴合凹凸，墨包轻拍时主要接触高处，最后纸上便显出墨色字画与浅色背景。']],
 {id:36755,accession:'贈拓000450N000000001',original:'北魏太和二十二年原刻 · 后世拓本',peak:[.52,.49,'墨落在凸面','请看正文中清晰的黑色笔画和它们之间的浅色纸地。']});
rubbing('sun','孙秋生造像记 · 旧拓第二叶','二百人如何共造一像','发愿人将共同造像的行动记在石上。字列密布，顶部题额把整篇铭记从邻近的龛像中标出。','沿最右列向下读，再看题额和其下各列怎样共用狭长的石面。','孙秋生、刘起祖等二百人参与造像。国立故宫博物院将本叶著录为萧显庆书。与具署名的《始平公》并观，古阳洞内有家属追荐，也有多人合力成就的造像。',[
 ['从姓名读到群体','造像铭中的邑主及参加者让群像背后的社群有了名字。由个人发愿转到共同营造，一方文字承担了记功、祈愿与保存共同记忆的作用。'],
 ['从洞壁转成册页','原刻与龛像在同一空间，拓本却可以装成册页来阅读。馆藏著录将这一叶与同册的其他原刻分开编号，阅览时既能比较不同书风，也能返回具体的来源。']],
 {id:36756,accession:'贈拓000450N000000002',original:'北魏原刻 · 后世拓本',peak:[.54,.12,'题额与正文','题额所在处的宽度和下方密排字列不同，向下接读就能看清两个部分。']});
rubbing('yang','杨大眼造像记 · 墨拓立轴','一位将领为何在龙门发愿','题记叙说杨大眼经过石窟、为孝文皇帝造像的缘由。长篇官职与造像愿文同在一方原石。','从题额往下看正文的竖行，再看边缘留出的装裱空白与后人题记。','杨大眼的原刻位于古阳洞。国立故宫博物院所藏本装成一轴，本幅约94.1厘米高、40.8厘米宽。原石上的缺字也留在纸上，馆方释文用空格和补释保留这些差异。',[
 ['读到军旅与营造相遇的地方','这篇造像记既写到将军的身份与经历，也记下军队途经石窟后的礼拜发愿。将碑文中的自述与作品旁的佛像并读，比单独看笔画多出了一条历史线索。'],
 ['装裱也进入了观看史','题签、藏印和装裱上的题记记录后来的收藏与鉴定。辨认碑文时应先找到墨拓本幅，再看原刻之外另添的字，区分北魏铭刻和后来的阅读痕迹。']],
 {id:19493,accession:'贈拓000357N000000000',original:'北魏原刻 · 后世墨拓',peak:[.52,.64,'墨拓正文','成列的浅色字画保存在墨地中，四周装裱记录的是纸本后来的流传。']});
rubbing('ma','马振拜造像记 · 旧拓第十九叶','一份刻进石头的参加者名单','马振拜和张子成等共同造像。题记上写明造像日期，接着留下参与者姓名，使一件作品有了一群可以辨认的人。','从顶部题额向正文寻找日期，把连续排列的人名与旁边的集体愿文联系起来。','原刻记北魏景明四年（503）八月五日，邑主马振拜等三十四人为皇帝造像。国立故宫博物院收录的旧拓上保留墨地、纸纹和收藏印章，也把多人共同发愿的名字留在册里。',[
 ['先定一个日子','这方题记把营造连到一个具体年月日。把原刻的景明四年同册页的入藏编号区别开来，就能读出“何时发愿”与“今天查看的是哪件拓本”两种信息。'],
 ['一列列名字留下什么','题记不止写领头人物。翻阅释文，会读到维那、邑主及多位参加者的名字。个人姓名从石面转到纸面，为研究这片崖壁上的集体供养留下了线索。']],
 {id:36757,accession:'贈拓000450N000000019',original:'北魏景明四年原刻 · 后世拓本',peak:[.50,.60,'原刻姓名列','对读原馆释文，可以辨认发愿人和多位参与者留下的名字。']});

const colbase='https://colbase.nich.go.jp/collection_items/tnm/TB-670?locale=ja';
work({id:'longmen-rubbing-wei',siteId:'longmen',number:'魏灵藏造像记 · TB-670',title:'拓本留下的石上缺文',era:'北魏原刻 · 后世纸本拓片',form:'inscription',
 objectType:'馆藏文物',holding:'东京国立博物馆',accession:'TB-670',periodNote:'北魏刻造于古阳洞，展出的墨拓为今泉雄作捐赠东京国立博物馆的藏品。',
 feature:'魏灵藏与薛法绍为释迦造像并发愿。原刻的下部后来遭到破坏，早期捶拓使部分文字得以在纸上流传。',
 look:'先找竖列的白字，再顺着笔画边缘确定文字怎样从石面印到纸上。',
 story:'古阳洞北壁这篇铭记将魏灵藏、薛法绍的名字和祈愿刻在一处。东京国立博物馆的说明记录，约1921年原石下部大半遭毁。今天的拓本因此也保存着原刻曾经具有的形貌。',
 motifs:['古阳洞','龙门四品','拓本流传'],chapters:[
 ['从发愿者读到愿望','造像记讲的是魏灵藏与薛法绍等人造释迦像。读碑时可以先辨出姓名，再读希望国家安泰的愿文，文字把石窟造像与供养者的愿望直接连在一起。'],
 ['石与纸分别保存了什么','石面后来受损后，以前取得的墨拓可以提供新的比对依据。阅读不同拓片时，还须留意捶拓、装裱和图像裁切的差别，纸上的一处浅痕并不总能直接判断石面原状。']],
 sources:[['东京国立博物馆 ColBase · 魏灵藏造像记 TB-670',colbase],['中央研究院历史文物陈列馆 · 魏灵藏薛法绍造释迦像记','https://museum.sinica.edu.tw/collection/5/item/137/'],['龙门研究院作者 · 龙门四品杂谈',institute]],
 image:collectionRoot+'rubbing-wei.webp',alt:'魏灵藏造像记黑地白字纸本墨拓，东京国立博物馆藏',
 credit:{author:'东京国立博物馆 · ColBase 国立文化财机构藏品综合检索系统',source:colbase,license:'ColBase 利用条款（兼容 CC BY 4.0）',licenseUrl:'https://colbase.nich.go.jp/pages/term',modified:'缩放并转为 WebP。原件号 TB-670。'},
 hotspots:[{x:.50,y:.54,title:'竖列中的文字',body:'墨包打在纸所覆盖的石面上，阴刻笔画处留下浅色，从而在同一幅上保留字形和石面纹路。',source:colbase}]});
const oldPhoto='https://commons.wikimedia.org/wiki/File:Yungang_Grottoes_1907.jpg';
work({id:'yungang-1907-photograph',siteId:'yungang',hallId:R,number:'1907年 · 第20窟旧影',title:'沙畹镜头中的露天大佛',era:'1907年摄影 · 北魏造像',form:'relief',
 objectType:'历史照片',periodNote:'照片由沙畹在1907年调查时摄得。画面记录的是当时的保存状态。',
 feature:'近代调查照片把大佛、身后的光背、东侧立佛和脚下碎石纳入同一幅黑白画面。',
 look:'利用肩上翻卷的袈裟和右侧立佛定位，再对照旧照画幅边缘与今天的参观视角。',
 story:'沙畹1907年在云冈进行摄影调查。这幅旧照中，大像和右侧立佛同框，崖前的乱石遮住部分下沿。将它与本馆云冈第20窟的局部实景扫描放在一起，能够对准同一尊造像的衣褶、背光和岩体轮廓。',
 motifs:['沙畹','历史照片','同址比对'],chapters:[
 ['从摄影的边界开始读','照片只记录相机前的一块视野。先在旧照和现场模型中分别找出主佛的肩线、光背和胁侍，才能判断两个视角包含了哪些共同部分。近景碎石也会改变人对台座高度的印象。'],
 ['调查资料怎样保存下来','沙畹的调查把云冈系列照片编入考察图版。黑白影像可帮助比对二十世纪初的崖面，但一个浅色区域既可能是石质差异，也可能来自光照，须与其他观察相互印证。']],
 sources:[['公版原片 · 云冈第20窟，1907年',oldPhoto],['法国国家艺术史研究所 · 沙畹调查与摄影档案','https://agorha.inha.fr/detail/750']],
 image:collectionRoot+'yungang-1907.webp',alt:'沙畹1907年拍摄的云冈第20窟，左为主佛，右侧立佛前可见碎石',
 credit:{author:'Édouard Chavannes（沙畹）',source:oldPhoto,license:'Public domain',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',modified:'保持旧照画幅并转为 WebP。'},
 hotspots:[{x:.41,y:.52,title:'用翻卷的衣缘定位',body:'主佛肩胸之间的翻折及斜向衣褶，在现存造像中仍能辨出，是两个视角之间清晰的对照点。',source:oldPhoto},{x:.79,y:.47,title:'同框的东侧立佛',body:'不要只比较主体大佛；旁边较小的立像与主佛之间的距离，有助于找到当年镜头大致瞄准的方向。',source:oldPhoto}]});
