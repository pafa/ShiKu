const object='https://idp.bl.uk/collection/51FDAEAFB4A24E2E9981692A98130BC8/';
const findspot='https://idp.bl.uk/discover/learning/dunhuang/dunhuang-articles/cave-17-the-library-cave/what-was-stored-in-cave-17/';
const imagePage='https://commons.wikimedia.org/wiki/File:Diamond_sutra.jpg';
export const print={
  id:'mogao-bl-or8210-p2',siteId:'mogao',number:'第17窟出土 · Or.8210/P.2',title:'王玠为双亲印的一卷经',canonicalTitle:'金刚般若波罗蜜经（金刚经）',aliases:['金刚经','金剛經','王玠','咸通九年','Diamond Sutra'],
  era:'唐 · 咸通九年（868）',hallId:'tang',periodNote:'唐咸通九年题记说明此件印本的制作年代。它后来被保存在莫高窟第17窟，现藏大英图书馆。',
  objectType:'馆藏文物',accession:'Or.8210/P.2',holding:'大英图书馆',form:'mural',motifs:['雕版印刷','卷首画','发愿题记'],
  feature:'卷首画中，说法的佛陀坐在正中，听众围聚四周。图像与全卷经文都印在纸上。',
  look:'先找中央佛陀的圆形头光，再沿人物间的空白移到左下方跪坐的人。把图放大，比较木版印出的衣纹、云头和人物轮廓。',
  story:'卷末留下王玠为父母造经、供人施用的题记，明确记到咸通九年四月十五日。制作者把印好的纸张接成长卷，开卷先见说法图，再读经文。一件可以卷起、赠送和收藏的印本，最终与大量写本一同留在藏经洞中。',
  image:'assets/collection/documents/diamond-sutra-868.webp',alt:'唐代《金刚经》印本卷首说法图，画面中央为坐佛，左右有听众',
  imageNote:'卷首局部 · 国际敦煌项目提供的数字图版',credit:{author:'大英图书馆／国际敦煌项目',license:'公有领域',source:imagePage,licenseUrl:imagePage+'#Licensing'},
  hotspots:[
    {x:.51,y:.43,title:'说法图的中心',body:'圆形头光把中央端坐的佛陀从四周的人物中凸显出来。连续的细线向下延伸为衣褶，都是墨印在纸上的痕迹。',source:object},
    {x:.21,y:.74,title:'前景的听众',body:'左下方跪坐的人物面向中央坐佛。看组成前后层次的衣纹与空白，再回到整幅画辨认听众的队列。',source:object}
  ],
  chapters:[
    {title:'读一卷经要先展开什么',body:'今天可以一次看到缩小的整幅图。拿着纸卷时，图与文却要依着展开的方向先后出现。馆内图版只呈现卷首，原卷还把经文印在一张张接合的纸上，形成一段长达数米的连续阅读。'},
    {title:'谁让这卷纸有了日期',body:'卷末的题记把造经的人、发愿的对象和具体日期连在一起。王玠希望为双亲造经并广为施送，读者因此既能为这一印本断代，也能看见一个家庭为什么要请人印制经卷。'}
  ],sourceName:'国际敦煌项目 · 大英图书馆 Or.8210/P.2',source:object,
  sources:[{label:'国际敦煌项目 · 印本登记、来源与图版',url:object},{label:'国际敦煌项目 · 第17窟藏品与印刷',url:findspot}]
};
export const manuscriptTables = {
  tang: {
    id:'FRBNFEAD000118625', shelf:'P. 2001', title:'一卷僧院见闻，行间还有红笔',
    note:'这份《南海寄归内法传》抄本保留序和卷一。把卷首放大，正文的细字之间，有人用红墨补上了漏抄的字，往后又改用黑墨。',
    detail:'义净在印度和南海诸地观察僧人如何生活，再把当地做法写下来。这份流传到敦煌的抄本长5.08米，十五张纸接成一卷。书手把小注写成单行或双行，比正文还细。对照原卷，行间的补字和原有修补都是这件手稿自身的痕迹。',
    label:'《南海寄归内法传》序及卷一', formLabel:'僧院见闻', physicalLabel:'十五纸接卷 · 长 508 厘米'
  },
  'five-dynasties': {
    id:'FRBNFEAD000119484', shelf:'P. 2846', title:'讲经之后，谁来算账？',
    note:'甲寅年正月二十一日，都僧政愿清等人呈上一份报告。小麦、黍、麻、豆、布帛、铜和铁都记在账内，写的是讲经所收施物的用途。',
    detail:'馆方把这个甲寅年定为954年。残存的报告开头共二十行，字写得快，夹着行草和记账用的大写数字。原纸留着增写、涂改和订正，右下角已撕裂。沿一行读到改字，再看物品的单位，可以想象核算这样一笔实物账有多费功夫。',
    label:'寺院账记', formLabel:'寺院账记', physicalLabel:'单纸二十行 · 甲寅年正月'
  },
  song: {
    id:'FRBNFEAD000120795', shelf:'P. 4525（12）', partShelf:'Pelliot chinois 4525 (12)', title:'一份留着签名空栏的收养契约',
    note:'宋太平兴国八年三月（983年），僧正崇会收养一名女孩。曾抚育她的康愿昌和阿安也被记在契约里。这份文书位于第十二件的正面。',
    detail:'纸上共十六行，其中五行留给署名。往下读，女孩和养育她的人列在当事者处，见证人的位置也已留好，却没有写下姓名或签押。馆方对康愿昌与阿安是否为夫妻保留疑问。文字的空白和已经写下的称呼一样值得看。',
    label:'收养契约 · 第十二件正面', formLabel:'收养契约', physicalLabel:'第十二件正面 · 十六行'
  },
  chronology: {
    id:'FRBNFEAD000118928', shelf:'P. 2304', title:'一卷写了两面，经注还打过补丁',
    note:'这件卷子长逾十米，正面与背面各写一部注释。背面第五纸粘着一张补纸，书手在上面重抄、补正了正文中的一段。',
    detail:'正面现存《大乘百法明门论》注释的末段，共七百一十三行。翻到背面，开元寺律师大弁在起首题记中写下年号，但字有残缺。法国国家图书馆倾向释作广顺三年（953），同时列出较不确定的大顺三年（892）读法。这个疑问来自一处具体题记。',
    label:'经注卷 · 正背面', formLabel:'双面经注', physicalLabel:'二十四纸接卷 · 长约十米'
  }
};
