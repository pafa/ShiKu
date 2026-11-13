import {startAdmission,getPendingAdmission} from './admission-client.js';
export {getPendingAdmission};
import {legacyVisitorId, resolveVisitorId} from './visitor-roster.js';

// One live visit per tab. The write credential stays in this instance. Only
// display names, public participant IDs and avatar positions reach other guests.
export function createPresence({onSnapshot=()=>{},onStatus=()=>{}}={}) {
  let generation=0, profile=null, session=null, status='offline';
  let guests=new Map(), latest=null, trailLimit=180;
  let dirty=false, teleport=false, writing=false, poll=null, stream=null;
  let recovery=null,lastSent=0;
  const current=id=>generation===id && !!profile;
  const setStatus=next=>{if(status!==next){status=next;onStatus(next);}};
  const snapshot=()=>onSnapshot({selfId:session?.id??null,visitors:[...guests.values()]});
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function readGuest(record) {
    return {...record, avatarId: resolveVisitorId(record.avatarId)};
  }
  function apply(event) {
    if(event.type==='pulse')return;
    if(event.type==='snapshot')guests=new Map(event.visitors.map(p=>[p.id,readGuest(p)]));
    else if(event.type==='join')guests.set(event.visitor.id,readGuest(event.visitor));
    else if(event.type==='leave')guests.delete(event.id);
    else if(event.type==='update') {
      const p=guests.get(event.id);if(!p)return;
      const trail=event.point?[...p.trail,event.point].slice(-trailLimit):p.trail;
      guests.set(event.id,{...p,x:event.x,z:event.z,heading:event.heading,avatarId:resolveVisitorId(event.avatarId),trail});
    }else return;
    snapshot();
  }
  async function request(path,body,token,options={}) {
    const headers={'Content-Type':'application/json'};
    if(token)headers.Authorization='Bearer '+token;
    // Insecure HTTP on phones on the LAN supports fetch and streams; the
    // credential does not require a secure-context browser crypto API.
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),18000);
    try {
      const response=await fetch('/api/'+path,{method:'POST',headers,body:JSON.stringify(body),
        cache:'no-store',credentials:'same-origin',signal:controller.signal,...options});
      if(!response.ok){
        const data=await response.json().catch(()=>({}));
        throw Object.assign(new Error(data.error||'多人展馆暂时无法连接，请稍后重试。'),{status:response.status});
      }
      return response;
    }finally{clearTimeout(timeout);}
  }
  function withdraw(token,beacon=false) {
    if(!token)return Promise.resolve();
    if(beacon){
      const body=new Blob([JSON.stringify({token})],{type:'text/plain'});
      if(navigator.sendBeacon?.('/api/leave',body))return Promise.resolve();
    }
    return request('leave',{},token,{keepalive:true}).catch(()=>{});
  }
  let admission=null;
  async function acquire(epoch,pose,onQueue){
    const pending=startAdmission(profile,request,info=>{
      if(!current(epoch))return;
      setStatus('waiting');
      if(onQueue)onQueue(info);
      else {
        // A previous in-gallery session expired while the room filled. Return
        // to the same tab's waiting screen with its new ticket already saved.
        window.location.reload();
      }
    });
    admission=pending;
    const data=await pending.run({...profile,avatarId:legacyVisitorId(profile.avatarId),rosterVersion:2,pose});
    if(!current(epoch))throw new Error('已取消入馆。');
    admission=null;
    session={id:data.selfId,token:data.token,usesDuet:data.rosterVersion===2};
    trailLimit=data.trailLimit;
    const own=data.visitors.find(v=>v.id===data.selfId);
    if(!latest&&own)latest={x:own.x,z:own.z,heading:own.heading};
    apply({type:'snapshot',visitors:data.visitors});
  }
  async function openStream(epoch) {
    let delay=450;
    while(current(epoch)){
      const connection=new AbortController();stream=connection;
      let timer;
      const renew=()=>{clearTimeout(timer);timer=setTimeout(()=>connection.abort(),23000);};
      try{
        if(!session)await acquire(epoch,latest);
        if(!current(epoch))return;
        renew();
        const res=await request('stream',{},session.token,{signal:connection.signal});
        if(!res.body)throw Error('浏览器未能读取展馆连接。');
        const reader=res.body.getReader(),decoder=new TextDecoder();
        let pending='';
        try{
          while(current(epoch)){
            const {value,done}=await reader.read();
            if(done)break;
            renew();pending+=decoder.decode(value,{stream:true});
            let end;
            while((end=pending.indexOf('\n'))>=0){
              const line=pending.slice(0,end);pending=pending.slice(end+1);
              if(!line)continue;
              if(!current(epoch))return;
              const event=JSON.parse(line);
              apply(event);
              if(event.type==='snapshot'){setStatus('online');delay=450;}
            }
          }
        }finally{reader.releaseLock();}
      }catch(e){
        if(!current(epoch))return;
        if(e.status===401)session=null;
        if(!session&&admission){void admission.stop();admission=null;}
      }finally{clearTimeout(timer);connection.abort();if(stream===connection)stream=null;}
      if(!current(epoch))return;
      setStatus('reconnecting');
      // Offline map and scene retain only the local visitor until the server
      // supplies a fresh room. A disappeared guest never keeps walking.
      const own=guests.get(session?.id);
      guests=own?new Map([[own.id,own]]):new Map();snapshot();
      await wait(delay);delay=Math.min(4500,delay*1.6);
    }
  }
  async function flush(epoch) {
    if(!current(epoch)||writing||!session||status!=='online')return;
    const pulse=!dirty;
    if(pulse && Date.now()-lastSent<8000)return;
    lastSent=Date.now();
    const token=session.token, avatarId=session.usesDuet?profile.avatarId:legacyVisitorId(profile.avatarId);
    const update={pose:latest,avatarId,teleport};
    dirty=false;teleport=false;writing=true;
    try{await request(pulse?'pulse':'update',pulse?{}:update,token);}
    catch(e){
      if(current(epoch)&&session?.token===token){
        dirty ||= !pulse;teleport ||=update.teleport;
        if(e.status===401){session=null;stream?.abort();}
      }
    }finally{if(current(epoch))writing=false;}
  }
  function clear(beacon=false,keepTicket=false) {
    generation++;
    clearInterval(poll);poll=null;stream?.abort();stream=null;
    const pending=admission;admission=null;
    const old=session;session=null;profile=null;latest=null;dirty=false;teleport=false;writing=false;
    guests=new Map();setStatus('offline');snapshot();
    return Promise.all([pending?.stop(keepTicket),withdraw(old?.token,beacon)]);
  }
  async function join(profileInput,pose,{onQueue}={}) {
    const avatarId=resolveVisitorId(profileInput.avatarId);
    if(!avatarId)throw new Error('请选择馆内已有的形象。');
    if(profile || session)void clear();
    const epoch=++generation;
    profile={name:profileInput.name,avatarId};
    latest=pose?{x:pose.x,z:pose.z,heading:pose.heading}:null;
    setStatus('connecting');
    try{
      await acquire(epoch,latest,onQueue);
      if(!current(epoch))throw new Error('已取消入馆。');
      poll=setInterval(()=>void flush(epoch),120);
      void openStream(epoch);
      return session.id;
    }catch(error){
      if(current(epoch))void clear();
      throw error;
    }
  }
  function move(pose,options={}) {
    if(!profile || !pose || ![pose.x,pose.z,pose.heading].every(Number.isFinite))return;
    if(!options.teleport && latest && Math.hypot(pose.x-latest.x,pose.z-latest.z)<.012 &&
      Math.abs(Math.atan2(Math.sin(pose.heading-latest.heading),Math.cos(pose.heading-latest.heading)))<.012)return;
    latest={x:pose.x,z:pose.z,heading:pose.heading};dirty=true;teleport ||=!!options.teleport;
  }
  function appearance(value) {
    const id=resolveVisitorId(value);
    if(id&&profile&&profile.avatarId!==id){profile.avatarId=id;dirty=true;}
  }
  window.addEventListener('pagehide',event=>{
    if(admission && event.persisted)return;
    recovery=event.persisted&&profile?{profile:{...profile},pose:latest}:null;
    void clear(true,!!admission);
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted||!recovery)return;
    const old=recovery;recovery=null;void join(old.profile,old.pose).catch(()=>{});
  });
  return {join,move,appearance,leave:()=>{recovery=null;return clear();}};
}
