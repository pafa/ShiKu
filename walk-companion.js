import {evidenceAt} from './chamber-evidence.js';
import {mediaLabel} from './authentic-display.js';
// Browsers only fetch the fixed Mandarin recordings bundled with the museum.
const voiceEdition = 'cn-guide-2';

function galleryVoice(change) {
  const player = new Audio();
  player.preload = 'none';
  let enabled = false, blocked = false, suspended = false;
  let pointKey = '', loadedKey = '', generation = 0;
  let starting = false;

  function clearTrack() {
    generation++;
    starting = false;
    if (!loadedKey) return;
    loadedKey = '';
    player.pause();
    player.removeAttribute('src');
    player.load();
  }

  function failed() {
    blocked = true;
    enabled = false;
    clearTrack();
    change();
  }

  function play() {
    if (!enabled || suspended || !pointKey || starting) return;
    if (loadedKey === pointKey && (!player.paused || player.ended)) return;
    if (loadedKey !== pointKey) {
      loadedKey = pointKey;
      player.src = './assets/walk/voices/' + encodeURIComponent(pointKey) + '.mp3?v=' + voiceEdition;
    }
    const request = ++generation;
    starting = true;
    player.play().then(() => {
      if (generation === request) starting = false;
    }).catch(() => {
      if (generation === request) failed();
    });
  }

  function point(cave, index) {
    const detail = cave?.details[index];
    const next = detail ? cave.id + '--' + detail.id : '';
    if (next === pointKey) return;
    clearTrack();
    pointKey = next;
    play();
  }

  function suspend(value) {
    if (suspended === value) return;
    suspended = value;
    if (suspended) {
      generation++;
      starting = false;
      player.pause();
    } else {
      play();
    }
  }

  function toggle() {
    enabled = !enabled;
    blocked = false;
    if (enabled) play();
    else clearTrack();
    change();
  }

  player.addEventListener('error', () => {
    if (loadedKey && player.error) failed();
  });
  const active = () => enabled && !suspended && (starting || (!player.paused && !player.ended));
  return {point, toggle, active, suspend, enabled: () => enabled, blocked: () => blocked};
}
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const passages={
  'mogao-158':['从东门望向整条佛坛。','沿着卧佛朝佛首一端走，留意枕面渐渐露出的侧边。','从枕边转向南壁，迦叶赶到的场景就在这一端。','沿展陈预留的通道转到佛身后。西壁上的人群分成上下两排。','继续沿西壁向北走。留意画面中不同于弟子的头冠。','沿长壁走向佛足，北壁画着另一群前来吊唁的人。','从佛足旁转过坛角，再回看长衣和双足的起伏。','从坛前转回门边。这一次看的，是进门时背对的东壁。'],
  'longmen-1280':['站在石阶下，把三面龛壁放在同一个视野里。','沿第一段石阶上去。两翼逐渐展开，岩檐上的方孔也更容易辨认。','走过中间的平台，继续登上第二段石阶。','踏上露台向大佛走近，目光从整座龛的轮廓移向佛面。','从佛面向下看到莲座。越靠近，重叠的石瓣越有深度。','向北侧横移，原先并列在大佛身旁的造像逐一分开。','转向北壁。这里的天王和力士，与正壁的弟子、菩萨朝向不同。']
};
export function walkCompanion({world,go,closeSheet,read,leave}){
  const host=$('#walk-companion'),museum=$('#museum'),speech=$('#stroll-sound'),legacy=$('#cave-audio');
  let cave=null,detail=-1,state=null,quiet=false,pausedByButton=false,leaving=false;
  const voice=galleryVoice(soundUI);
  function soundUI(){
    for (const button of [speech, legacy]) {
      button.setAttribute('aria-pressed', String(voice.enabled()));
      button.textContent = voice.enabled() ? '关闭讲解' : voice.blocked() ? '重试普通话讲解' : '听普通话讲解';
    }
    host.dataset.sound=voice.enabled()?'on':'off';
  }
  speech.onclick=legacy.onclick=()=>voice.toggle();
  function setQuiet(v){quiet=!!v;host.dataset.quiet=String(quiet);museum.dataset.walkQuiet=String(quiet);$('#stroll-quiet').textContent=quiet?'显示故事':'收起故事';$('#stroll-quiet').setAttribute('aria-expanded',String(!quiet));}
  function render(){
    const c=cave,isWalk=!!c?.stroll;host.hidden=!isWalk;museum.dataset.stroll=String(isWalk);if(!isWalk)return;
    const stateHere=state?.id===c.id?state:null,mode=stateHere?.status||'free',stages=c.experience.stages;
    const at=stateHere?.index??-1,walking=mode==='walking',reading=mode==='reading',finished=mode==='complete';
    const shown=reading?stateHere.detailIndex:detail,d=c.details[shown];
    host.dataset.status=mode;host.dataset.cave=c.id;host.dataset.detail=(!walking&&d)?d.id:'';
    $('#stroll-place').textContent=c.id==='mogao-158'?'敦煌 · 莫高窟第158窟':'洛阳 · 龙门奉先寺';
    const atLabel=at>=0?pad(at+1)+' / '+pad(stages.length):'';
    $('#stroll-state').textContent=({walking:stateHere?.returning?'环行返程':'行进中',reading:'驻足',paused:'自由驻足',complete:'走读完成',free:'自由行走'})[mode]+(atLabel?'　'+atLabel:'');
    const title=walking?(stateHere.returning?'沿坛回到东门':(stages[at]?.label||'前往下一处')):finished?(c.id==='mogao-158'?'回到卧佛前的东门':'回望大像龛'):(d?.title||c.stroll.name);
    const attribution=$('#stroll-attribution');
    const plate=d && !walking && !finished?evidenceAt(c,shown):null;
    attribution.textContent=!walking&&!finished&&d?(plate?mediaLabel(plate)+' · '+plate.credit:'窟志记载') : '';
    const body=walking?(stateHere.returning?'循佛坛外侧回到来时的位置。':(passages[c.id]?.[at]||'沿途可以拖动环顾，或用方向键接过脚步。')):finished?(c.id==='mogao-158'?'从佛首、背后的举哀图到佛足，你已经绕回入口。接下来可以自由走看，或沿崖廊回馆。':'从阶下的全景，到近前的面容与衣纹，再到北壁的护法。留在这里自由走看，或沿石阶下行回馆。'):(d?.text||c.stroll.intro);
    if($('#stroll-title').textContent!==title)$('#stroll-title').textContent=title;
    if($('#stroll-copy').textContent!==body)$('#stroll-copy').textContent=body;
    const line=$('#stroll-line');if(line.childElementCount!==stages.length){
      line.replaceChildren(...stages.map(()=>document.createElement('i')));
    }
    const idx=at>=0?at:stages.findIndex(s=>s.detail===d?.id);
    [...line.children].forEach((seg,i)=>{seg.className=i===idx?'now':stateHere&&i<idx?'seen':'';});
    $('#stroll-switch').textContent=walking||reading?'停在这里':mode==='paused'?'继续同行':finished?'重新走一遍':'随讲解走';
    $('#stroll-file').textContent=c.id==='longmen-1280'?'龛志':'窟志';
  }
  function setPoint(){
    if(!cave||leaving||pausedByButton){voice.point(null,-1);return;}
    const live=state?.id===cave.id?state:null;
    const i=live?.status==='walking'||live?.status==='complete'?-1:live?.status==='reading'?live.detailIndex:detail;
    voice.point(cave,i);
  }
  function departure(value) {
    if (leaving === value) return;
    leaving = value;
    setPoint();
  }
  function enter(c){
    if(cave?.id!==c?.id){voice.point(null,-1);cave=c;detail=-1;state=null;pausedByButton=false;setQuiet(false);releaseStick();}
    render();
  }
  function observe(c,i){
    if(c?.id!==cave?.id||i===detail)return;
    detail=i;if(state?.status==='paused'&&pausedByButton)pausedByButton=false;
    setPoint();render();
  }
  function progress(s){
    state=s;setPoint();render();
  }
  function begin(c,at=0,how='direct'){
    const w=world();if(!w){read(c);return;}
    closeSheet();
    const d=c.details.findIndex(v=>v.id===c.experience.stages[at]?.detail);if(d<0)return;
    function start(){pausedByButton=false;w.setPaused(false);
      if(!w.startStroll(c.id,{at})){render();}
    }
    if(how==='walk'){go(c,d,start);return;}
    w.setPaused(false);w.enterCave(c.id,d);
    if(how==='entry'&&matchMedia('(prefers-reduced-motion: reduce)').matches){w.setView(true);w.lookAtDetail(d);return;}
    start();
  }
  $('#stroll-switch').onclick=()=>{
    if(!cave)return;const w=world();
    if(['walking','reading'].includes(state?.status)){pausedByButton=true;w.pauseStroll();voice.point(null,-1);}
    else if(state?.status==='paused'){pausedByButton=false;w.resumeStroll();setPoint();}
    else {const at=state?.status==='complete'?0:Math.max(0,cave.experience.stages.findIndex(s=>s.detail===cave.details[detail]?.id));pausedByButton=false;w.startStroll(cave.id,{at});}
  };
  $('#stroll-file').onclick=()=>read(cave);$('#stroll-leave').onclick=()=>{world()?.stopStroll();leave();};
  $('#stroll-quiet').onclick=()=>setQuiet(!quiet);
  function silencedByOverlay(){
    const suspended = document.hidden || !!document.querySelector('dialog[open]');
    voice.suspend(suspended);
    if (suspended) releaseStick();
  }
  for(const dlg of document.querySelectorAll('dialog'))new MutationObserver(silencedByOverlay).observe(dlg,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',silencedByOverlay);
  const stick=$('#stroll-stick'),thumb=stick.querySelector('i');let holding=null;
  function releaseStick(){holding=null;thumb.style.transform='translate(0px,0px)';stick.classList.remove('held');world()?.setStrollInput?.(0,0);}
  function steer(e){
    if(e.pointerId!==holding)return;
    const r=stick.getBoundingClientRect(),rx=r.width*.37,ry=r.height*.37;
    let x=(e.clientX-r.left-r.width/2)/rx,y=(e.clientY-r.top-r.height/2)/ry;
    const len=Math.max(1,Math.hypot(x,y));x/=len;y/=len;
    thumb.style.transform='translate('+x*13+'px,'+y*13+'px)';world()?.setStrollInput(-y,x);
  }
  stick.onpointerdown=e=>{if(holding!==null)return;e.preventDefault();pausedByButton=false;holding=e.pointerId;stick.setPointerCapture(holding);stick.classList.add('held');steer(e);};
  stick.onpointermove=steer;stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=releaseStick;window.addEventListener('blur',releaseStick);
  silencedByOverlay();
  soundUI();
  return {enter,observe,progress,begin,departure,isNarrating:voice.active};
}
