// Public records and independently licensed reproductions for individual works.
const root='assets/experience/mogao/';
const academy=n=>'https://www.dha.ac.cn/info/1425/'+n+'.htm';
const sui=academy(3569),nirvana=academy(3663);
const harvard='https://harvardartmuseums.org/collections/object/303672';
const scan='https://sketchfab.com/3d-models/kneeling-attendant-bodhisattva-129635ad396947a7975c9e5ba6095f32';
const idpStars='https://idp.bl.uk/collection/7861395E5F814419BA05483EAB254832/';
const idpBanner='https://idp.bl.uk/collection/62C60FF38E824CC5A8AB03824F5C4759/';
const paper='https://drpress.org/ojs/index.php/hiaad/article/view/30663';
const cc=kind=>'https://creativecommons.org/licenses/'+kind+'/';
const commons=name=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(name.replaceAll(' ','_'));
const source=(label,url)=>({label,url});
const chapter=(title,body)=>({title,body});
const pin=(x,y,title,body,source)=>({x,y,title,body,source});
const credit=(author,license,licenseUrl,source,modified='保留原比例，缩放并转为 WebP。')=>({author,license,licenseUrl,source,modified});
export const additions=[
  {
    id:'mogao-407',number:'第407窟',era:'隋',hallId:'sui',form:'mural',
    title:'莲心里共用三只耳的兔子',aliases:['三兔共耳','三兔莲花藻井','三兔飞天'],
    motifs:['共耳三兔','八瓣莲花','四披千佛'],feature:'三只兔子、共享耳廓、环形莲瓣',
    look:'先辨出三颗头，再顺着当中三道长耳寻找每只兔子借用了邻兔的哪一耳。',
    story:'隋代画师在方井里画出四层八瓣莲花，三只奔兔围着绿色莲心追逐；莲外的飞天沿同一方向飞翔。',
    periodNote:'研究院将第407窟列为隋窟。南北壁下部的宋代供养人和西龛清代重修另行辨读。',
    image:root+'407-hare.webp',alt:'第407窟莲花井心的原壁画局部，绿底上三只兔子围着三只共用的耳朵',imageNote:'原壁画局部 · 研究论文图2',
    credit:credit('Jiarui Han，2025，图2','CC BY 4.0',cc('by/4.0'),paper),
    hotspots:[pin(.496,.467,'耳朵在哪里相接','上方两只兔子的耳廓与下方兔头围成一个小三角。从每一颗头开始数，都可以认出两只长耳。',sui)],
    chapters:[chapter('每只都有两只耳朵','画师把三只兔子的头部围在莲心内，身体向圈外伸展。沿任意一只的两耳追过去，靠边的一耳也构成相邻那只的耳朵，全图因此只需画三只耳。'),
      chapter('在三兔外面接着转一圈','原壁画的莲心周围还有四层八瓣莲花，莲花外画八位飞天。看过小小的耳廓，再去窟内顺着花瓣、飞天飘带和四披下的幔脚逐层抬望。')],
    source:sui,sourceName:'敦煌研究院 · 第407窟',sources:[source('敦煌研究院 · 第407窟与原位图像',sui),source('原壁图版 · 图2与出版许可',paper)]
  },
  {
    id:'mogao-158',number:'第158窟',era:'中唐 · 吐蕃统治敦煌时期',hallId:'tang',form:'sculpture',
    title:'涅槃佛身后，谁在举哀',aliases:['卧佛','涅槃像','十五米六涅槃像'],
    motifs:['涅槃卧佛','举哀弟子','盝顶长窟'],feature:'长方形窟室、卧佛半闭的双眼、举哀壁画',
    look:'从枕旁的眼睑看向身后，再由卧姿的水平线看壁画中直立的人群。',
    story:'长窟西壁通长设坛。15.6米的石胎泥塑卧佛静静侧卧，背后弟子和菩萨的举哀场面让这份静穆更显突出。',
    periodNote:'甬道供养人题记含“大蕃管内”，与中唐吐蕃统治敦煌时期的营建相互印证。',
    image:root+'158-nirvana.webp',alt:'中国美术馆陈列的第158窟涅槃像复制展景，卧佛的面颊贴近叠枕',imageNote:'中国美术馆复制陈列摄影',
    credit:credit('gongfu_king','CC BY-SA 2.0',cc('by-sa/2.0'),commons('BeijingNationalArtMuseumofChina7.jpg')),
    hotspots:[pin(.646,.51,'半闭的双目','顺着上眼睑的长线向外看。卧佛面容安宁，与其背后弟子们表情、动作的变化相对照。此图拍摄的是复制陈列。',nirvana)],
    chapters:[chapter('为什么房间沿横向展开','第158窟横长约17.2米，进深约7.28米。西壁的长坛容得下横卧的造像。读这一窟，可以把观看方式从面对正中佛龛，换成沿一整段佛身横向移动。'),
      chapter('卧佛与身后的两排人','窟志著录卧佛背后的举哀队列，上排十九身菩萨，下排十七身罗汉。卧佛半闭双目，画上的人物却有不同的反应；两种媒介合起来讲述同一场涅槃。')],
    source:nirvana,sourceName:'敦煌研究院 · 第158窟',sources:[source('敦煌研究院 · 窟室尺度、涅槃与举哀图',nirvana),source('中国美术馆复制展景摄影',commons('BeijingNationalArtMuseumofChina7.jpg'))]
  },
  {
    id:'mogao-328-kneeling',number:'第328窟 · 1924.70',objectType:'馆藏文物',accession:'1924.70',holding:'哈佛艺术博物馆',canonicalTitle:'跪姿供养菩萨',era:'唐 · 7世纪晚期',hallId:'tang',form:'sculpture',
    title:'莲座上半跪的供养菩萨',aliases:['Kneeling Attendant Bodhisattva','第328窟','供养菩萨'],
    motifs:['胡跪姿','莲座','木骨泥塑'],feature:'一腿跪坐、双手合掌、莲花台座',
    look:'看一膝如何触在莲座上，另一膝向上立起，再沿双臂看手掌会合的位置。',
    story:'这尊木骨泥塑菩萨原在第328窟，1924年被华尔纳所率考察队运离敦煌。原窟与远在哈佛的泥塑，今天要对照两处馆藏记录来理解。',
    periodNote:'哈佛馆藏定为7世纪晚期。馆方的实物记录区分了塑像、莲座和二者组合后的尺寸。',
    image:root+'328-kneeling.webp',alt:'哈佛艺术博物馆藏第328窟供养菩萨，双掌合拢，一膝屈起跪在莲座上',imageNote:'现藏地实物摄影',
    credit:credit('Patrick20242023','CC BY-SA 4.0',cc('by-sa/4.0'),commons('Harvard Art Museums Tang Dynasty Kneeling Attendant Bodhisattva 哈佛美术馆 莫高窟唐代供养菩萨像.jpg')),
    hotspots:[pin(.61,.59,'屈起的一膝','一膝立起、一膝下沉，身体的重量分落在莲座两侧。侧转观察时，能看到柔软衣褶怎样顺着腿的屈伸积叠。',harvard)],
    chapters:[chapter('从正面移到侧面','双掌合拢使上半身显得安定，下半身的跪姿却明显不对称。馆方把整件高度记为121.9厘米，其中包含莲座。顺着膝部投下的阴影，可以理解体量如何从莲座中挺立。'),
      chapter('一件造像，两处记录','敦煌研究院介绍第328窟原有的龛外供养菩萨及其中一身离开原址的经过。哈佛艺术博物馆以1924.70登记此像，另公开了摄影测量模型，可转至背侧观察泥塑的轮廓。')],
    source:harvard,sourceName:'哈佛艺术博物馆 · 1924.70',sources:[source('哈佛艺术博物馆 · 实物档案',harvard),source('敦煌研究院 · 第328窟',academy(3571)),source('哈佛艺术博物馆 · 可旋转的原件摄影测量',scan)]
  },
  {
    id:'mogao-bl-star-atlas',number:'第17窟 · Or.8210/S.3326',objectType:'馆藏文物',accession:'Or.8210/S.3326',holding:'大英图书馆',canonicalTitle:'敦煌星图',era:'唐',hallId:'tang',form:'mural',
    title:'把夜空画进一卷纸',aliases:['敦煌星图','敦煌星图甲本','全天星图','北极星图'],
    motifs:['北天极','十二分图','纸本星图'],feature:'极区星图、连线与旁注、分区天图',
    look:'普通星图向横向展开，到靠近北天极的区域却换成圆形视野。看星点之间如何用短线连成星官。',
    story:'藏经洞保存的星图先画十二幅分区天图，再以一幅北极区图收拢北方天空。卷前还记录了对云气形态的占候。',
    periodNote:'国际敦煌项目著录年代为649至684年，其描述亦提及稍晚断代。这里从宽归入唐代。',
    image:root+'sky-north.webp',alt:'大英图书馆藏敦煌星图的北极区图幅，纸面墨点和短线组成星官',imageNote:'大英图书馆 · 北极区原卷图版',
    credit:credit('British Library','CC0', 'https://creativecommons.org/publicdomain/zero/1.0/',commons('Dunhuang Star Chart BLX273 OR8210S3326R2 8.jpg')),
    hotspots:[pin(.48,.39,'由点连成星官','最小单位是纸面上的星点。笔画把若干点牵在一起，旁边的字标明名字。靠近卷上的一小群星比直接数全图容易。',idpStars)],
    chapters:[chapter('为什么最后一幅是圆图','把可见的天空分成十二段，适于依次展卷；靠近北天极时，纸卷另用一张圆图处理环极区域。比较两种画法，便能明白同一卷纸为何出现两种截然不同的构图。'),
      chapter('纸卷从看云转入观星','星图只占整卷的一部分，此前还有对云气的占候记录。馆方对星点总数的研究辨认出一千三百余颗星，局部图版则可帮助近看星点、连线和旁边的题字。')],
    source:idpStars,sourceName:'国际敦煌项目 · 大英图书馆',sources:[source('国际敦煌项目 · 手卷与馆藏编号',idpStars),source('Bonnet-Bidaud 等 · 敦煌星图的投影与断代','https://arxiv.org/abs/0906.3034')]
  },
  {
    id:'mogao-bm-guide',number:'第17窟 · 1919,0101,0.47',objectType:'馆藏文物',accession:'1919,0101,0.47',holding:'大英博物馆',canonicalTitle:'引路菩萨图',era:'晚唐 · 9世纪后半',hallId:'tang',form:'mural',
    title:'一幡引向云端的楼阁',aliases:['引路菩萨图','引路菩','引魂菩萨','Guiding Bodhisattva'],
    motifs:['引路菩萨','云端楼阁','绢本设色'],feature:'引路菩萨、随行女性、左上楼阁',
    look:'先看菩萨身后着红衣的小人，再顺着两人足下的云看向左上方的楼阁。',
    story:'菩萨持香炉与幡，回身引领一位女性。画师把目的地画成左上云端的一座楼阁，两人的大小和朝向都在交代这段路。',
    periodNote:'国际敦煌项目将这件有文字榜题的绢画断为850至899年。馆藏号尾数为47。',
    image:root+'guide.webp',alt:'引路菩萨与随行红衣女子同在云上，左上方绘楼阁，右上榜框留有题字',imageNote:'绢画画心图版 · 榜题可辨',
    credit:credit('晚唐画工，姓名未详','Public domain','https://creativecommons.org/publicdomain/mark/1.0/',commons('Tang-4.jpg')),
    hotspots:[pin(.76,.65,'红衣的随行人','身量显著小于前方菩萨的女性站在云上，方向与菩萨一致。画面用人物的大小、回顾的神情和左上方的目的地把两人连接起来。',idpBanner)],
    chapters:[chapter('一个榜框留下的名字','画幅右上角的榜框还留有“引路菩”字样，为理解人物身份提供了实物线索。与人物的动作及所持幡相对照，可以读出这幅绢画以引领为主题。'),
      chapter('绢画与窟壁的观看距离','本幅约高80.5厘米，宽53.8厘米，可以悬挂。画师把净土压缩成左上角的楼阁，并将红衣女子画得远小于前方菩萨。展卷或悬起时，这些线索帮助人一次读清人物和归宿。')],
    source:idpBanner,sourceName:'国际敦煌项目 · 大英博物馆',sources:[source('国际敦煌项目 · 绢画与题记',idpBanner),source('大英博物馆 · 1919,0101,0.47','https://www.britishmuseum.org/collection/object/A_1919-0101-0-47')]
  }
].map(work=>({...work,siteId:'mogao',mediaPage:work.source,mediaPageName:work.sourceName}));
