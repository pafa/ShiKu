// This module deliberately has no static imports: failed entry/scene imports still have a recovery UI.
const $=id=>document.getElementById(id),cover=$('visit-cover'),bar=$('cover-progress');
let mode='arrival',timer,releaseSeat;
const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
function recovery(){ $('cover-recovery').hidden=false; }
function advance(value,stage,count=''){
  bar.value=Math.max(bar.value,value);$('cover-step').textContent=stage;$('cover-count').textContent=count;
}
function caption(value){if($('cover-caption').textContent!==value)$('cover-caption').textContent=value;}
function restartTimer(){
  clearTimeout(timer);timer=setTimeout(()=>{recovery();caption('网络较慢，可以继续等候，也可以重新加载。');},20000);
}
$('cover-retry').addEventListener('click',e=>{e.preventDefault();Promise.race([Promise.resolve(releaseSeat?.()).catch(()=>{}),new Promise(r=>setTimeout(r,500))]).finally(()=>location.reload());});
export function reveal(){
  clearTimeout(timer);mode='done';releaseSeat=null;bar.value=100;cover.hidden=true;
}
export function beginScene(leave){
  mode='scene';releaseSeat=leave;bar.value=0;cover.hidden=false;$('cover-recovery').hidden=true;
  $('cover-title').textContent='步入展馆';$('cover-kicker').textContent='入馆　／　空间准备';
  caption('正在展开通往展厅的步道。');advance(12,'已取得入馆名额','1 / 4');
  cover.focus({preventScroll:true});restartTimer();
}
export function sceneProgress(step,done=0,total=0){
  if(mode!=='scene')return;
  if(step==='building'){advance(30,'展陈与建筑','2 / 4');caption('正在布置展厅与驻足点。');}
  if(step==='objects'){
    advance(38+(total?Math.floor(48*done/total):0),'首景图像与材质',total?done+' / '+total:'3 / 4');
    caption('正在准备身边的造像、图像与材质。');
  }
  if(step==='frame'){advance(94,'首帧绘制','4 / 4');caption('展厅已就绪，正在点亮画面。');}
  restartTimer();
}
export async function waitForScene(task){
  let deadline;
  try{
    await paint();
    return await Promise.race([task(),new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('载入超时')),180000);})]);
  }finally{clearTimeout(deadline);}
}
export function sceneFailure(){
  mode='failed';clearTimeout(timer);cover.hidden=false;$('cover-title').textContent='暂未能开馆';
  caption('部分必要资源没有载入。请检查网络后重试，或先阅读展览图册。');$('cover-step').textContent='加载中断';$('cover-count').textContent='';recovery();$('cover-retry').focus({preventScroll:true});
}
export function sceneActive(){return mode==='scene';}
let steps=0;
function homeProgress(){if(mode==='arrival')advance(++steps*28,'迎宾全景与访客入口',steps+' / 3');}
cover.dataset.boot='started';restartTimer();
const app=import('./entry.js').then(x=>{homeProgress();return x;});
let initialDeadline;
Promise.race([Promise.all([app,$('gate-landscape').decode().then(homeProgress),app.then(x=>x.readyPortraits()).then(homeProgress)]),
  new Promise((_,reject)=>{initialDeadline=setTimeout(()=>reject(Error('入口载入超时')),90000);})])
  .then(async ([entry])=>{clearTimeout(initialDeadline);bar.value=100;await paint();$('arrival').hidden=false;$('arrival').inert=false;reveal();entry.activateEntry();})
  .catch(()=>{clearTimeout(initialDeadline);sceneFailure();});
