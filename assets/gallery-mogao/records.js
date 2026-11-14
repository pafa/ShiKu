// Source pages carry the identifier and reuse terms for each photograph.
const folder = 'assets/gallery-mogao/';
const pd = 'https://creativecommons.org/publicdomain/mark/1.0/';
const cc0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const shareAlike = 'https://creativecommons.org/licenses/by-sa/4.0/';
function plate(file, caption, credit, source, license = '公有领域', licenseUrl = pd) {
  return {src:folder + file + '.webp', kind:'site', originalFrame:false, caption, credit, source, license, licenseUrl};
}

export const evidence = {
  'mogao-302':[
    plate("302-kings", "第302窟本生画，图版右侧为尸毗王，左侧为毗楞竭梨王。此处展示同窟壁画，塔柱开皇纪年在另一位置。", "隋代敦煌画师；Xinyu Gao（2025）图2", "https://doi.org/10.26689/jcer.v9i7.11284", 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'),
  ],
  'mogao-302-shyama':[
    plate("302-shyama", "第302窟人字披顶东披下栏的睒子本生，山林间可见鹿、行者及房舍。", "隋代敦煌画师；Xinyu Gao（2025）图3", "https://doi.org/10.26689/jcer.v9i7.11284", 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'),
  ],
  'mogao-435-bodhisattva':[
    plate("435-bodhisattva", "第435窟的戴冠菩萨，肩部与衣带布以青绿，头冠内有小坐像。", "北朝敦煌画师，Ismoon 扫描，《5000 ans d’art chinois》第14卷图206", "https://commons.wikimedia.org/wiki/File:Bodhisattva._Northern_Wei._Mogao_cave_435.jpg", 'CC BY-SA 4.0', shareAlike),
  ],
  'mogao-12':[
    plate("012-wedding", "第12窟婚嫁图，宾客围在青色帐幔与礼毯旁。图中是婚仪局部。", "晚唐敦煌佚名画师，图版经 Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:%E5%A9%9A%E5%AB%81%E5%9C%96a.jpg"),
  ],
  'mogao-57':[
    plate("057-guanyin", "第57窟南壁的菩萨。头光围住面庞，颈下垂落的璎珞和衣饰仍可逐层分辨。", "初唐敦煌画师，张伟文摄影，樊锦诗主编图录", "https://commons.wikimedia.org/wiki/File:Mural_Avolokitesvara.jpg"),
  ],
  'mogao-98':[
    plate("098-donors", "第98窟的女供养人像，发上饰物与两袖花纹依稀可辨。此图与甬道曹氏父子为同窟不同人物。", "五代敦煌佚名画师，图版经 Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Buddhist_donors_from_Cave_98_at_Mo-kao.jpg"),
  ],
  'mogao-98-khotan-king':[
    plate("098-khotan", "第98窟东壁门南，于阗国王李圣天供养像。冠顶上方设伞盖，长袍从双手间一直垂向地面。", "五代敦煌佚名画师，《The Silk Road》图版", "https://commons.wikimedia.org/wiki/File:Portrait_of_a_Khotan_King_-_full.jpg"),
  ],
  'mogao-112':[
    plate("112-pipa", "第112窟南壁乐舞图的反弹琵琶舞伎局部。舞者提足，双臂绕向脑后，琴身横在肩背上。", "中唐敦煌佚名画师，Wikimedia Commons 收录的彩色图版", "https://commons.wikimedia.org/wiki/File:Mogao_Caves_Pipa-Player.jpg"),
    plate("112-drum", "第112窟南壁同一幅乐舞图里的鼓手，羯鼓横放，左右手分执鼓杖。", "中唐敦煌画师，《敦煌石窟艺术全集》第16卷《音乐画卷》", "https://commons.wikimedia.org/wiki/File:%E8%8E%AB%E9%AB%98%E7%AA%9F112%E7%AA%9F%E5%8D%97%E5%A3%81.jpg"),
  ],
  'mogao-156':[
    plate("156-procession", "第156窟张议潮出行图局部。马队、旌旗和仪仗沿着横幅列队前行。", "晚唐敦煌佚名画师，图版经 Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Dunhuang_Zhang_Yichao_army.jpg"),
  ],
  'mogao-220':[
    plate("220-emperor", "第220窟东壁门北《维摩诘经变》局部。冠冕下的帝王着红袍，随行者在两侧簇拥。", "初唐敦煌佚名画师，图版经 Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_220_Tang_Dynasty_emperor_and_officials_%E8%8E%AB%E9%AB%98%E7%AA%9F220%E7%AA%9F%E4%B8%9C%E5%A3%81%E9%97%A8%E5%8C%97_%E5%88%9D%E5%94%90%E5%90%9B%E8%87%A3%E5%B8%9D%E7%8E%8B.jpg"),
  ],
  'mogao-249':[
    plate("249-asura", "第249窟西披阿修罗，臂膀与托起的日月位于须弥山、天宫和海水之间。", "敦煌画师，Ismoon 扫描，《5000 ans d’art chinois》第14卷图68", "https://commons.wikimedia.org/wiki/File:Asura_in_249th_cave_of_Mogao_Caves1.jpg", 'CC BY-SA 4.0', shareAlike),
  ],
  'mogao-254':[
    plate("254-sibi", "第254窟北壁《尸毗王本生》。端坐的大王居中，膝边与两侧的人物把前后几幕并在一起。", "北魏敦煌画师，华盛顿大学丝绸之路展览图录", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_254,_Shibi_Jataka,_Northern_Wei_period.jpg"),
  ],
  'mogao-275':[
    plate("275-jataka", "第275窟北壁的毗楞竭梨王本生。画中是为听法而受考验的国王，西壁交脚弥勒可由敦煌研究院原图查看。", "早期敦煌画师，Ismoon 扫描，《5000 ans d’art chinois》第14卷图248", "https://commons.wikimedia.org/wiki/File:King_Bhilanjili_Jataka._Northern_Liang._Mogao_cave_275.jpg"),
  ],
  'mogao-285-apsara':[
    plate("285-apsara", "第285窟两身飞天局部。浅色天人一高一低，身边的飘带向斜上方伸展。", "西魏敦煌画师，樊锦诗《The Caves of Dunhuang》（2008）图版，第75页", "https://commons.wikimedia.org/wiki/File:Dunhuang_mural_flying_apsarasa.jpg"),
  ],
  'mogao-288':[
    plate("288-balcony", "第288窟天宫栏墙局部。栏槛与半圆形背幕把上方一列天人分成相邻的小组。", "西魏敦煌画师，华盛顿大学丝绸之路展览图录", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_288,_Devatas_at_the_Balcony,_Western_Wei_period.jpg"),
  ],
  'mogao-299-qin':[
    plate("299-qin", "第299窟顶南披伎乐天，长琴斜过胸前，双手一高一低。", "北周敦煌画师，Wikimedia Commons 收录的彩色图版", "https://commons.wikimedia.org/wiki/File:Dunhuang_Cave_299,_Qin.jpg"),
  ],
  'mogao-301':[
    plate("301-ceiling", "第301窟抱拨弦乐器的飞天局部。图中是同窟伎乐；舍身饲虎的叙事分布在南披与东披。", "北周敦煌画师，慧日华光图版经 Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_301,_Northern_Zhou_Dynasty.jpg"),
  ],
  'mogao-322':[
    plate("322-lute", "第322窟伎乐飞天局部，乐伎在空中手持梨形拨弦乐器。", "初唐敦煌画师，Wikimedia Commons 收录的伎乐飞天图版", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_322_Apsara_playing_lute-family_instrument.jpg"),
  ],
  'mogao-322-healing':[
    plate("322-healing", "第322窟东壁的药师佛，中央立佛两旁各立一身菩萨；两侧边缘还可看到画面相邻部分。", "初唐敦煌画师，Wikimedia Commons 收录的东壁图版", "https://commons.wikimedia.org/wiki/File:Bhaisajyaguru_mural_from_Mogao_Cave_322,_Dunhuang.jpg"),
  ],
  'mogao-329':[
    plate("329-dragon", "第329窟的乘龙天人。研究院在佛龛顶部佛传中记录了乘龙引路者，窟顶十二身伎乐在画幅外。", "初唐敦煌画师，Wikimedia Commons 收录的乘龙图版", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_329.jpg"),
  ],
  'mogao-332':[
    plate("332-debate", "第332窟北壁后部维摩诘经变局部，人物在树木和伞盖下聚集。", "LIJIHENG", "https://commons.wikimedia.org/wiki/File:Cave_332,_Virmalakirti_and_Manjushri.png", 'CC0 1.0', cc0),
  ],
  'mogao-332-emperor':[
    plate("332-court", "第332窟维摩诘经变中的帝王听众局部，冠冕与身后仪仗仍可辨认。", "LIJIHENG", "https://commons.wikimedia.org/wiki/File:Cave_332,_Emperor_beneath_the_Virmalakirti.png", 'CC0 1.0', cc0),
  ],
  'mogao-409':[
    plate("409-donor", "第409窟东壁门南的尖冠供养人、侍从与伞扇。图像身份与壁画年代仍有不同意见。", "敦煌佚名画师，《Cave Temples of Dunhuang: Art and History on the Silk Road》图版", "https://commons.wikimedia.org/wiki/File:Dunhuang_Uighur_king.jpg"),
  ],
  'mogao-428':[
    plate("428-tiger", "第428窟东壁门南萨埵太子本生。横向画带接续山路、舍身与举哀等情节。", "北周敦煌画师，敦煌研究院藏图，Google Arts & Culture 图版", "https://commons.wikimedia.org/wiki/File:%E8%90%A8%E5%9F%B5%E5%A4%AA%E5%AD%90%E6%9C%AC%E7%94%9F%E5%9B%BE.jpg"),
    plate("428-gift", "第428窟东壁门北须达拏太子本生。另一位太子的远行与布施也分成多栏连续画面。", "北周敦煌画师，《中国美术全集》图版", "https://commons.wikimedia.org/wiki/File:%E9%A0%88%E9%81%94%E6%8B%8F%E6%9C%AC%E7%94%9F.jpg"),
  ],
  'mogao-428-pipa':[
    plate("428-pipa", "第428窟中心塔柱伎乐图局部。乐伎横抱琵琶，两手分别落在琴颈与面板上。", "北周敦煌画师，Wikimedia Commons 收录的塔柱伎乐图版", "https://commons.wikimedia.org/wiki/File:Dunhuang_Cave_428_Pipa.jpg"),
  ],
  'mogao-465':[
    plate("465-harp", "第465窟的弓形竖琴局部。长弯杆与下方共鸣箱围成长弓般的轮廓。", "敦煌佚名画师，Wikimedia Commons 收录的弓形竖琴图版", "https://commons.wikimedia.org/wiki/File:Mogao_Cave_465,_bow_harp.jpg"),
  ],
};

// The donor portrait belongs to the hall's Khotan stop, not its Cao-family stop.
const khotan = evidence['mogao-98-khotan-king'][0];
evidence['mogao-98'].push({...khotan, details:['khotan'], contextOnly:true});
evidence['mogao-249'][0].details = ['asura'];
// These frames show other portions of their caves. Each caption names the pictured surface.
for (const id of ['mogao-12', 'mogao-98', 'mogao-301', 'mogao-302', 'mogao-329']) {
  evidence[id][0].contextOnly = true;
}
evidence['mogao-275'][0].contextOnly = true;

const studies = [
  {
    id:'mogao-302-shyama', cave:302, part:'窟顶东披下栏', hallId:'sui', era:'隋 · 开皇四年前后', entry:3681,
    title:'鹿群中的一支误箭', motifs:['睒子本生','取水','孝养双亲'],
    feature:'这条狭长的壁画把房舍、树木、鹿和行人并列铺开。在跌坐、伸手等小动作之间，画师将一段时间压进一段窟顶。',
    look:'先从屋舍往野外看，在几处树木间找出鹿的轮廓。再沿着人手和身体倾斜的方向，寻找取水、误射与救助的前后联系。',
    story:'睒子奉养失明的双亲，往水边取水时被狩猎的国王误射。得知实情的国王答应照顾他的父母。这段故事在第302窟占据人字披东侧的下栏，与上栏多则短小的本生画相邻。'
  },{
    id:'mogao-435-bodhisattva', cave:435, part:'壁面菩萨', hallId:'northern-wei', era:'北魏，洞窟五代重修', authority:'https://dl.dha.ac.cn/v2/sub/5fede3f250157c0836148fa9183feb3c',
    title:'青衣与白冠之间的菩萨', motifs:['菩萨','衣冠','北朝设色'],
    feature:'头冠里有一身小坐像，尖尖的火焰形轮廓在深红地上特别清楚。向下看，鲜明的青色衣缘把肩、肘和腰的转折一一勾出。',
    look:'先找头冠里的小像，再看一手在胸前托起、一手垂低的姿态。画面中皮肤的深色是今天图版所见，不能据此倒推初绘肤色。',
    story:'第435窟有中心塔柱，后部平顶、前部作人字披。图版把观看的距离缩到一身菩萨：冠饰、肩部交叠的衣缘和起伏的轮廓，都是比较北朝不同洞窟人物画法的线索。断代依敦煌研究院的窟志。'
  },{
    id:'mogao-98-khotan-king', cave:98, part:'东壁门南', hallId:'five-dynasties', era:'五代 · 后晋时补绘', entry:3647,
    title:'门南伞盖下的于阗国王', motifs:['李圣天','供养人','于阗'],
    feature:'墙上立着一位戴冠蓄须的供养者。高高的红色伞盖比肩膀还宽，旁边的小人物才到他腰间。',
    look:'先找伞盖下那顶冠，沿着朝内交合的双手往下看。他身旁的侍者与他的体量差得很远。',
    story:'第98窟建成于924年。后来，归义军曹氏的姻亲、于阗国王李圣天与夫人曹氏的画像又添在门南。进窟的人从文殊下方经过，也会迎面遇见这段跨越敦煌和于阗的家族关系。'
  },{
    id:'mogao-285-apsara', cave:285, part:'飞天壁画', hallId:'western-wei', era:'西魏', entry:3698,
    title:'相随飞行的两身天人', motifs:['飞天','衣带','禅窟'],
    feature:'两身浅色天人一高一低，屈身回臂。白色与浅青色衣带沿斜线向上伸展，把两道身影连成一道飞行的轨迹。',
    look:'先从左下方的天人沿飘带看到右上方的面孔，再找两人身后反折的衣褶。浅色衣带交错在深色地上，飞动的方向因此格外清楚。',
    story:'第285窟有写于538年和539年的两条发愿文。禅室门边有供养者，窟顶和壁面上方则布置了飞天。画师借悬空的人物让人从现实中开凿的禅室，一路抬头看到天界。'
  },{
    id:'mogao-299-qin', cave:299, part:'窟顶南披', hallId:'northern-zhou', era:'北周', entry:3622,
    title:'让长琴斜过身前的伎乐天', motifs:['伎乐天','琴','覆斗顶'],
    feature:'深色长琴斜架在肩前，乐伎的双手一高一低。乐器需要安稳地托住，画师却让人物像在空中漂行。',
    look:'从高举的一端向下看，找到另一只按在琴身上的手。前后两手的距离，透露出这件乐器的长度。',
    story:'第299窟的主室为覆斗顶。南披既安排了萨埵太子本生，又画天宫伎乐；相邻几披还有睒子故事。仰视时，正在抚琴的天人和曲折展开的故事画分享同一方窟顶。'
  },{
    id:'mogao-428-pipa', cave:428, part:'中心塔柱', hallId:'northern-zhou', era:'北周', entry:3558,
    title:'北周塔柱上的琵琶手', motifs:['五弦琵琶','中心塔柱','伎乐'],
    feature:'小幅壁画里，乐伎把琴身抱在胸前，左臂追着长颈伸出，粗重的轮廓从颈部一直勾到右手。',
    look:'先辨认乐器圆下而收窄的外形，再比较琴颈上的手和落在面板旁的手。这张图版将乐器著录为五弦琵琶。',
    story:'第428窟中央有四面开龛的塔柱。转身看塔柱上的小幅伎乐，与回身看洞门南北两铺太子本生，观看的距离和身体姿态都不同。琴手的双手把礼拜空间里本来无声的音乐交代了出来。'
  },{
    id:'mogao-332-emperor', cave:332, part:'北壁经变听众', hallId:'wu-zhou', era:'武周', entry:3575,
    title:'站在维摩诘下方听讲的帝王', motifs:['维摩诘经变','帝王听众','圣历碑'],
    feature:'君主端身而立，身边人物靠得很近。褪色的墙面上，冠冕、长袍和簇拥的队列仍然把他与随从区分开。',
    look:'从冠前垂下的线条向下看，找到人物身上较长的一块浅色衣面。再比较身旁人物互相遮挡的轮廓。',
    story:'维摩诘托病在家，文殊前去问疾，两人的对答也是一场说法。第332窟北壁后部把经文画成群像，把君主安排进听法的人群。前室旧碑系于圣历元年，即698年，使这一窟能放回武周的营造背景。'
  },{
    id:'mogao-322-healing', cave:322, part:'东壁', hallId:'tang', era:'初唐', entry:3600,
    title:'药师佛身旁的两位菩萨', motifs:['药师佛','侍立菩萨','东壁'],
    feature:'中央立佛与两位菩萨踩在三个独立的莲座上。佛袍的暖红色和两旁衣服的冷色分出主次，头光又把三人连成一组。',
    look:'看三双脚与莲座怎样相接，再往上比较三枚头光。佛两侧身影相仿，衣带的转折却各有不同。',
    story:'第322窟入口在东壁，西壁的双层大龛是礼拜的主要方向。走入洞室再回身，东壁的药师佛画像便进入视野。佛与菩萨的平面组像，能够与对面大龛里有真实体量的塑像对读。'
  }
];

export const additions = studies.map(({cave, part, entry, authority, ...work}) => {
  const photo = evidence[work.id][0];
  const source = authority || 'https://www.dha.ac.cn/info/1425/' + entry + '.htm';
  const sourceName = '敦煌研究院 · 莫高窟第' + cave + '窟';
  const description = {label:sourceName, url:source};
  const plateSource = {label:'本件图版与署名', url:photo.source};
  return {
    ...work, siteId:'mogao', homeHall:work.hallId, number:'第' + cave + '窟 · ' + part,
    form:'mural', objectType:'洞窟壁画', source, sourceName, sources:[description, plateSource],
    periodNote:work.era, placement:part, reason:work.feature,
    image:photo.src, alt:photo.caption, imageNote:photo.caption,
    credit:{author:photo.credit, license:photo.license, licenseUrl:photo.licenseUrl, source:photo.source},
    chapters:[{title:'从哪里看起', body:work.feature + work.look, source:plateSource},
      {title:'画里的故事', body:work.story, source:description}],
    hotspots:[], newAcquisition:true
  };
});
