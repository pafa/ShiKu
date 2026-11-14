import {beginScene, waitForScene, sceneFailure, reveal} from './loading-screen.js';
import {publicEdition} from './public-media.js';
import {VISITORS,resolveVisitorId} from './visitor-roster.js';
import {getPendingAdmission} from './presence-client.js';
import {createQueueView} from './queue-view.js';

const find=id=>document.getElementById(id);
find('public-credits').hidden = !publicEdition;
const form=find('guest-form'), input=find('guest-name'), message=find('gate-message'), submit=find('join-room');
const registration=find('gate-register'), guide=find('gate-guide');
let chosen=VISITORS[0].id, joining=false;
let admissionAttempt=0, connection;
try{
  chosen=resolveVisitorId(localStorage.getItem('shiku-visitor'))||chosen;
  input.value=sessionStorage.getItem('shiku-guest-name')||'';
}catch{}
const params=new URL(location.href).searchParams;
const linkedId=resolveVisitorId(params.get('look'));
const linkedLook=VISITORS.find(v=>v.id===linkedId);
let requestedWalk=!!linkedLook&&params.get('walk')==='1';
if(linkedLook)chosen=linkedLook.id;
const pending=getPendingAdmission();
if(pending){
  input.value=pending.name;
  chosen=resolveVisitorId(pending.avatarId)||chosen;
}

let metricStart=0,admittedAt=0;
const sent=new Set();
const terminalEvents=new Set(['ready','timeout','failed','cancelled']);
const acceptsMetrics=()=>navigator.doNotTrack!=='1' && !navigator.globalPrivacyControl;
function metric(event){
  if(sent.has(event)||!acceptsMetrics())return;
  if(terminalEvents.has(event)&&[...terminalEvents].some(outcome=>sent.has(outcome)))return;
  sent.add(event);
  const entry=['cave','experience','structure'].some(key=>params.has(key))?'cave':params.has('work')?'work':'hall';
  const device=matchMedia('(pointer:coarse)').matches?'touch':'desktop';
  const since=['ready','artwork','audio_played'].includes(event)?admittedAt:metricStart;
  const elapsedMs=since?Math.round(performance.now()-since):0;
  void fetch('/api/visit-metric',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,
    headers:{'Content-Type':'application/json'},body:JSON.stringify({event,entry,device,elapsedMs})}).catch(()=>{});
}
let graphics;
function supportsGallery(){
  if(graphics!==undefined)return graphics;
  try{
    const context=document.createElement('canvas').getContext('webgl2',{powerPreference:'high-performance'});
    graphics=!!context;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }catch{graphics=false;}
  return graphics;
}
function openRegister(){
  if(!registration.open)registration.showModal();
  find('gate-title').focus({preventScroll:true});
}
find('open-registration').onclick=openRegister;
find('arrival-guide').onclick=()=>guide.showModal();
for(const dialog of [registration,guide]){
  dialog.querySelector('.entrance-close').onclick=()=>{if(!joining)dialog.close();};
  dialog.addEventListener('cancel',e=>{if(joining)e.preventDefault();});
  dialog.addEventListener('click',e=>{
    if(joining||e.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
  });
}
const suggestions=['听泉','青禾','云岫','南山','白榆','照水','寻鹿','秋山','临溪','疏桐','观澜','见山','松月','行舟','子衿','望舒'];
let index=Math.floor(Math.random()*suggestions.length);
find('suggest-name').onclick=()=>{
  index=(index+1)%suggestions.length;input.value=suggestions[index];input.setCustomValidity('');message.textContent='';input.focus();
};
input.oninput=()=>{input.setCustomValidity('');message.textContent='';};
for(const v of VISITORS){
  const label=document.createElement('label'),radio=document.createElement('input'),img=document.createElement('img');
  label.className='look-option';label.title=v.label+' · '+v.description;
  radio.type='radio';radio.name='avatar';radio.value=v.id;radio.setAttribute('aria-label',v.label+'，'+v.description);
  radio.checked=v.id===chosen;
  if(radio.checked)find('chosen-look').textContent=v.label;
  radio.onchange=()=>{if(radio.checked){chosen=v.id;find('chosen-look').textContent=v.label;}};
  img.src=v.portrait;img.alt='';img.draggable=false;
  const caption=document.createElement('span'),tag=document.createElement('small'),name=document.createElement('strong');
  caption.className='look-caption';tag.textContent=v.gender==='female'?'女访客':'男访客';name.textContent=v.label;
  caption.append(tag,name);label.append(radio,img,caption);find('guest-looks').append(label);
}
const inspect=find('inspect-look');
const controls=[submit,input,inspect,find('suggest-name'),form.querySelector('fieldset'),registration.querySelector('.entrance-close')];
function setJoining(value){
  joining=value;
  for(const control of controls)control.disabled=value;
  if(value)form.setAttribute('aria-busy','true');
  else form.removeAttribute('aria-busy');
}
const queue=createQueueView(registration,()=>{
  metric('cancelled');++admissionAttempt;
  void connection?.presence.leave();
  queue.hide();
  setJoining(false);
  message.textContent='已退出排队。';
  input.focus({preventScroll:true});
});
inspect.onclick=async()=>{
  try{
    inspect.disabled=true;
    const {openGuestStudio}=await import('./guest-studio.js');
    if(joining||!registration.open)return;
    const startWalking=requestedWalk;requestedWalk=false;
    await openGuestStudio({avatarId:chosen,startWalking,trigger:inspect,onChoose(id){
      const radio=Array.from(form.elements.avatar).find(r=>r.value===id);
      if(radio){radio.checked=true;radio.dispatchEvent(new Event('change'));}
    }});
  }catch{message.textContent='人物预览未能载入，可重新打开。';}
  finally{inspect.disabled=joining;}
};
form.onsubmit=async event=>{
  event.preventDefault();if(joining)return;
  const name=input.value.normalize('NFC').trim().replace(/\s+/gu,' ');
  if(!name||[...name].length>20||/[\p{C}\u2028\u2029]/u.test(input.value)){
    input.setCustomValidity('请填写 1 到 20 个可显示的字。');input.reportValidity();return;
  }
  sent.clear();metricStart=performance.now();metric('submitted');
  if(!supportsGallery()){
    metric('failed');find('graphics-help').hidden=false;find('graphics-help').querySelector('a').focus();
    return;
  }
  const attempt=++admissionAttempt;
  setJoining(true);
  message.textContent='正在连接展馆…';
  const avatarId=chosen;
  try{
    connection=await import('./shared-visit.js');
    if(attempt!==admissionAttempt)return;
    await connection.enterVisit({name,avatarId},{onQueue(state){
      if(attempt===admissionAttempt){metric('queued');queue.update({name},state);}
    }});
    if(attempt!==admissionAttempt)return;
    admittedAt=performance.now();metric('admitted');
    try{sessionStorage.setItem('shiku-guest-name',name);localStorage.setItem('shiku-visitor',avatarId);}catch{}
    if(linkedLook){
      const url=new URL(location.href);url.searchParams.delete('look');url.searchParams.delete('walk');history.replaceState(history.state,'',url);
    }
    const museum=find('museum');
    beginScene(()=>{metric('cancelled');return connection?.presence.leave();});
    registration.close();queue.hide();find('arrival').hidden=true;
    museum.hidden=false;museum.inert=true;
    let app;
    try{
      const mode=await waitForScene(async()=>{
        app=await import('./museum.js');
        return app.initialScene;
      });
      if(mode==='catalogue'){
        metric('failed');await connection.presence.leave();location.replace('exhibition-guide.html');return;
      }
      if(mode==='failed')throw Error('场景未能完整载入。');
      museum.inert=false;reveal();
      find('world').querySelector('canvas')?.focus({preventScroll:true});
      app.openInitialView(acceptsMetrics()?metric:null);metric('ready');
    }catch(error){
      museum.inert=true;museum.hidden=true;
      app?.stopInitialScene();
      metric(error?.name==='SceneTimeout'?'timeout':'failed');sceneFailure();
      void connection?.presence.leave();
    }
  }catch(error){
    if(attempt!==admissionAttempt)return;
    metric('failed');connection?.presence.leave();
    find('museum').hidden=true;find('museum').inert=true;find('arrival').hidden=false;
    queue.hide();setJoining(false);openRegister();
    message.textContent=error?.message&&/[\u4e00-\u9fff]/u.test(error.message)?error.message:'共游服务暂未连接。请确认展馆已启动，然后再次进入。';
  }
};

export function activateEntry(){
  metric('landing');
  if(pending&&supportsGallery()){openRegister();form.requestSubmit();}
  else if(linkedLook){openRegister();inspect.click();}
}
export function readyPortraits(){return Promise.all([...find('guest-looks').querySelectorAll('img')].map(img=>img.decode()));}
