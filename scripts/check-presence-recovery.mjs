// A finite response must keep the map usable if a middlebox buffers its stream.
// All admissions, movement, renewal and departures use the real local room.
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {setTimeout as sleep} from 'node:timers/promises';
import {createMuseumServer} from '../server/museum.mjs';
import {createPresence} from '../presence-client.js';

const server=createMuseumServer({disconnectMs:1000,heartbeatMs:100});
server.listen(0,'127.0.0.1');
await once(server,'listening');
const origin='http://127.0.0.1:'+server.address().port;
const fetchNetwork=globalThis.fetch;
const mockStorage=new Map();
globalThis.window=new EventTarget();
globalThis.sessionStorage={
  getItem:key=>mockStorage.get(key)??null,
  setItem:(key,value)=>mockStorage.set(key,value),
  removeItem:key=>mockStorage.delete(key)
};
let holdSnapshot=false,releaseSnapshot,observer,speaker,started;
const snapshotRequested=new Promise(resolve=>{started=resolve;});
const snapshotGate=new Promise(resolve=>{releaseSnapshot=resolve;});
const seen=[];
globalThis.fetch=async (url,options)=>{
  if(url==='/api/stream')return new Promise((_resolve,reject)=>{
    options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
  });
  const response=await fetchNetwork(new URL(url,origin),options);
  if(url==='/api/pulse' && JSON.parse(options.body).snapshot){
    seen.push(response.status);
    if(holdSnapshot){started();await snapshotGate;}
  }
  return response;
};
async function until(check,timeout=7500){
  const end=Date.now()+timeout;
  while(!check()){
    assert(Date.now()<end,'timed out waiting for the map to recover');
    await sleep(40);
  }
}
async function roomPost(path,body,token){
  const res=await fetchNetwork(origin+'/api/'+path,{method:'POST',
    headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
  assert(res.ok,path+' '+res.status);
  return res.json();
}
try{
  let map,status;
  observer=createPresence({onSnapshot:value=>{map=value;},onStatus:value=>{status=value;}});
  const observerId=await observer.join({name:'旁观者',avatarId:'qing'});
  await until(()=>status==='online');
  speaker=await roomPost('join',{name:'同行者',avatarId:'heng',rosterVersion:2});
  await roomPost('pulse',{},speaker.token);
  await roomPost('update',{pose:{x:2,z:12,heading:.1}},speaker.token);
  await until(()=>map.visitors.some(v=>v.id===speaker.selfId&&v.x===2));
  assert.equal(map.selfId,observerId);
  observer.move({x:1,z:5,heading:.2});
  await until(()=>map.visitors.some(v=>v.id===observerId&&v.x===1&&v.z===5));
  assert(seen.every(x=>x===200),'fallback lost its original seat');
  await roomPost('leave',{},speaker.token);speaker=null;
  // A late reply must never repopulate the map after the visitor has left.
  await sleep(1050);holdSnapshot=true;
  const inFlight=observer.refreshMap();
  await Promise.race([snapshotRequested,sleep(7000,undefined,{ref:false}).then(()=>{throw Error('no snapshot request');})]);
  await observer.leave();
  releaseSnapshot();await inFlight;
  assert.equal(status,'offline');
  assert.deepEqual(map,{selfId:null,visitors:[]});
  assert.equal((await (await fetchNetwork(origin+'/api/room')).json()).occupancy,0);
  console.log('流始终未返回首帧时，两人仍能入馆并看见对方移动，原席位保持有效，离馆后的延迟回复不会恢复旧地图。');
}finally{
  releaseSnapshot();
  await observer?.leave();
  if(speaker)await roomPost('leave',{},speaker.token);
  globalThis.fetch=fetchNetwork;
  const closed=once(server,'close');
  server.close();server.closeAllConnections();await closed;
}
