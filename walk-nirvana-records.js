// The east doorway is at z=0. In front of the west wall, south is left.
const academy = 'https://www.dha.ac.cn/info/1425/3663.htm';
const exhibition = 'https://www.zjam.org.cn/Topic/DunHuang/zyfg1.html';
const plate = n => 'https://dsr.nii.ac.jp/reference/pelliot/entry/1-0' + n + '.html.zh';
const archive = 'https://archive.org/details/dli.pahar.2105';
const detail = (id, title, text, anchor, stand, source) => ({id, title, text, anchor, stand, source});

const details = [
  detail('threshold', '进门先看见横卧的佛', '原窟东门面向西壁的长坛，佛首在南，双足在北。卧佛身长十五点六米，坛前没有塔柱。原址彩照拍下佛首、叠枕和肩部，身后是涅槃举哀图。', [-4.75, 2.78, -6.12], [0, -.87], academy),
  detail('cheek', '佛首倚着叠枕', '走到南端，能看清卧佛的右颊与枕相接。眼睑垂下，眉弓与唇角的曲线很轻。原址照片保留了佛首与叠枕相接的轮廓，肩上的衣褶从枕边向外舒展。', [-6.13, 2.65, -6.05], [-5.68, -2.45], academy),
  detail('kasyapa', '迦叶赶到佛首旁', '顺着佛首向南壁抬头。迦叶听闻导师入灭，赶到时向前扑去，左右的弟子扶着他。画师把赶来的动作留在卧佛头边，观者转过身，便能把同一场景里的动与静接起来看。', [-9.49, 3.1, -6.75], [-8.68, -5.78], plate(62)),
  detail('assembly', '西壁上相邻的两种表情', '一九〇八年的西壁照片里，卧佛的下身遮住了一部分壁画。上方可见层层头光和面孔。窟志还记载，像后举哀图的上层有十九身菩萨，下层有十七身罗汉，姿态各不相同。', [-3.18, 3.66, -10.15], [-3.15, -8.28], plate(63)),
  detail('guardians', '从头冠认出守护者', '再沿背壁向佛足方向走，头光之间出现带着兽形冠饰的护法。细看不同的眉眼和冠顶，能分辨这群来守护佛法的天龙八部。这里呈现的是一九〇八年拍到的西壁北段原画。', [4.65, 3.06, -10.15], [4.67, -8.32], plate(63)),
  detail('royals', '佛足一端的吊唁者', '沿西壁走到脚边，转向北壁。吐蕃赞普与中原帝王位于前列，搀扶、遮面和低首的身影由前向后排开。这里呈现的早期照片还留住了壁画后来损毁前的人物细节。', [9.49, 3.05, -6.70], [8.53, -6.51], plate(64)),
  detail('folds', '顺衣褶回到足端', '从脚边回到长坛前方。长衣沿腿部起伏，衣缘到了足端才让出相叠的双足。北壁早期照片同时拍进了佛足和后方的举哀者，可以看清塑像与画壁的位置关系。', [6.68, 2.01, -6.00], [6.28, -3.68], academy),
  detail('east', '回身看东壁的说法会', '回到门的北侧，转身看《金光明最胜王经变》。楼台、乐舞与听法的人群铺满壁面，下方又分出屏风式的故事画。入口两旁还藏着画面，离开卧佛时正好可以读到。', [4.60, 2.32, -.085], [3.34, -1.63], plate(57))
];
const stops = Object.fromEntries(details.map(d => [d.id, d.stand]));
const stages = [
  ['从东门入窟','threshold'], ['沿坛至佛首','cheek'], ['侧看南壁','kasyapa'],
  ['转入西壁','assembly'], ['循冠识护法','guardians'], ['走向北壁','royals'], ['回到坛前','folds'], ['回望东壁','east']
];
export const records = {
  'mogao-158': {
    width: 19.2, depth: 10.25, height: 6.54, mouthWidth: 3.2,
    kind: '横长盝顶涅槃窟', orientation: '原窟东门朝向西壁长坛，卧佛头在南，足在北，西壁在卧佛身后。展馆的环行路线连接不同部位的原址照片。',
    note: '敦煌研究院著录原窟横长17.20米、进深7.28米，卧佛长15.6米。展馆按佛首、壁画、佛足安排摄影驻足点，环行通道为参观所设。佛首采用论文发表的原址照片，壁面与佛足可对照1908年旧影。',
    sources: [
      {label:'敦煌研究院 · 第158窟形制、涅槃塑像与分壁故事', url:academy},
      {label:'浙江美术馆 · 三世佛及长方盝顶', url:exhibition},
      {label:'伯希和《敦煌石窟》第一卷 · 努瓦特原窟摄影', url:archive},
      {label:'敦煌研究院沙武田 · 南壁迦叶', url:plate(62)},
      {label:'敦煌研究院沙武田 · 西壁举哀', url:plate(63)},
      {label:'敦煌研究院沙武田 · 北壁王子', url:plate(64)}
    ],
    obstacles: [{x0:-7.96,x1:7.96,z0:-7.60,z1:-5.04},{x0:9.00,x1:9.6,z0:-3.54,z1:-1.66}],
    details,
    experience: {
      title:'沿卧佛走一周', medium:'涅槃窟环行',
      intro:'从西壁卧佛的佛首彩照起步，沿各壁历史照片读身后举哀的弟子、足端来吊唁的王子，最后回到东壁经变。',
      cover:'assets/authentic/mogao158/west-buddha.webp', credits:'./assets/authentic/mogao158/SOURCES.md',
      sourceNote:'佛首为原址彩照，四壁与佛足可对照努瓦特1908年的摄影。',
      stages:stages.map(([label, id]) => ({label, detail:id, instruction:details.find(d=>d.id===id).title}))
    },
    stroll: {name:'卧佛与三壁举哀', intro:'沿佛坛走一周，走到佛首、西壁和足端时，故事会随位置展开。',
      path:[stops.threshold,[-2.75,-2.25],stops.cheek,[-8.63,-3.86],stops.kasyapa,[-8.63,-8.27],
        stops.assembly,[.72,-8.30],stops.guardians,[8.52,-8.30],stops.royals,[8.52,-3.80],stops.folds,stops.east,stops.threshold]}
  }
};
