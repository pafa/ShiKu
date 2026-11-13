import {print} from './collection-documents.js';
const object=print.source,archive='https://idp.bl.uk/discover/learning/dunhuang/collection-items/cave-17-the-library-cave/';
const photo='https://commons.wikimedia.org/wiki/File:Diamond_Sutra_of_868_AD_-_The_Diamond_Sutra_(868),_frontispiece_and_text_-_BL_Or._8210-P.2.jpg';
const stars='https://idp.bl.uk/collection/7861395E5F814419BA05483EAB254832/';
const starRange={label:'横移星图',initial:.05,minLabel:'分区天图',maxLabel:'近北天极'};
const step=(id,title,text,anchor,stand,source)=>({id,title,text,anchor,stand,source});
export const records={[print.id]:{
  width:7.6,depth:7.6,height:3.9,mouthWidth:2.8,spaceType:'studio',spaceName:'藏经洞双卷书房',kind:'印本卷案',orientation:'从唐馆崖廊进门，先到正中的印经案；从案旁绕到格窗下，第二张案上可移动整幅星图。',
  note:'这间木构阅卷室是当代展陈。卷面采用大英图书馆所藏《金刚经》卷首与相邻经文的摄影；第一案放大展示所摄的卷首；后案展出另一件独立藏品《敦煌星图》的天图区图版。',
  sources:[{label:'大英图书馆与国际敦煌项目 · 馆藏登记',url:object},{label:'国际敦煌项目 · 七纸与造经题记',url:archive},{label:'大英图书馆 · 卷首与经文摄影（CC0）',url:photo},{label:'国际敦煌项目 · 《敦煌星图》Or.8210/S.3326',url:stars}],
  obstacles:[{x0:-2.05,x1:2.05,z0:-5.38,z1:-3.7},{x0:-2.85,x1:2.85,z0:-7.53,z1:-6.68}],
  details:[
    step('front','开卷先见一场说法','画师把佛陀置于坐榻上，弟子与听众围在身旁。卷起左轴，画面右侧的树与听众先出现；再徐徐展开，顺着众人的目光就能找到佛陀。',[.72,1.04,-4.42],[.57,-3.0],object),
    step('cut','木版怎样画出衣褶','沿着佛陀的衣纹细看：密集的黑线与中间留下的纸色交替，把弯曲的膝与垂落的衣角区分开。再看榻边细纹，同样的木版刻线给出了不同的质感。',[.29,1.04,-4.52],[.20,-2.96],object),
    step('type','图像在哪里接上文字','卷面左半逐渐露出一行行直书文字。这件印本把印好的七张纸接成长卷；王玠为父母造经的日期见于原件卷末。本案影像止于卷首旁的文字，卷末可循馆藏记录查阅。',[-.96,1.04,-4.58],[-.82,-3.03],archive),
    step('sky','换到窗下，横读一卷星空','这张案上换成藏经洞的另一件藏品《敦煌星图》。分区天图里的点、线和星官名称相邻而列。平推卷面，天区从案上的同一处展开，疏密各不相同。',[-.12,1.24,-7.12],[-.1,-6.01],stars),
    step('pole','环绕天极的星官','移至卷的左部，逐区并列的天空变成围绕北天极的一幅图。先在图中找到向四周展开的星群，再与前面的分区画法比较。此处显示原卷天图部分，没有重绘星点。',[-.38,1.26,-7.17],[-.42,-6.04],stars)
  ],
  experience:{title:'从经卷到星图',medium:'双案展卷',cover:'assets/experience/print/print.webp',intro:'在唐馆的格窗前俯身读卷。转动卷轴，让说法图和经文铺开；再绕到窗前，横读另一卷纸上的星空。',sourceNote:'两卷各用本件图版；木案与格窗为展陈设计。',range:{label:'展开卷面',initial:.73,minLabel:'收卷',maxLabel:'展开'},stages:[
    {label:'开卷见佛',detail:'front',instruction:'轻推下方卷轴，看看图像从哪一边出现。',value:.70,fov:51},{label:'看刀线',detail:'cut',instruction:'从佛衣到莲座，比较密线与留白。',value:.81,fov:40},{label:'图接经文',detail:'type',instruction:'完全展开卷首，两种刻印如何共享同一张纸？',value:1},
    {label:'横移星图',detail:'sky',instruction:'来到第二张案前，推动横轴，依次阅读不同天区。',value:.05,range:starRange},
    {label:'寻北天极',detail:'pole',instruction:'图中点线由分区转为环极排列。慢慢移卷再看交界。',value:.92,range:starRange,fov:45}
  ]}
}};
