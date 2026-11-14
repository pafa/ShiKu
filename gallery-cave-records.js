// Each room interprets a documented feature with a licensed view. These metres size the exhibition, not the surveyed cave.
import {works} from './dynasty-exhibition.js';

const catalogue = new Map(works.map(work => [work.id, work]));

function room(id, width, depth, height, mouthWidth, kind, profile, stops) {
  const work = catalogue.get(id);
  return [id,{width,depth,height,mouthWidth,kind,profile,orientation:work.feature,
    note:work.feature+' 展室按这件作品的图像安排步行距离、顶面与观察方向；全窟尺度及照片以外的造像另见原址资料。',
    sources:[{label:work.sourceName||'原址与图录资料',url:work.source}],obstacles:[],
    details:stops.map(([key,title,text,mount,stand,frame,point,ratio])=>{
      const anchor=mount==='left'?[-width/2,2,-depth*.62]:mount==='right'?[width/2,2,-depth*.62]:mount==='roof'?[0,height,-depth*.58]:[0,2.35,-depth];
      return {id:key,title,text,anchor,stand,mount,frame,point,ratio,source:work.source};
    })
  }];
}

export const records=Object.fromEntries([
  room("yungang-19",14,9,7,6,"大像与耳洞","vault",[
    ["overview","仰望主窟顶下的坐佛","从胸前的举手看向头顶。身后和身旁的层状岩面围住佛身，东西耳洞里的另两尊大佛在这个镜头之外。","back",[0,-2.7],"assets/east/y19.jpg",[0.43,0.53],1.33333],
    ["detail","走近斜向的衣褶","沿着举手一侧看下去，衣纹从肩部斜过胸前。对照指尖和面孔，就能体会近处的手怎样被低机位放大。","back",[-1.25,-5.1],"assets/east/y19.jpg",[0.56,0.67],1.33333]
  ]),
  room("yungang-18",11,12,7.4,3,"立佛和围绕的弟子","vault",[
    ["overview","仰读千佛袈裟","从脚边向上望，主尊的袈裟上密密排着小佛。顺衣纹再看向两侧，就会发现石壁上还有体量更大的侍从。","back",[0,-3.6],"assets/photo/yungang-18.jpg",[0.47,0.64],1.33333],
    ["detail","侧望立佛近旁的面孔","向右移一步，看看主佛身旁一层层探出的面孔。眉弓、鼻尖和下颌投下的暗影，把这些人物同较平的岩壁分开。","back",[-1.25,-6.8],"assets/photo/yungang-18.jpg",[0.79,0.53],1.33333]
  ]),
  room("yungang-5",10,12,7.8,3.4,"穹顶下的大佛","vault",[
    ["overview","仰看眉弓与鼻梁","主佛面部的凸起接住来自窟前的光。眼睑略垂，鼻梁两边形成暗面。今日所见的敷金表面保留着后代修饰的历史。","back",[0,-3.6],"assets/east/y5.jpg",[0.5,0.48],0.77283],
    ["detail","留意发际的设色","沿大佛额头向上看，面上金色到了发际突然换成蓝色。近照允许我们比较表面颜色，岩芯内部的情况还需依据调查。","back",[-1.25,-6.8],"assets/east/y5.jpg",[0.5,0.22],0.77283]
  ]),
  room("yungang-8",6,13,4.9,3,"门道两侧的护法","passage",[
    ["overview","转向门道西壁","入门以后转身，可以看到门侧浮雕伸出的手臂。鸠摩罗天的多臂身体刻在狭长的门壁上，观看时要上下移动目光。","left",[0,-3.9],"assets/east/y8.jpg",[0.53,0.35],0.75],
    ["detail","顺着孔雀看向上方","护法下方的孔雀与人物共用一面岩壁。从坐骑向上观察，轮廓在浮雕的边缘和门壁表面之间交替出现。","left",[-1.25,-7.4],"assets/east/y8.jpg",[0.5,0.73],0.75]
  ]),
  room("yungang-9",10,13,6,4,"前室仿木门面","gable",[
    ["overview","看龛旁的檐口","先看佛龛两旁一层层挑出的屋檐。瓦垄紧贴着石面，梁上细小的构件把原来属于木建筑的做法留在崖壁上。","back",[0,-3.9],"assets/east/y9.jpg",[0.78,0.37],1.33333],
    ["detail","回看龛内的坐像","从檐角向内移动，龛里的坐像正对外面。龛口的明暗边界分开了人物和屋面，两者却都由同一面山石刻出。","back",[-1.25,-7.4],"assets/east/y9.jpg",[0.48,0.58],1.33333]
  ]),
  room("yungang-13",11,10,7,4.4,"主尊与托臂力士","tall",[
    ["overview","看两种不同的尺度","主佛的一只手举在胸前，肘下的小力士则仰身向上托举。先找出大像的肘，再顺着垂直方向向下，就能找到小像。","back",[0,-3.0],"assets/east/y13.jpg",[0.39,0.73],0.75],
    ["detail","从托点望回手掌","走向侧边再看举起的手掌。手和肘离开身躯形成空隙，较小的力士恰好位在悬臂下方，把结构的支点变成故事中的身体。","back",[-1.25,-5.7],"assets/east/y13.jpg",[0.25,0.46],0.75]
  ]),
  room("longmen-20",12,11,6,4.8,"潜溪寺的佛与胁侍","tall",[
    ["overview","先看正壁造像","潜溪寺坐佛在须弥座上。照片里主尊胸前的衣褶和身旁较窄的身影给出两种尺度，视线自然从旁边移向中央。","back",[0,-3.3],"assets/east/qianxi.jpg",[0.51,0.54],0.66667],
    ["detail","沿衣缘向下看","留意衣缘从胸前向下延伸的转折。与胁侍接近竖直的轮廓并看，褶线本身就在提示谁坐着，谁站着。","back",[-1.25,-6.3],"assets/east/qianxi.jpg",[0.37,0.59],0.66667]
  ]),
  room("longmen-140",11,12,6.3,3.5,"宾阳中洞的彩饰与门卫","tall",[
    ["overview","沿彩色边带找小像","上部装饰带里，细小人物的头光与残留的红色边饰交替出现。沿着同一高度横向看，更容易分清相邻的像。","back",[0,-3.6],"assets/east/binyang.jpg",[0.65,0.48],1.5],
    ["detail","转身看门侧力士","走向入口一侧。力士屈起手臂，掌心面向窟外。前面看过的彩饰在高处，这身石刻却在出入门口的人身边。","left",[-1.25,-6.8],"assets/gallery-east/binyang-guardian.webp",[0.52,0.36],0.6665]
  ]),
  room("longmen-159",12,9,6,4,"宾阳南洞的正壁群像","tall",[
    ["overview","先辨坐佛的轮廓","正壁的坐佛和一旁立像同处一面石壁。明暗变化描出坐像宽阔的肩部，与近旁细长的身影形成对照。","back",[0,-2.7],"assets/east/south.jpg",[0.74,0.51],1.5],
    ["detail","看坐佛身侧的立像","目光从主佛移向左边，较小的身影依次排开。它们与主尊之间留下窄窄的岩面，使每个身体的外轮廓仍然可辨。","back",[-1.25,-5.1],"assets/east/south.jpg",[0.39,0.55],1.5]
  ]),
  room("longmen-1443",8,14,5.8,3.4,"古阳洞壁上的小龛","vault",[
    ["overview","沿着龛口观察层次","靠近壁面，先找出雕得较深的一处龛口。相邻小龛有高有低，供养人选择的位置不同，后来的造像逐渐填进余下的石面。","left",[0,-4.2],"assets/east/guyang.jpg",[0.48,0.51],1.5],
    ["detail","在龛与龛之间找文字","再走近一段，留意龛边较平整的石面。古阳洞有许多造像记，记录发愿者与造像缘由。要逐字阅读仍应转看经过校核的拓本。","left",[-1.25,-8.0],"assets/east/guyang.jpg",[0.3,0.6],1.5]
  ]),
  room("longmen-2194",9,13,5.3,3.5,"看经寺的罗汉行列","passage",[
    ["overview","沿壁读两身罗汉","壁基上的两身罗汉站在同一水平线上，衣摆接近脚面。先看距你最近的一身，再沿着连续的底线向下一身移动。","right",[0,-3.9],"assets/east/kanjing.jpg",[0.38,0.51],1.5],
    ["detail","比较双手的位置","看另一幅现场摄影，两个相邻人物一身收臂于胸前，一身双手置于腹前。石面虽然失去不少细节，姿态之间的差异仍看得出来。","right",[1.25,-7.4],"assets/gallery-east/kanjing-pair.webp",[0.6,0.54],1.5]
  ]),
  room("maijishan-37",7,8,4.5,3,"隋代佛像近观","tall",[
    ["overview","比较面部与衣领","黑白近照里，深色面部和较亮的衣服相接。先沿发际、眉弓、耳垂看一遍，再看下面层层叠过的领口。","back",[0,-2.4],"assets/collection/maiji/37.jpg",[0.51,0.36],0.66927],
    ["detail","沿衣纹走向肩头","衣领在颈下交会，衣褶从胸前斜着绕向肩部。只看光落在凸棱上的细亮线，也能辨认衣物垂落的方向。","back",[-1.25,-4.6],"assets/collection/maiji/37.jpg",[0.52,0.7],0.66927]
  ]),
  room("maijishan-127",12,8,5.2,3.6,"帐顶前披的本生故事","gable",[
    ["overview","仰看帐顶前披","朝斜披抬头，山林和人物铺在一条横长的画带里。这是睒子本生，原作位于帐顶前披；画幅两头随顶披斜边逐渐收窄。","roof",[0,-2.4],"assets/west/mj127.jpg",[0.45,0.57],6.59509],
    ["detail","从山形中寻找人物","从较远处看像是连续的山林，走近一些，才容易在树石之间发现细小的人物。站到画带另一端，再把他们所处的位置连起来看。","roof",[-1.25,-4.6],"assets/west/mj127.jpg",[0.67,0.56],6.59509]
  ]),
]);
