import { plates } from './plates.js';

const longmen = { label: '龙门石窟研究院 · 关于龙门石窟', url: 'https://www.lmsk.cn/Gywm_id_5.html' };
const pharmacy = { label: '国家图书馆 · 林世田《佛教石窟艺术与中医文化的合璧》', url: 'https://www.nlc.cn/pcab/xctg/bd/20190121_175422.shtml' };
const met = { label: '大都会艺术博物馆 · 22.134 交脚菩萨', url: 'https://www.metmuseum.org/art/collection/search/42711' };

export const evidence = {
  'yungang-chuanzuo-tile': [plates.tile],
  'longmen-kanjing-timber': [plates['kanjing-gate']],
  'yungang-met-crossed-ankles': [plates['crossed-front'], plates['crossed-side']],
  'longmen-140-guardian': [plates['binyang-guardian'], plates['binyang-palm']],
  'longmen-1280-kasyapa': [plates.kasyapa],
  'longmen-1387-door-guardians': [plates['pharmacy-north'], plates['pharmacy-south']],
  'longmen-yique-inscription': [plates['gaz-yique'], plates['gaz-title'], plates['yi-river']],
  'longmen-crowned-buddha-florence': [plates['crowned-buddha']],
  'longmen-2194': [plates['kanjing-pair']],
};

const works = [
  {
    id: 'yungang-met-crossed-ankles', siteId: 'yungang', hallId: 'chronology', number: '大都会艺术博物馆 · 22.134',
    title: '用交脚坐姿追索一尊菩萨', era: '北魏 · 约470至480年', form: 'sculpture',
    objectType: '馆藏文物', holding: '大都会艺术博物馆（纽约）', accession: '22.134',
    periodNote: '博物馆将这尊砂岩造像定为约470至480年，旧卡片提出云冈第25窟的可能，确切原址仍有待证实。',
    feature: '正面能看见两腿交在脚踝处，右手抬起。换到侧面，膝与脚从坐具前方向外伸出的距离一下就清楚了。',
    look: '在两张照片间比较双脚、右手和头冠，再看看石面残存的颜色。',
    story: '一座已有确切窟号的洞窟，可以帮助研究者理解失去原址的造像。大都会艺术博物馆把这件高146.1厘米的砂岩菩萨与云冈第5窟等处的交脚弥勒相较，注意到交踝而坐、头戴冠、右手上举这组特征。造像的题材目前释为弥勒的可能性较大，原来安放在何处仍在研究中。',
    motifs: ['交脚坐姿', '砂岩残彩', '原址考证'], reference: met,
    hotspot: [.49, .79, '相交的脚踝', '正面照片中，两条小腿在这一带交叉。斜侧面照片则显示出脚踝到坐具前缘的深度。'],
  },
  {
    id: 'longmen-140-guardian', siteId: 'longmen', hallId: 'northern-wei', number: '第140窟 · 宾阳中洞门侧',
    title: '举起手掌的守门力士', era: '北魏 · 6世纪初', form: 'relief', objectType: '洞窟浮雕',
    periodNote: '宾阳中洞属北魏龙门皇家开窟工程；照片由摄影者在现场按中洞门侧力士标录。',
    feature: '守门人侧过脸，举掌到胸前。手臂与身体之间落着一道深影，身后的许多小龛却只浅浅嵌进石壁。',
    look: '看全身时先找胸前手掌，再移到指尖特写，观察手指与背景石面的距离。',
    story: '走向宾阳中洞，先在窟门遇到守护者。双脚分立，让人感到他站得稳；上臂紧贴身体，前臂却折向胸前，把举掌的动作移到眼前。全身照和手掌近照给出了站在窟门前的两种观看距离。',
    motifs: ['门侧力士', '举掌', '北魏宾阳中洞'], reference: longmen,
    hotspot: [.41, .35, '胸前这一掌', '顺着屈起的前臂向上，掌面在胸口前方突出。手与胸之间的暗部让两者分得很开。'],
  },
  {
    id: 'longmen-1280-kasyapa', siteId: 'longmen', hallId: 'tang', number: '第1280龛 · 奉先寺迦叶立像',
    title: '大佛身边迦叶的僧衣', era: '唐 · 高宗时期', form: 'sculpture', objectType: '摩崖造像',
    periodNote: '奉先寺大像龛营建于唐高宗时期。研究院列举的两位佛弟子为迦叶与阿难。',
    feature: '头像下方与衣面残损较重，腰部往下仍有几道很深的斜纹，弯向同一侧。',
    look: '先从肩头沿外轮廓找到腰侧，再顺一道斜纹看到下摆。旁边浅浅凿出的小像有助于判断迦叶的身量。',
    story: '奉先寺两位弟子与卢舍那大佛相伴。阿难的双唇和眼睑仍很清楚，来到迦叶身旁，可辨的线索更多集中在衣服上。胸腹失去的部分暴露出岩层，保留下来的袈裟下缘仍给人垂坠的感觉。两位弟子今天不同的面貌，也记录着同一面山崖上不均匀的风化。',
    motifs: ['佛弟子', '迦叶', '袈裟'], reference: longmen,
    hotspot: [.49, .61, '腰下的衣纹', '褶线一道压着一道，向右上方收拢。胸部残损处与这里的曲面相邻。'],
  },
  {
    id: 'longmen-1387-door-guardians', siteId: 'longmen', hallId: 'chronology', number: '第1387窟 · 药方洞入口',
    title: '隔门相望的两身力士', era: '北朝至唐 · 药方洞分期', form: 'relief', objectType: '门侧造像',
    periodNote: '药方洞有北魏永安三年（530）题记，雕刻活动延续至唐。门侧两像的具体刻年未见所引资料明载。',
    feature: '北侧力士一肘高举，另一条前臂横过腰前。转看南侧，两个肩部以下的手臂有了完全不同的走向。',
    look: '两张现场照各拍一侧。第一张的洞门在左，第二张的洞门在右，借门边辨认相向而立的位置。',
    story: '药方洞的参观常从阅读石刻药方开始。后退到门外，守门的两身造像便进入视线。北侧力士身旁的小龛沿岩壁层叠，南侧像与脚下山石接连。国家图书馆整理的题记显示，窟内外从北朝到唐曾多次施工，因此门前相距几步的石刻也要逐一判断年代。',
    motifs: ['药方洞', '门侧护法', '分期研读'], reference: pharmacy,
    hotspot: [.54, .43, '北侧力士的双臂', '一侧肘部高高抬起，另一条手臂斜向腹前。可以借这两个方向辨认已经风化的上身。'],
  },
  {
    id: 'longmen-yique-inscription', siteId: 'longmen', hallId: 'song', number: '宋真宗《伊阙铭》 · 《洛阳龙门志》收录',
    title: '宋人怎样写下龙门的山口', era: '北宋撰文 · 清光绪十三年辑刊', form: 'inscription',
    objectType: '传世铭文', periodNote: '宋代馆按铭文的写作时代陈列。所展为清人辑本的数字书页，书名页可核光绪丁亥的刊刻时间。',
    feature: '在书页版心右边找到「宋真宗伊阙铭」。往下一列读，山峰之间的河谷、向北流过山口的伊水和崖壁上的佛像依次出现。',
    look: '先读铭文中的「高岸中分」，再对照第三张伊河西岸现状照片，看看山坡在河道边怎样收低。',
    story: '宋人称龙门为伊阙，伊河从两山之间穿过，看去像一道天然的门。宋真宗的铭文先写山谷、水道和洛阳王城，继而写山泉、佛塔与崖上的大像。我们今天能读到的一份文本，保存在清人路朝霖辑的《洛阳龙门志》里。翻到书名页，上面的开雕时间与铭文的写作时代相隔八百多年。',
    motifs: ['宋真宗', '伊阙铭', '伊河', '清代辑本'],
    reference: {label: '中国国家图书馆藏 · 路朝霖辑《洛阳龙门志》数字本第8页', url: plates['gaz-yique'].source},
    hotspot: [.55, .31, '在版心旁找篇名', '紧挨版心的这一列，从上至下是「宋真宗伊阙铭」。铭文从这里接着往下排。'],
  },
  {
    id: 'longmen-crowned-buddha-florence', siteId: 'longmen', hallId: 'wu-zhou', number: '武周龙门造像 · 2008年佛罗伦萨展出',
    title: '戴宝冠、垂右手的坐佛', era: '武周前后 · 7世纪末至8世纪初', form: 'sculpture',
    objectType: '专题展出文物', periodNote: '现场出版资料将造像与武则天时代相联系，摄影档案记其原出龙门。现有材料给出的尊名不同，原窟号待核。',
    feature: '额上珠饰排成几道弧线，冠上留着一道斜裂。佛像右手越过膝头，手指从屈起的膝上垂下。',
    look: '沿头顶斜裂一直看到两耳，找出额际珠串。再向下看右上臂的臂钏、胸前项饰与长袍的关系。',
    story: '2008年，这身龙门坐佛在佛罗伦萨斯特罗齐宫的庭院展出。展会新闻资料将它称作弥勒，艺术史研究者在刊用同一幅照片时则题作卢舍那。高冠、项饰、臂钏和垂下的右手可以一项项在照片中查认。图像学上的尊名与它原来所在的具体窟龛，仍需借助造像题记和出土记录来判断。',
    motifs: ['宝冠坐佛', '臂钏', '龙门造像', '影像题名'],
    reference: {label: '斯特罗齐宫基金会 · 2008年中国宫廷艺术展', url: 'https://www.palazzostrozzi.org/mostra/cina/'},
    references: [{label: '2008年展会新闻资料 · 展出地点与弥勒题名', url: 'https://www.deapress.com/ultime-nove-mainmenu-2/ufficio-stampa-mainmenu-68/3634-cina-alla-corte-degli-imperatori.pdf'}, {label: 'Smarthistory · 同幅照片的卢舍那题名', url: 'https://smarthistory.org/maitreya/'}],
    hotspot: [.45, .19, '冠缘上的珠串', '横贯冠身的裂纹下面，几道圆珠整齐排列。珠串的轮廓沿两侧太阳穴往下延伸。'],
  },
];

export const additions = works.map(({reference, references = [], hotspot, ...work}) => {
  const gallery = evidence[work.id];
  const first = gallery[0];
  const [x, y, title, body] = hotspot;
  return {
    ...work, homeHall: work.hallId, image: first.src, alt: first.caption, imageNote: first.caption,
    source: reference.url, sourceName: reference.label,
    sources: [reference, ...references, ...gallery.map(plate => ({label: plate.credit + ' · 图版原记录', url: plate.source}))],
    chapters: [{title: '从哪里看起', body: work.look, source: reference}, {title: '来历与年代', body: work.story, source: reference}],
    hotspots: [{x, y, title, body, source: first.source}],
    credit: {author: first.credit, license: first.license, licenseUrl: first.licenseUrl, source: first.source},
    newAcquisition: true,
  };
});
