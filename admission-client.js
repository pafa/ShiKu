// A ticket belongs to this tab. Retain it across reloads without exposing it in
// the URL, map events or localStorage shared by unrelated museum visits.
const storageKey='shiku-admission-v1';
export function getPendingAdmission(){
  try {
    const record=JSON.parse(sessionStorage.getItem(storageKey));
    if(record && typeof record.name==='string' && typeof record.avatarId==='string' &&
        typeof record.key==='string' && /^[a-f0-9]{48}$/.test(record.key))return record;
  } catch {}
  return null;
}
function save(record){
  try {
    if(record)sessionStorage.setItem(storageKey,JSON.stringify(record));
    else sessionStorage.removeItem(storageKey);
  } catch {}
}
function freshKey(){
  return Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
}
export function startAdmission(profile,request,notify){
  const previous=getPendingAdmission();
  const record=previous?.name===profile.name && previous.avatarId===profile.avatarId
    ? previous : {name:profile.name,avatarId:profile.avatarId,key:freshKey()};
  save(record);
  let active=true,latest=record.view||null,wake=null;
  const cancelled=()=>new Error('已退出排队。');
  function delay(ms){
    return new Promise(resolve=>{
      const done=()=>{clearTimeout(timeout);window.removeEventListener('online',done);wake=null;resolve();};
      const timeout=setTimeout(done,ms);wake=done;window.addEventListener('online',done,{once:true});
    });
  }
  async function run(payload){
    let failures=0;
    if(latest)notify({...latest,offline:true});
    while(active){
      let response;
      try {
        response=record.ticket
          ? await request('queue/status',{},record.ticket)
          : await request('join',{...payload,admissionKey:record.key});
        const data=await response.json();
        if(!active)throw cancelled();
        if(response.status!==202){
          if(!data.selfId||!data.token||!Array.isArray(data.visitors))throw Error('入馆信息不完整，请重新连接。');
          active=false;save(null);return data;
        }
        const {ticket,ahead,etaSeconds,estimatingFromHistory,occupancy,capacity}=data;
        if(!ticket||!Number.isInteger(ahead)||!Number.isFinite(etaSeconds))throw Error('暂时无法获取排队信息。');
        record.ticket=ticket;
        latest={queued:true,ahead,etaSeconds,estimatingFromHistory,occupancy,capacity};
        record.view=latest;save(record);
        notify(latest);
        failures=0;
        await delay(3000);
      } catch(error) {
        if(!active)throw cancelled();
        if(error.status && error.status<500)throw error;
        if(!record.ticket && ++failures>=2)throw error;
        if(latest)notify({...latest,offline:true});
        await delay(record.ticket?3500:750);
      }
    }
    throw cancelled();
  }
  function stop(keepTicket=false){
    active=false;wake?.();
    if(keepTicket)return Promise.resolve();
    save(null);
    return request('queue/cancel',{admissionKey:record.key},record.ticket,{keepalive:true}).catch(()=>{});
  }
  return {run,stop};
}
