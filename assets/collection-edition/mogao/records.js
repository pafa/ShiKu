// Plate numbers identify separately photographed surfaces in the original printed volumes.
// The scholarly description and the photographed plate are cited separately.
const folder = 'assets/collection-edition/mogao/';
const plates = {3:[2107,-119],4:[2131,-183],5:[2132,-249]};
const pd = 'https://creativecommons.org/publicdomain/mark/1.0/';
const studied = (volume,number) => 'https://dsr.nii.ac.jp/reference/pelliot/entry/'+volume+'-'+String(number).padStart(3,'0')+'.html.zh';

const subjects = [
  {
    id:'mogao-98-tiger-screen',cave:98,part:'南壁屏风',hallId:'five-dynasties',era:'五代',form:'mural',volume:3,plate:140,
    title:'屏风第五扇里的饿虎',motifs:['贤愚经变','萨埵太子','屏风分格'],
    feature:'四扇屏风各有边框，太子施身的情节占中间两扇。',
    story:'萨埵太子见饿虎濒死，舍身救虎。第98窟把这一段《贤愚经》故事画在南壁下方。画师用直立的边框把它分成相邻几扇，使观者的眼睛沿着壁面一步步推进。',
    look:'顺着上沿找出四道扇框。中间两扇在原壁依次为第五、第六扇，合起来读饲虎故事。',
    caption:'第98窟南壁下部《贤愚经变》第四至第七扇，第五与第六扇画舍身饲虎。'
  },{
    id:'mogao-61-buddha-screens',cave:61,part:'南壁西端壁脚',hallId:'five-dynasties',era:'五代',form:'mural',volume:4,plate:210,
    title:'山路把佛传画串在一起',motifs:['佛传屏风','云童子献花','山水'],
    feature:'窄长屏风内的城门、人物和蜿蜒山路。',
    story:'第61窟的佛传从南壁西端接到西壁与北壁，铺成连续的屏风。云童子进城、求莲花和向燃灯佛献花等情节，分别落在城门、山脚与道路上。人在画中换了地点，故事也随之走到下一幕。',
    look:'先找分扇的竖边，再看一扇之内如何借山峰分隔人物。图版是这条长卷的一段。',
    caption:'第61窟南壁西端下方，屏风式佛传故事画。'
  },{
    id:'mogao-61-deva-questions',cave:61,part:'北壁《天请问经变》',hallId:'five-dynasties',era:'五代',form:'mural',volume:4,plate:218,
    title:'庭院中的一场问答',motifs:['天请问经变','给孤独园','说法会'],
    feature:'大型集会居画面上部，中央佛座和方形庭院统领众多小身影。',
    story:'《天请问经》以天神发问、佛陀作答展开。画师选用给孤独园中的说法会来呈现这场对话，把听众布置在佛座左右，又在下部画小型说法场面。同是坐佛与听众，尺度变化把不同层次分了出来。',
    look:'从上方的大佛沿中轴向下，比较两层说法场面的尺度和周围听众的密度。',
    caption:'第61窟北壁西起第二铺《天请问经变》。'
  },{
    id:'mogao-285-amitayus',cave:285,part:'东壁门南',hallId:'western-wei',era:'西魏，局部宋绘',form:'mural',volume:4,plate:251,
    title:'双龙华盖下的无量寿佛',motifs:['无量寿佛','双龙华盖','供养人'],
    feature:'垂下的华盖、披大袖袍服的坐佛和分列下方的供养人。',
    story:'入口南侧，画师将无量寿佛安置在双龙华盖之下。说法的佛、持花的弟子和下方的供养人共用一面墙。后来这里又添画了宋代供养人，局部脱落使下层西魏壁画重新露出。',
    look:'从画面上方逐层下看，先找华盖与坐佛，再找到身量明显变小的供养人。观察长袍的垂裾和下方衣裙的折线。',
    caption:'第285窟东壁门南无量寿佛说法图，画幅上缘连及窟顶东披。'
  },{
    id:'mogao-285-flower-offering',cave:285,part:'北壁禅室之间',hallId:'western-wei',era:'西魏',form:'mural',volume:5,plate:259,
    title:'两间禅室之间的一束花',motifs:['供养菩萨','禅室龛楣','千佛'],
    feature:'龛楣围出狭窄布画空间，坐佛下方两位菩萨相向持花。',
    story:'两间禅室的拱形开口把墙面挤成上窄下宽的形状。画师在上方安排一身坐佛，下方让两位持花菩萨相向而立。衣袖和花束之间的小空隙，让重复排列的供养像有了相互呼应的姿态。',
    look:'先看照片两侧向上弯曲的龛边，再找中间两位人物托着的鲜花。两人的脸朝向彼此，头顶的坐佛却面向观看者。',
    caption:'第285窟北壁前段，禅室开口之间的坐佛与两位供养菩萨。'
  },{
    id:'mogao-295',cave:295,part:'窟顶西披',hallId:'sui',era:'隋',form:'mural',volume:5,plate:274,
    title:'窟顶西披的涅槃横卷',motifs:['涅槃经变','卧佛','举哀'],
    feature:'卧佛的长身横贯画面，不同姿态的眷属聚在身后。',
    story:'第295窟将涅槃画在窟顶西披。卧佛侧卧，身后有人克制地伫立，也有人奋力拔发举哀。几乎平直的卧姿和四周急促的手势，让观者在一幅画里读到截然不同的反应。',
    look:'从佛首沿肩背看到佛足，再逆向观察身后人物举到脸旁和头顶的手。注意同在举哀行列里，人物的动作仍有缓急。',
    caption:'第295窟窟顶西披《涅槃经变》，下缘同时摄入相邻龛楣。'
  },{
    id:'mogao-427',cave:427,part:'前室护法造像',hallId:'sui',era:'隋开凿，宋代重修',form:'sculpture',volume:5,plate:293,
    title:'守在木檐下的护法',motifs:['天王','力士','前室木檐'],authority:'https://www.dha.ac.cn/info/1425/3563.htm',
    feature:'柱旁立像高过人身，甲胄、赤裸上身与身后的射入光线可供对比。',
    story:'进第427窟之前，先要穿过木檐下的前室。这里把天王与力士安置在进窟的路旁，巨大的身体先于主室佛像进入视线。洞窟建于隋，前室又经宋代重修，木梁上的题记把这次修缮系到970年。',
    look:'先找立柱和人物彼此遮挡的地方，分清谁站在前面。再顺着人物的轮廓，看衣甲的硬边怎样挨着力士裸露的胳膊。',
    caption:'第427窟前室护法立像与木构，1908年调查时的原址现状。'
  },{
    id:'mogao-76',cave:76,part:'东壁门南',hallId:'song',era:'唐初建，宋代重修',form:'mural',volume:3,plate:180,
    title:'把佛的一生画进八座塔',motifs:['八塔变','降生塔','初转法轮'],
    feature:'洞门旁的塔有层檐和塔龛，龛外还穿插更小的故事场景。',
    story:'第76窟东壁原有八幅塔图，以八处圣地串起释迦生平。门南的第一塔画降生，第三塔画初转法轮。不同事件有相同的塔形边界，观者先认出塔，再看塔中和塔外的具体事迹。',
    look:'看门洞一侧并排的两座塔，再把视线移到塔的侧边和塔脚，那里还有小人物。',
    caption:'第76窟东壁门南八塔变，上排的第一塔与第三塔。'
  },{
    id:'mogao-454',cave:454,part:'东壁门北',hallId:'song',era:'宋，清代重修',form:'mural',volume:4,plate:244,
    title:'听法的大臣与供养的公主',motifs:['维摩诘经变','回鹘供养人','朝服'],
    feature:'上层是宽袍持笏的大臣，下方的供养像仅部分保存。',
    story:'第454窟把现实人物画在经变下缘。上半部属于维摩诘问疾图中的听法臣属，有人面向前方，有人回头。横线以下换成回鹘公主等供养人及题记，画面残缺，仍能分出两层人物的不同身份。',
    look:'先比较上方大臣的袖子与持笏动作，再沿分隔上下两层的横线寻找残留的头像。',
    caption:'第454窟东壁门北，维摩诘经变中的群臣及下层供养人残像。'
  },{
    id:'mogao-259',cave:259,part:'西壁龛',hallId:'northern-wei',era:'北魏，宋代重修',form:'sculpture',volume:4,plate:193,
    title:'西壁佛龛里并坐的两佛',motifs:['释迦多宝','二佛并坐','塔柱形龛'],
    feature:'突出于西壁的半柱形龛中，两身佛像并排而坐。',
    story:'第259窟西壁向室内凸出，形似半根塔柱，正面龛内供奉释迦与多宝二佛。两座形体并排，共用一道龛楣，衣褶在两人膝上分别起伏。窟内经历重修，图中头部等处包含后代修整的痕迹。',
    look:'在同一拱形龛中依次找两人的肩、膝和外侧菩萨，再看塔柱侧面怎样折回西壁。',
    caption:'第259窟西壁塔柱形佛龛与释迦、多宝二佛并坐像。'
  },{
    id:'mogao-448',cave:448,part:'中心柱东面',hallId:'chronology',era:'初唐开凿，五代重修',form:'mural',volume:5,plate:269,
    title:'塔柱下六位供养人的行列',motifs:['女供养人','中心塔柱','重修'],
    feature:'前两身高大，后面数身较小，衣袖和视线各有朝向。',
    story:'第448窟开于初唐，又经五代重修。中心塔柱东面的一组女供养像保留了行列的次序。前排衣袍宽大，后排人物小而紧凑，好几个人的眼睛并不看向同一处。',
    look:'从队列前面两人向后数，比较肩线的位置，再看后排人物相互转向的脸。',
    caption:'第448窟中心塔柱东面女供养人列像局部。'
  },{
    id:'mogao-409',cave:409,part:'东壁门南',hallId:'chronology',era:'回鹘题记与重修年代有不同意见',form:'mural',volume:5,plate:312,
    title:'伞盖下的尖冠供养人',motifs:['供养人','长柄香炉','仪仗'],authority:'https://www.dpm.org.cn/journal/252235.html',
    feature:'一身大像立在伞下，后面有多件仪仗。',
    story:'第409窟东壁门南的大像戴尖顶高冠，手持长柄香炉，身后侍者持伞与障扇。研究者曾从服饰与回鹘文题记讨论其身份，窟的重修时代也有争论。画像上可以直接比较供养者和随从的身量、冠式与行列位置。',
    look:'从伞盖顺着细柄向下找持伞者，再移到前排最高人物头顶，比较冠帽。',
    caption:'第409窟东壁门南持炉供养人与身后仪仗。'
  }
];

export const images = {};
export const newWorks = subjects.map(({cave,part,volume,plate,caption,authority,...s})=>{
  const plateSource=studied(volume,plate), [book,offset]=plates[volume];
  const source=authority||plateSource;
  const src=folder+'pelliot-'+volume+'-'+plate+'.webp';
  const image={src,kind:'historical',originalFrame:false,caption,credit:'Charles Nouette（夏尔·努瓦特），伯希和调查团，1908年',source:plateSource,edition:'https://archive.org/details/dli.pahar.'+book+'/page/n'+(plate+offset)+'/mode/1up',license:'原刊历史摄影 · 公有领域',licenseUrl:pd};
  images[s.id]=[image];
  const sourceName=authority?(s.id==='mogao-427'?'敦煌研究院 · 第427窟':'故宫博物院 · 敦煌西夏石窟年代研究'):'数字丝绸之路 · 伯希和图录考释';
  return {...s,siteId:'mogao',number:'第'+cave+'窟 · '+part,homeHall:s.hallId,reason:s.feature,source,sourceName,alt:caption,image:src,
    periodNote:s.era,placement:s.feature,
    chapters:[{title:'看这件原物',body:s.story},{title:'从哪里看起',body:s.look}],
    sources:[{label:sourceName,url:source},...(authority?[{label:'原刊图版考释',url:plateSource}]:[]),{label:'查看原刊扫描页',url:image.edition}]};
});

function color(id,filename,fileTitle,caption,credit) {
  images[id]=[{src:folder+filename+'.webp',kind:'site',originalFrame:false,caption,credit,license:'公有领域 · 原壁画二维复制',licenseUrl:pd,
    source:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(fileTitle.replaceAll(' ','_'))}];
}
color('mogao-254','sibi','Mogao Cave 254, Shibi Jataka, Northern Wei period.jpg','第254窟北壁《尸毗王本生》彩色图版，中央为端坐的尸毗王。','北魏佚名画师；华盛顿大学敦煌展览图录，Commons 收录');
color('mogao-272','devas','1 Devas. Dunhuang mural. Cave 272, Northern Liang dynasty..jpg','第272窟壁画局部，红底上成排的供养天人。','早期敦煌画师；Commons 收录的原作图版');
color('mogao-159','orchestra','Mogao Caves, cave 159 musicians.jpg','第159窟西壁龛外文殊变乐队局部。此画为乐伎，东壁问疾与吐蕃赞普另见研究院原图。','中唐敦煌画师；Commons 收录的原壁画复制');
color('mogao-465','tantra','The Tantric image from Cave 465, Dunhuang. Yuan dynasty..jpg','第465窟南壁曼荼罗局部。中央圆坛、窟顶东披弯琴另见研究院原图。','敦煌佚名画师；樊锦诗主编图录，张伟文摄影，Commons 收录');

// Externally viewed at the rights holder. These URLs do not supply a wall texture.
export const officialViews = {
  "mogao-3": [
    {
      "label": "北壁千手观音特写",
      "url": "https://www.dha.ac.cn/__local/6/6F/71/760C395A7EEDBB94599B52E1281_6AB203E7_FDE09.png",
      "source": "https://www.dha.ac.cn/info/1425/3628.htm",
      "width": 415,
      "height": 625
    },
    {
      "label": "南壁十一面千手千眼观音全幅",
      "url": "https://www.dha.ac.cn/__local/D/AD/6F/D05F2D7E0827125A825022DE637_8B139204_219EE8.png",
      "source": "https://www.dha.ac.cn/info/1425/3628.htm",
      "width": 750,
      "height": 733
    }
  ],
  "mogao-12": [
    {
      "label": "南壁十一扇屏风中的婚嫁图",
      "url": "https://www.dha.ac.cn/__local/7/D8/FA/DFB1A9A72E45BECF1CD10DB8402_AAB500A9_A1494.png",
      "source": "https://www.dha.ac.cn/info/1425/3658.htm",
      "width": 450,
      "height": 626
    }
  ],
  "mogao-72": [
    {
      "label": "佛像授珠的画面",
      "url": "https://www.dha.ac.cn/__local/4/9E/32/655C1F26AA5E42058D2E07587E0_EEB50A51_119634.png",
      "source": "https://www.dha.ac.cn/info/1425/3573.htm",
      "width": 460,
      "height": 625
    }
  ],
  "mogao-107": [
    {
      "label": "主室西壁失去泥像的帐形龛",
      "url": "https://cdn.e-dunhuang.com/SOURCES/10.0001/0001/0001/0107/0001/0003/01/1/index.tiles/preview.jpg",
      "source": "https://www.e-dunhuang.com/cave/10.0001/0001.0001.0107",
      "width": 918,
      "height": 688
    }
  ],
  "mogao-159": [
    {
      "label": "东壁问疾图中的吐蕃赞普",
      "url": "https://www.dha.ac.cn/__local/0/44/81/135B963996823EDE0F9BE5FED14_234F029E_8E7A2.png",
      "source": "https://www.dha.ac.cn/info/1425/3587.htm",
      "width": 600,
      "height": 407
    },
    {
      "label": "西壁龛外的文殊变乐队",
      "url": "https://www.dha.ac.cn/__local/D/39/19/90C05F542AD788FE2F33E7DD988_69BA5CA1_52D26.png",
      "source": "https://www.dha.ac.cn/info/1425/3587.htm",
      "width": 333,
      "height": 500
    }
  ],
  "mogao-194": [
    {
      "label": "主室西壁佛龛与造像",
      "url": "https://cdn.e-dunhuang.com/SOURCES/10.0001/0001/0001/0194/0001/0003/01/1/index.tiles/preview.jpg",
      "source": "https://www.e-dunhuang.com/cave/10.0001/0001.0001.0194",
      "width": 946,
      "height": 648
    }
  ],
  "mogao-275": [
    {
      "label": "西壁交脚弥勒正面",
      "url": "https://www.dha.ac.cn/__local/E/2A/FB/596AB80B51CF2B410FD676D8730_63AF1854_115241.png",
      "source": "https://www.dha.ac.cn/info/1425/3554.htm",
      "width": 563,
      "height": 503
    },
    {
      "label": "南壁阙形龛",
      "url": "https://www.dha.ac.cn/__local/3/8D/22/FF0BB1576D2C92BC1E074EFB856_A29D7FDC_D0D35.png",
      "source": "https://www.dha.ac.cn/info/1425/3554.htm",
      "width": 563,
      "height": 379
    }
  ],
  "mogao-288": [
    {
      "label": "主室与人字披内景",
      "url": "https://www.dha.ac.cn/__local/3/45/34/DDA7FBEA8D141A47F70F87F444E_F7EEE523_11D83B.jpg",
      "source": "https://www.dha.ac.cn/info/1425/3621.htm",
      "width": 2000,
      "height": 1354
    }
  ],
  "mogao-301": [
    {
      "label": "窟顶东披饲虎、起塔图",
      "url": "https://cdn.e-dunhuang.com/SOURCES/10.0001/0001/0001/0301/0001/0005/01/1/index.tiles/preview.jpg",
      "source": "https://www.e-dunhuang.com/cave/10.0001/0001.0001.0301",
      "width": 1034,
      "height": 498
    },
    {
      "label": "窟顶南披太子本生前段",
      "url": "https://cdn.e-dunhuang.com/SOURCES/10.0001/0001/0001/0301/0001/0006/01/1/index.tiles/preview.jpg",
      "source": "https://www.e-dunhuang.com/cave/10.0001/0001.0001.0301",
      "width": 1064,
      "height": 426
    }
  ],
  "mogao-329": [
    {
      "label": "窟顶飞天莲花纹藻井",
      "url": "https://www.dha.ac.cn/__local/7/82/E0/BC9551B953CCEDCA3CD64D3FA9F_9170A011_D3075.png",
      "source": "https://www.dha.ac.cn/info/1425/3577.htm",
      "width": 563,
      "height": 383
    },
    {
      "label": "西壁龛顶的夜半逾城",
      "url": "https://www.dha.ac.cn/__local/1/8D/9A/CB2938EECC9EE6BDDA167620BB8_A93F1C1E_2C4E3.jpg",
      "source": "https://www.dha.ac.cn/info/1425/3577.htm",
      "width": 450,
      "height": 304
    }
  ],
  "mogao-332": [
    {
      "label": "同窟南壁《涅槃经变》出殡图",
      "url": "https://www.dha.ac.cn/__local/8/0A/8F/6FE6948D8723DC37FC15A8D8FD9_1FEB4C5A_85718.png",
      "source": "https://www.dha.ac.cn/info/1425/3575.htm",
      "width": 552,
      "height": 247
    }
  ],
  "mogao-335": [
    {
      "label": "第335窟彩绘说法像局部",
      "url": "https://www.dha.ac.cn/__local/E/71/36/F69DBCC5818BD703CE8943F94C2_E3B3B935_9ECFF.png",
      "source": "https://www.dha.ac.cn/info/1425/3574.htm",
      "width": 657,
      "height": 247
    }
  ],
  "mogao-367": [
    {
      "label": "窟顶团凤纹藻井",
      "url": "https://www.dha.ac.cn/__local/A/A8/A2/C4556F9F1DEBFA55CBC09CFC2AB_3292BE48_55D49.png",
      "source": "https://www.dha.ac.cn/info/1425/3674.htm",
      "width": 450,
      "height": 305
    }
  ],
  "mogao-390": [
    {
      "label": "第390窟供养人行列",
      "url": "https://www.dha.ac.cn/__local/4/14/FC/D1529C515F9732840CAD8456B94_48EC36AC_71844.png",
      "source": "https://www.dha.ac.cn/info/1425/3570.htm",
      "width": 295,
      "height": 393
    }
  ],
  "mogao-420": [
    {
      "label": "第420窟主室内景",
      "url": "https://www.dha.ac.cn/__local/B/22/53/49E2B45545932F8A53C2BB86DB1_340756B2_36330.png",
      "source": "https://www.dha.ac.cn/info/1425/3551.htm",
      "width": 350,
      "height": 238
    }
  ],
  "mogao-465": [
    {
      "label": "东披弯琴弹奏特写",
      "url": "https://www.dha.ac.cn/__local/7/C6/AB/B3610B758F6C60CDA329D91E7CA_C2FB6D03_1BB294.png",
      "source": "https://www.dha.ac.cn/info/1425/3557.htm",
      "width": 557,
      "height": 813
    },
    {
      "label": "后室中央圆坛",
      "url": "https://www.dha.ac.cn/__local/F/7F/E3/A9EA5C574513C2B9CFBF8AF5D1D_4D92ACBB_1DD4DB.png",
      "source": "https://www.dha.ac.cn/info/1425/3557.htm",
      "width": 813,
      "height": 600
    }
  ]
};
