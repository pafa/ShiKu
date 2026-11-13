// Accession numbers identify individual objects. A second opening is another
// view of the same book, never a second manuscript in the exhibition count.
const britishBook='https://commons.wikimedia.org/wiki/File:Lotus_Sutra_Or.8210_S.5458.pdf';
const earlyScroll='https://commons.wikimedia.org/wiki/File:Lotus_Sutra_Or.8210_S.6728.jpg';
const metropolitan='https://www.metmuseum.org/art/collection/search/63182';
const parisPhoto='https://commons.wikimedia.org/wiki/File:Deux_images_xylographiques_de_Guan_yin._-_btv1b8300849t.jpg';
const parisRecord='https://archivesetmanuscrits.bnf.fr/ark:/12148/cc120616n';
const path='assets/collection-edition/scriptures/';
const cc='https://creativecommons.org/licenses/';
function plate(file,caption,credit,source,license,licenseUrl){
  return {src:path+file+'.webp',detailSrc:path+file+'-detail.webp',kind:'document',caption,credit,source,license,licenseUrl};
}
const british='大英图书馆／国际敦煌项目';
const book=(file,caption)=>plate(file,caption,british,britishBook,'CC BY-SA 4.0',cc+'by-sa/4.0/');
const scroll=(file,caption)=>plate(file,caption,british,earlyScroll,'CC BY-SA 4.0',cc+'by-sa/4.0/');
const paris=(file,caption)=>plate(file,caption,'法国国家图书馆手稿部',parisPhoto,'公有领域 · 依原图署名','https://creativecommons.org/publicdomain/mark/1.0/');
export const images={
  'mogao-bl-s5458':[
    book('s5458-p45','《心经》正文 · Or.8210/S.5458 扫描第45页，摊开的两叶'),
    book('s5458-p44','经题交接 · 扫描第44页，左叶见《般若波罗蜜多心经》题名'),
    book('s5458-p14','从观音经到因果经 · 扫描第14页，两种经题之间留有空白'),
    book('s5458-p46','《心经》卷尾 · 扫描第46页，空行之后另起《佛说地藏菩萨经》')],
  'mogao-bl-s6728':[
    scroll('s6728-roller','《正法华经》写卷 · 左端木轴、纸边和相邻的经文，截自馆方全卷图'),
    scroll('s6728-text','Or.8210/S.6728 卷中经文局部 · 墨书字列与纸面界线')],
  'mogao-met-cp5':[plate('cp5-sheet','大慈大悲救苦观世音菩萨图 · 立像下方保留发愿文字的单张印本','大都会艺术博物馆，CP5',metropolitan,'CC0 · The Met Open Access','https://creativecommons.org/publicdomain/zero/1.0/')],
  'mogao-bnf-p3965':[
    paris('p3965-pair','Pelliot chinois 3965 · 两幅并置的木刻观音及残损纸边'),
    paris('p3965-image','右幅印像局部 · 观音立像、莲台和两侧题榜')]
};
export const newWorks=[
  {id:'mogao-bl-s5458',siteId:'mogao',findspotCave:17,homeHall:'chronology',title:'一册里的《心经》与《观音经》',canonicalTitle:'敦煌合订佛经册',aliases:['般若波罗蜜多心经','妙法莲华经观世音菩萨普门品','佛说善恶因果经','佛说地藏菩萨经'],number:'藏经洞写本 · S.5458',era:'敦煌写本 · 此册未据题记定年',accession:'Or.8210/S.5458',holding:'大英图书馆',objectType:'经书写本',form:'manuscript',source:britishBook,sourceName:'大英图书馆／国际敦煌项目 · 经册编目与全文扫描',reason:'合订册无明确抄写纪年，按实物形制列入断代研读馆。',motifs:['折叶缝订','经题交接','心经'],
   feature:'褐纸中间的折缝把两叶连在一起。第45页右叶自上而下可读到“五蕴皆空”，左叶续写“无眼耳鼻舌身意”。',
   look:'翻到第44页先找《心经》的题名，再翻到第46页，沿末行向左看留下的空白。下一段另起经题，几种短经在这里有了可见的边界。',
   story:'写手把《普门品》《善恶因果经》《心经》等抄进同一册。今天仍可看见每半页四列的黑色界格。残破的开头曾经修补，原来的装订线则保留下来并加线补强。'},
  {id:'mogao-bl-s6728',siteId:'mogao',findspotCave:17,homeHall:'chronology',title:'卷尽处的木轴与《正法华经》',number:'藏经洞写本 · S.6728',canonicalTitle:'正法华经写卷',aliases:['竺法护','光世音普门品','正法华方等经'],era:'约五世纪 · 依书风推定',accession:'Or.8210/S.6728',holding:'大英图书馆',objectType:'经书写本',form:'manuscript',source:earlyScroll,sourceName:'大英图书馆／国际敦煌项目 · S.6728 全卷与分品著录',reason:'编目据书风提出约五世纪，展在断代研读馆。',motifs:['法华经','木轴','接纸'],
   feature:'卷末窄窄的木轴仍连着纸，木轴旁的竖行一直写到纸边。把眼光从卷轴移向字列，可以看见淡界线给字行留出的间隔。',
   look:'先在局部照片里找出木轴，再比较它旁边的直行墨字和纸面淡线。原图共有十二张接纸，馆内另列卷中局部供放大读字。',
   story:'此卷保存了竺法护译本第二十二至二十四品的部分经文，卷首已经残失。馆方记录了第四张纸上“光世音普门品”的题名。研究者从书风提出较早的抄写时间，木轴和接纸则是可以在实物上直接检查的线索。'},
  {id:'mogao-met-cp5',siteId:'mogao',homeHall:'five-dynasties',title:'为敦煌路上的旅人印一尊观音',canonicalTitle:'大慈大悲救苦观世音菩萨图',number:'敦煌印本 · CP5',era:'五代 · 947年',accession:'CP5',holding:'大都会艺术博物馆',objectType:'木刻印本',form:'manuscript',source:metropolitan,sourceName:'大都会艺术博物馆 · 雷延美木刻观音图',reason:'馆方据印文将此件系于947年，列入五代曹氏敦煌展线。',motifs:['曹元忠','木版印像','行旅祈愿'],
   feature:'观音立在纸面上半部，两旁各有题榜。下半部的文字比题榜密得多，印像、名号和发愿文占据三个不同的阅读位置。',
   look:'先找观音脚底的莲台，再往下读密集文字。印纸四周的大片留白，也让人看清一整版的大小和图文彼此的位置。',
   story:'曹元忠下令制作这批印像，刻工为雷延美。题文为出入敦煌的行旅祈求平安，也盼息兵弭病。这一张由伯希和经摩根图书馆赠入大都会艺术博物馆，馆藏号为 CP5。'},
  {id:'mogao-bnf-p3965',siteId:'mogao',homeHall:'five-dynasties',title:'两张相邻的救苦观音印像',number:'敦煌印本 · P.3965',canonicalTitle:'大慈大悲救苦观世音菩萨印像二幅',era:'五代 · 曹氏归义军时期',accession:'Pelliot chinois 3965',holding:'法国国家图书馆',objectType:'木刻印本',form:'manuscript',source:parisRecord,sourceName:'法国国家图书馆手稿部 · Pelliot chinois 3965',reason:'两幅印像题榜指名归义军节度使曹元忠。本件下方文字已残，年份须与留有纪年的同类印本对读。',motifs:['曹氏','刻版复印','题榜'],
   feature:'两幅墨印立像几乎一样，纸边的残缺和纸上的污痕却不同。每幅像都立在莲台上，头光和身光之外各有两条狭长的题榜。',
   look:'从左像的莲瓣看向右像的同一处，再比较两幅像下方参差的断边。馆方编目特意注明，此件图下原有的文字因纸张撕裂而缺失。',
   story:'左榜记观音名号，右榜记发愿者曹元忠的官衔。把这两张残纸与五代馆里大都会所藏印张对读，能理解为何相似的图像会保存不同的文字证据。'}];
