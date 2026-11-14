import {presence,visit} from './shared-visit.js';

function button(text,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b;}
export function mountVisitAccount(body){
  const row=document.createElement('div');row.className='guest-account';
  const name=document.createElement('strong');name.textContent=visit.profile.name;
  const status=document.createElement('span');status.className='guest-network';status.setAttribute('role','status');
  const invite=button('邀请同行',async()=>{
    const urlField=row.querySelector('.guest-invite');
    if(urlField){urlField.remove();invite.setAttribute('aria-expanded','false');return;}
    invite.disabled=true;
    try{
      const info=await fetch('/api/room',{cache:'no-store'}).then(r=>r.json());
      const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
      const url=local?info.lanUrls?.[0]:location.origin+'/';
      const box=document.createElement('div');box.className='guest-invite';
      if(url){
        const lead=document.createElement('span');lead.textContent=local||info.lanUrls?.length?'同一局域网内，打开这个地址即可同行。':'把这个地址发给朋友，打开后即可同行。';
        const field=document.createElement('input');field.readOnly=true;field.value=url;field.setAttribute('aria-label','共游邀请地址');
        const copy=button('复制地址',async()=>{
          try{
            if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url);
            else {field.focus();field.select();if(!document.execCommand('copy'))throw Error();}
            copy.textContent='已复制';
          }catch{field.focus();field.select();lead.textContent='已选中邀请地址，可手动复制。';}
        });
        box.append(lead,field,copy);
      }else{box.textContent='当前服务只在本机开放。用项目内「打开石窟」的局域网模式可邀请同一网络的设备。';}
      row.append(box);invite.setAttribute('aria-expanded','true');
    }catch{status.textContent='暂时无法取得邀请地址，可重试。';}
    finally{invite.disabled=false;}
  });
  invite.setAttribute('aria-expanded','false');
  const exit=button('离馆',async()=>{exit.disabled=true;try{await presence.leave();}finally{location.reload();}});
  row.append(name,status,invite,exit);body.prepend(row);
  return function update(state){
    status.textContent=state.status==='online'?state.snapshot.visitors.length+' 人在馆':state.status==='reconnecting'?'正在恢复连接':'连接中…';
  };
}
