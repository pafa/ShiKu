import {presence,visit} from './shared-visit.js';

function button(text,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b;}
export function mountVisitAccount(body,placeAddress){
  const row=document.createElement('div');row.className='guest-account';
  const name=document.createElement('strong');name.textContent=visit.profile.name;
  const status=document.createElement('span');status.className='guest-network';status.setAttribute('role','status');
  let expanded=null;
  let request=0;
  function shareButton(label,atPlace){
    const control=button(label,async()=>{
      const serial=++request;
      row.querySelector('.guest-invite')?.remove();
      expanded?.setAttribute('aria-expanded','false');
      if(expanded===control){expanded=null;return;}
      expanded=control;control.setAttribute('aria-expanded','true');
      const box=document.createElement('div');box.className='guest-invite';row.append(box);
      try{
        const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
        const base=local?(await fetch('/api/room',{cache:'no-store'}).then(r=>r.json())).lanUrls?.[0]:location.origin+'/';
        if(serial!==request||!box.isConnected)return;
        if(!base && !atPlace){box.textContent='当前服务只在本机开放。使用局域网模式可邀请同一网络的设备。';return;}
        const url=new URL(base||location.origin);
        url.search=atPlace?placeAddress():'';
        const lead=document.createElement('span');
        lead.textContent=atPlace?(local&&!base?'此地址可在本机重开这一站。':'打开后将到达这一站。'):'把这个地址发给朋友，留名后即可同行。';
        const field=document.createElement('input');field.readOnly=true;field.value=url.href;
        field.setAttribute('aria-label',atPlace?'本站地址':'共游邀请地址');
        const copy=button('复制地址',async()=>{
          try{
            if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url.href);
            else {field.focus();field.select();if(!document.execCommand('copy'))throw Error();}
            copy.textContent='已复制';
          }catch{field.focus();field.select();lead.textContent='已选中地址，可手动复制。';}
        });
        box.append(lead,field,copy);
      }catch{if(serial===request)box.textContent='暂时无法取得地址，关闭后可重试。';}
    });
    control.setAttribute('aria-expanded','false');return control;
  }
  const exit=button('离馆',async()=>{exit.disabled=true;try{await presence.leave();}finally{location.reload();}});
  row.append(name,status,shareButton('邀请同行',false),shareButton('分享这一站',true),exit);body.prepend(row);
  return function update(state){
    status.textContent=state.status==='online'?state.snapshot.visitors.length+' 人在馆':state.status==='reconnecting'?'正在恢复连接':'连接中…';
  };
}
