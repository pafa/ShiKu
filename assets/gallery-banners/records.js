// Accession numbers identify portable objects. Only the historical photograph is put on the Cave 17 wall.
const met = 'https://www.metmuseum.org/art/collection/search/73823';
const freer = 'https://asia-archive.si.edu/object/F1930.36/';
const donor = 'https://commons.wikimedia.org/wiki/File:Buddhist_donor,_Guiyi_era,_983_AD.jpg';
const nouette = 'https://commons.wikimedia.org/wiki/File:Paul_Pelliot_examining_manuscripts_in_Cave_17_at_Mogao_Caves_in_1908.jpg';
const king = 'https://artsandculture.google.com/asset/vaishravana-riding-across-the-waters-a-painting-on-silk/WgFlLfH_LFShPg';
const kingPlate = 'https://commons.wikimedia.org/wiki/File:Vaishravana_riding_across_the_waters._61,8x54,7cm_From_Dunhuang,_Cave17._Five_Dynasties,_mid-10th_century_AD._British_Museum..jpg';
const cc0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const pd = 'https://creativecommons.org/publicdomain/mark/1.0/';

function picture(file, kind, caption, credit, source, license, licenseUrl) {
  return {src:'assets/gallery-banners/'+file+'.webp', kind, caption, credit, source, license, licenseUrl};
}

export const images = {
  'mogao-bm-king-of-north':[picture('sea','object','持戟的北方毗沙门天王与随从立在紫云上。远山和密集的水纹衬出队伍行进的方向。','大英博物馆，1919,0101,0.45；图版据 Wikimedia Commons',kingPlate,'公有领域',pd)],
  'mogao-17':[picture('cave-17','historical','1908年，伯希和在莫高窟第17窟查看文书。画面记录的是整理中的洞内，而非最初封存时的陈设。','Charles Nouette（1908）／吉美国立亚洲艺术博物馆',nouette,'公有领域',pd)],
  'mogao-met-banner-2007294':[picture('banner','object','敦煌地区绢幡的长方形幡身。一尊立菩萨手持法器，三角形幡首不在此图中。','大都会艺术博物馆，2007.294a,b',met,'CC0',cc0)],
  'mogao-freer-water-moon':[picture('water-moon','object','水月观音绢画全幅。下栏供养人和题字与上方观音同在一幅绢上。','史密森尼国立亚洲艺术博物馆，弗利尔收藏，F1930.36',freer,'CC0',cc0)],
  'mogao-guimet-17662':[picture('donor','object','《地藏菩萨与十王图》中的女供养人局部，983年。主尊和十王在此取景范围之外。','吉美国立亚洲艺术博物馆，MG 17662；图版据 Wikimedia Commons',donor,'公有领域',pd)]
};

export const newWorks = [
  {id:'mogao-bm-king-of-north',siteId:'mogao',homeHall:'tang',findspotCave:17,number:'藏经洞绢画 · 1919,0101,0.45',accession:'1919,0101,0.45',era:'唐 · 9世纪',holding:'大英博物馆',title:'紫云上的北方天王',motifs:['护法','毗沙门天王','绢画'],objectType:'绢本设色画',form:'mural',source:king,sourceName:'大英博物馆 · 1919,0101,0.45',reason:'依馆方著录归于唐代，出自莫高窟第17窟。',
   feature:'先认出手持长戟的天王。画面右侧，紫云托起一座小塔，另一朵紫云把随行的人物聚在一起。',
   look:'从戟尖往上找天际的山脊，再顺着一层层水纹回到人物脚下。队伍前方有一位手捧花盘的女神。',
   story:'这件小幅绢画让守护北方的天王离开静止的佛龛，以巡行的姿态越过水面。大英博物馆将持花盘者辨为天王的姊妹吉祥天。'},

  {id:'mogao-met-banner-2007294',siteId:'mogao',homeHall:'chronology',number:'敦煌绢幡 · 2007.294a,b',accession:'2007.294a,b',era:'晚唐至五代之间 · 9—10世纪',holding:'大都会艺术博物馆',title:'一面可以移动的菩萨幡',motifs:['幡画','立菩萨','丝织物'],objectType:'绢本设色幡画',form:'mural',source:met,sourceName:'大都会艺术博物馆 · 2007.294a,b',reason:'馆方定在9—10世纪，展于断代研读馆。出自敦煌地区，未据此指定窟号。',
   feature:'画里的冠、璎珞和长裙把视线从头顶引向足下的莲台。幡身修长，人物的双肩几乎占满幅宽。',
   look:'先看纵向画幅下端的脚与莲台，再向上找幡顶下垂的装饰。馆藏记录另有三角形幡首，其上画坐佛。',
   story:'这样的幡可以悬在寺院或洞窟里，也可以随仪式移动。馆方保留两处疑问：立像可能是孔雀明王，今藏的幡首与幡身也未必原属同件。'},
  {id:'mogao-freer-water-moon',siteId:'mogao',homeHall:'song',number:'敦煌绢画 · F1930.36',accession:'F1930.36',holding:'史密森尼国立亚洲艺术博物馆',era:'北宋纪年 · 968年',title:'水月观音座下的四位供养人',motifs:['供养人','题记','水月观音'],objectType:'绢本设色画',form:'mural',source:freer,sourceName:'弗利尔收藏 · F1930.36',reason:'采用馆方968年断代，与北宋同年表。当地由沙州曹氏治理。',
   feature:'圆形背光圈出观音与莲座，画幅最下方另辟一栏绘供养人。两处人物的尺度形成鲜明对照。',
   look:'先在观音冠中找小佛，再看柳枝和瓶。向下看，四位供养人分侍题字两旁，最右的男子属于沙州曹氏。',
   story:'这幅绢画把礼拜对象和委托作画的人留在同一画面。题记与瓶、柳枝、冠中小佛一起帮助辨认观音。馆方将产地定为敦煌，未注明具体洞窟。'},
  {id:'mogao-guimet-17662',siteId:'mogao',homeHall:'song',findspotCave:17,number:'藏经洞绢画 · MG 17662',accession:'MG 17662',holding:'吉美国立亚洲艺术博物馆',era:'北宋纪年 · 983年',title:'地藏与十王图中的女供养人',motifs:['供养人','地藏','绢画'],objectType:'绢本设色画',form:'mural',source:donor,sourceName:'吉美藏 MG 17662 · 供养人局部图版',reason:'作品纪年983年，出自莫高窟第17窟，归入宋馆的敦煌供养人一线。',
   feature:'女供养人戴高冠，双手收在胸前。深色外衣在脚边分开，露出有纹样的长裙。',
   look:'从冠饰旁的白色条带往下看，沿红边能辨认袖口与外衣的层次。脚下还有一块边沿带纹样的小毯。',
   story:'这位女性原属一幅描绘地藏菩萨、六道和十王的绢画。展墙放大了供养人的衣冠，完整构图的研究可由下方来源查阅。供养像让我们看见一件宗教绘画也为参与造画的人保留了位置。',
   sources:[{label:'MG 17662 女供养人局部',url:donor},{label:'剑桥大学出版社论文 · 983年地藏十王图全幅，图1',url:'https://doi.org/10.1017/S0041977X26101281'}]}
];
