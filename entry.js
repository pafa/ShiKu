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
  ++admissionAttempt;
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
  const attempt=++admissionAttempt;
  setJoining(true);
  message.textContent='正在连接展馆…';
  const avatarId=chosen;
  try{
    connection=await import('./shared-visit.js');
    if(attempt!==admissionAttempt)return;
    await connection.enterVisit({name,avatarId},{onQueue(state){
      if(attempt===admissionAttempt)queue.update({name},state);
    }});
    if(attempt!==admissionAttempt)return;
    try{sessionStorage.setItem('shiku-guest-name',name);localStorage.setItem('shiku-visitor',avatarId);}catch{}
    if(linkedLook){
      const url=new URL(location.href);url.searchParams.delete('look');url.searchParams.delete('walk');history.replaceState(history.state,'',url);
    }
    const museum=find('museum');
    beginScene(()=>connection?.presence.leave());
    registration.close();queue.hide();find('arrival').hidden=true;
    museum.hidden=false;museum.inert=true;
    let app;
    try{
      const mode=await waitForScene(async()=>{
        app=await import('./museum.js');
        return app.initialScene;
      });
      if(mode==='failed')throw Error('场景未能完整载入。');
      museum.inert=false;reveal();
      find('world').querySelector('canvas')?.focus({preventScroll:true});
      app.openInitialView();
    }catch{
      museum.inert=true;museum.hidden=true;
      app?.stopInitialScene();
      sceneFailure();
      void connection?.presence.leave();
    }
  }catch(error){
    if(attempt!==admissionAttempt)return;
    connection?.presence.leave();
    find('museum').hidden=true;find('museum').inert=true;find('arrival').hidden=false;
    queue.hide();setJoining(false);openRegister();
    message.textContent=error?.message&&/[\u4e00-\u9fff]/u.test(error.message)?error.message:'共游服务暂未连接。请确认展馆已启动，然后再次进入。';
  }
};

export function activateEntry(){
  if(pending){openRegister();form.requestSubmit();}
  else if(linkedLook){openRegister();inspect.click();}
}
export function readyPortraits(){return Promise.all([...find('guest-looks').querySelectorAll('img')].map(img=>img.decode()));}
