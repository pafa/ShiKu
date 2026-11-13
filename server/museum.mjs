import http from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { networkInterfaces, hostname } from 'node:os';
import { spawn } from 'node:child_process';
import { legacyVisitorId, resolveVisitorId } from '../visitor-roster.js';
import { createAdmission } from './admission.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = createHash('sha256').update(root).digest('hex').slice(0,16);
const trailLimit = 180;
// The interactive client sends at most one movement every 120 milliseconds.
const movementIntervalMs = 80;
const movementBurst = 4;
const mime = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.png':'image/png','.avif':'image/avif','.glb':'model/gltf-binary','.gltf':'model/gltf+json',
  '.mp3':'audio/mpeg','.mp4':'video/mp4','.hdr':'application/octet-stream','.bin':'application/octet-stream',
  '.ktx2':'image/ktx2','.woff2':'font/woff2','.wasm':'application/wasm',
  '.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8',
};
function httpError(status, message) { return Object.assign(new Error(message), {status}); }
function reply(res, status, data) {
  const text=JSON.stringify(data);
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(text);
}
function privateV4(ip) {
  return /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(ip);
}
function lanIPs() {
  return Object.entries(networkInterfaces()).flatMap(([device,entries]) =>
    entries.filter(n=>n.family==='IPv4'&&!n.internal&&privateV4(n.address)).map(n=>({device,ip:n.address})))
    .sort((a,b)=>Number(/^(en|eth|wl)/.test(b.device))-Number(/^(en|eth|wl)/.test(a.device)))
    .map(n=>n.ip);
}
async function readBody(req) {
  if (!/^(application\/json|text\/plain)(;|$)/i.test(req.headers['content-type']||'')) throw httpError(415,'请求格式无效。');
  const chunks=[]; let size=0;
  for await(const chunk of req) {
    size+=chunk.length;
    if(size>3072) throw httpError(413,'请求过长。');
    chunks.push(chunk);
  }
  try {
    const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(value && typeof value==='object' && !Array.isArray(value))return value;
  }catch{}
  throw httpError(400,'请求内容无效。');
}
function checkProfile(name,avatarId) {
  if(typeof name!=='string'||/[\p{C}\u2028\u2029]/u.test(name))throw httpError(400,'请使用可显示的名字。');
  const normalized=name.normalize('NFC').trim().replace(/\s+/gu,' ');
  if(!normalized || [...normalized].length>20)throw httpError(400,'名字请填写 1 到 20 个字。');
  const currentId=resolveVisitorId(avatarId);
  if(!currentId)throw httpError(400,'请选择馆内已有的形象。');
  return {name:normalized,avatarId:currentId};
}
function checkPose(pose) {
  if(!pose || ![pose.x,pose.z,pose.heading].every(Number.isFinite) || Math.max(Math.abs(pose.x),Math.abs(pose.z))>2000)throw httpError(400,'位置无效。');
  return {x:+pose.x.toFixed(3),z:+pose.z.toFixed(3),heading:+Math.atan2(Math.sin(pose.heading),Math.cos(pose.heading)).toFixed(4)};
}
function appearance(p, legacy=false) {
  const {id,name,avatarId,x,z,heading,trail}=p;
  return {id,name,avatarId:legacy?legacyVisitorId(avatarId):avatarId,x,z,heading,trail};
}
function startingPose(people) {
  const candidates=[];
  for(const z of [8.2,6.7,9.7,5.2,11.2,3.7,12.7,2.2,1])for(const x of [-.65,.65,-1.95,1.95,0]) candidates.push({x,z});
  const near=p=>Math.min(Infinity,...Array.from(people.values(),v=>Math.hypot(v.x-p.x,v.z-p.z)));
  const p=candidates.find(point=>near(point)>=1.25) || candidates.sort((a,b)=>near(b)-near(a))[0];
  return {...p,heading:p.x<0?-.59:.59};
}
function publicAsset(path) {
  if (!path.startsWith('/')||path.includes('\\')||path.includes('\0'))return false;
  const parts=path.slice(1).split('/');
  if(parts.some(s=>!s||s.startsWith('.')))return false;
  const ext=extname(path).toLowerCase();
  if(!(ext in mime))return false;
  if(parts.length===1)return ['.html','.js','.css','.png','.svg'].includes(ext);
  if(parts[0]==='assets'||parts[0]==='real-viewer')return true;
  return path==='/preview/yungang-frontal-check.jpg';
}
async function serveFile(req,res,path) {
  if(path==='/real-viewer'){
    const query=new URL(req.url,'http://localhost').search;
    res.writeHead(308,{Location:'/real-viewer/'+query});res.end();return;
  }
  if(path==='/'||path==='/real-viewer/')path+='index.html';
  if(!publicAsset(path))throw httpError(404,'文件不存在。');
  let file,info;
  try{
    file=await realpath(join(root,path.slice(1)));
    if(!file.startsWith(root+sep)||!publicAsset('/'+file.slice(root.length+1)))throw Error();
    info=await stat(file);if(!info.isFile())throw Error();
  }catch{throw httpError(404,'文件不存在。');}
  const headers={'Content-Type':mime[extname(file).toLowerCase()],'Accept-Ranges':'bytes','Cache-Control':'no-cache','Last-Modified':info.mtime.toUTCString()};
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){
    const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!m || (!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':'bytes */'+info.size});res.end();return;}
    start=m[1]?Number(m[1]):Math.max(0,info.size-Number(m[2])); end=m[1]&&m[2]?Math.min(info.size-1,Number(m[2])):info.size-1;
    if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':'bytes */'+info.size});res.end();return;}
    status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+info.size;
  }
  headers['Content-Length']=Math.max(0,end-start+1);
  res.writeHead(status,headers);
  if(req.method==='HEAD'||!info.size){res.end();return;}
  const fileStream=createReadStream(file,{start,end});
  res.on('close',()=>fileStream.destroy()); fileStream.on('error',()=>res.destroy()); fileStream.pipe(res);
}

export function createMuseumServer({disconnectMs=12000,heartbeatMs=6000,staleMs=95000,lan=false,publicOrigin=null,queueTtlMs=180000,now=Date.now}={}) {
  const people=new Map(),tokens=new Map();
  // The reverse proxy preserves the configured Host. X-Forwarded-* never grants access.
  let external = null;
  if (publicOrigin !== null) {
    external = new URL(publicOrigin);
    if (lan || external.protocol !== 'https:' || external.origin !== publicOrigin)
      throw Error('公开展馆地址必须是完整的 HTTPS origin，且不能启用局域网模式。');
  }
  const localIPs = external ? [] : lanIPs();
  const hosts = new Set(['127.0.0.1', 'localhost', '[::1]', ...localIPs]);
  if (!external) hosts.add(hostname().toLowerCase());
  function snapshot(legacy){return [...people.values()].map(p=>appearance(p,legacy));}
  function write(res,event) {
    if (res.destroyed) return;
    if (res.writableLength>262144) {res.destroy();return;}
    res.write(JSON.stringify(event)+'\n');
  }
  function broadcast(event){
    for(const p of people.values()){
      if(!p.stream)continue;
      if(p.legacy&&event.type==='join'){
        write(p.stream,{...event,visitor:appearance(event.visitor,true)});
      }else if(p.legacy&&event.type==='update'){
        write(p.stream,{...event,avatarId:legacyVisitorId(event.avatarId)});
      }else write(p.stream,event);
    }
  }
  function admit(profile, requestedPose, legacy) {
    const pose = requestedPose ?? startingPose(people);
    const time = now();
    const person = {id:randomBytes(9).toString('hex'),token:randomBytes(24).toString('base64url'),
      ...profile,legacy,...pose,trail:[{x:pose.x,z:pose.z,break:true}],stream:null,
      detachedAt:time,lastSeen:time,admittedAt:time,acknowledged:false,moveCredits:movementBurst,moveRefilledAt:time};
    people.set(person.id,person);tokens.set(person.token,person);
    broadcast({type:'join',visitor:appearance(person)});
    return person;
  }
  const admission = createAdmission({occupancy:()=>people.size,admit,remove,now,queueTtlMs});
  function sendAdmission(res, result) {
    if (result.queued) return reply(res,202,result);
    const p = result.person;
    return reply(res,201,{selfId:p.id,token:p.token,visitors:snapshot(p.legacy),trailLimit,rosterVersion:2});
  }
  function remove(p,endTime=now()){
    admission.departed(p,endTime);
    people.delete(p.id);tokens.delete(p.token);
    const stream=p.stream;p.stream=null;stream?.end();
    broadcast({type:'leave',id:p.id});
  }
  const server=http.createServer(async(req,res)=>{
    try{
      res.setHeader('X-Content-Type-Options','nosniff');
      const authority = req.headers.host;
      const publicRequest = external !== null && authority === external.host;
      const base = publicRequest ? external.origin : 'http://' + authority;
      const url = new URL(req.url, base);
      if (!authority || url.origin !== base || (!publicRequest && !hosts.has(url.hostname)))
        throw httpError(403, '请从展馆地址进入。');
      const ip = req.socket.remoteAddress?.replace(/^::ffff:/, '');
      const allowedPeer = external
        ? ip === '127.0.0.1' || ip === '::1'
        : ip === '::1' || privateV4(ip || '');
      if (!allowedPeer) throw httpError(403, '请从展馆入口连接。');
      if(!url.pathname.startsWith('/api/')){
        if(req.method!=='GET'&&req.method!=='HEAD')throw httpError(405,'请求方法无效。');
        await serveFile(req,res,decodeURIComponent(url.pathname));return;
      }
      if(url.pathname==='/api/room'&&req.method==='GET'){
        return reply(res,200,{service:'shiku-presence',site,version:1,rosterVersion:2,...admission.room(),lanUrls:lan?localIPs.map(ip=>'http://'+ip+':'+server.address().port+'/'):[]});
      }
      if(req.method!=='POST')throw httpError(405,'请求方法无效。');
      if((publicRequest || req.headers.origin !== undefined) && req.headers.origin !== base)throw httpError(403,'请从展馆页面连接。');
      const body=await readBody(req);
      if(url.pathname==='/api/join'){
        const profile=checkProfile(body.name,body.avatarId);
        const pose=body.pose?checkPose(body.pose):null;
        const legacy=body.rosterVersion!==2&&profile.avatarId!==body.avatarId;
        return sendAdmission(res,admission.join(body.admissionKey,profile,pose,legacy));
      }
      const credential=req.headers.authorization?.replace(/^Bearer /,'')||body.token;
      if(url.pathname==='/api/queue/status')return sendAdmission(res,admission.status(credential));
      if(url.pathname==='/api/queue/cancel'){
        admission.cancel(credential,body.admissionKey);
        return reply(res,200,{});
      }
      const p=tokens.get(credential);
      if(!p)throw httpError(401,'入馆会话已过期。');
      p.lastSeen=now();
      if(url.pathname==='/api/pulse'){
        p.acknowledged=true;
        return reply(res,200,{});
      }
      if(url.pathname==='/api/stream'){
        p.acknowledged=true;p.stream?.end();p.stream=res;p.detachedAt=0;
        res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store, no-transform','X-Accel-Buffering':'no'});
        write(res,{type:'snapshot',visitors:snapshot(p.legacy)});
        res.on('close',()=>{if(p.stream===res){p.stream=null;p.detachedAt=now();}});
        return;
      }
      if(url.pathname==='/api/leave'){remove(p);return reply(res,200,{});}
      if(url.pathname!=='/api/update')throw httpError(404,'接口不存在。');
      const time = now();
      const elapsed = Math.max(0, time - p.moveRefilledAt);
      p.moveCredits = Math.min(movementBurst, p.moveCredits + elapsed / movementIntervalMs);
      p.moveRefilledAt = time;
      if (p.moveCredits < 1) {
        res.setHeader('Retry-After', '1');
        throw httpError(429, '位置更新过于频繁，请稍后再试。');
      }
      p.moveCredits--;
      const pose=body.pose?checkPose(body.pose):null;
      if(body.avatarId!==undefined){
        const id=resolveVisitorId(body.avatarId);
        if(!id)throw httpError(400,'形象无效。');
        p.avatarId=id;
      }
      let point;
      if(pose){
        const jump=body.teleport===true||Math.hypot(p.x-pose.x,p.z-pose.z)>3.2;
        Object.assign(p,pose);
        const previous=p.trail.at(-1);
        if(jump||Math.hypot(previous.x-p.x,previous.z-p.z)>=.38){
          point={x:p.x,z:p.z,...(jump?{break:true}:{})};p.trail.push(point);
          if(p.trail.length>trailLimit)p.trail.shift();
        }
      }
      broadcast({type:'update',id:p.id,x:p.x,z:p.z,heading:p.heading,avatarId:p.avatarId,point});
      return reply(res,200,{});
    }catch(e){
      if (!res.headersSent && e.status === 503) res.setHeader('Retry-After', '5');
      if(!res.headersSent)reply(res,e.status||400,{error:e.status?e.message:'无法读取请求。'});
      else res.destroy();
    }
  });
  if (external) server.maxConnections = 2048;
  server.headersTimeout=15000;server.requestTimeout=12000;
  const timer=setInterval(()=>{
    admission.expire();
    for(const p of people.values()){
      if(now()-p.lastSeen>=staleMs)remove(p,p.lastSeen);
      else if(p.stream)write(p.stream,{type:'pulse'});
      else if(now()-p.detachedAt>=disconnectMs)remove(p,Math.max(p.detachedAt,p.lastSeen));
    }
  },heartbeatMs);
  timer.unref();server.once('close',()=>clearInterval(timer));return server;
}

function listen(server,host,port) {
  return new Promise((resolve,reject)=>{
    const onError=error=>{server.off('listening',onListen);reject(error);};
    const onListen=()=>{server.off('error',onError);resolve();};
    server.once('listening',onListen);server.once('error',onError);server.listen(port,host);
  });
}
async function main() {
  const args=process.argv.slice(2);
  const get=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
  const lan=args.includes('--lan'), open=args.includes('--open');
  const host=get('--host',lan?'0.0.0.0':'127.0.0.1');
  const publicOrigin = process.env.SHIKU_PUBLIC_ORIGIN ?? null;
  if (publicOrigin !== null && (lan || args.includes('--available'))) throw Error('公开展馆要求固定端口及本机回环地址。');
  if(!lan&&!['localhost','127.0.0.1','::1'].includes(host))throw Error('使用 --lan 启动局域网访问。');
  let port=Number(get('--port',4173));
  const show=url=>{if(open)spawn('open',[url],{stdio:'ignore',detached:true}).unref();};
  for(let attempt=0;attempt<12;attempt++,port++){
    const server=createMuseumServer({lan,publicOrigin});
    try{await listen(server,host,port);}
    catch(error){
      server.close();if(error.code!=='EADDRINUSE'||!args.includes('--available'))throw error;
      try{
        const existing=await fetch('http://127.0.0.1:'+port+'/api/room',{signal:AbortSignal.timeout(650)});
        const info=await existing.json();
        if(info.site===site&&info.service==='shiku-presence'&&(!lan||info.lanUrls?.length)){show('http://127.0.0.1:'+port+'/');console.log('已使用现有多人展馆：'+port);return;}
      }catch{}
      continue;
    }
    const actualPort=server.address().port;const url='http://127.0.0.1:'+actualPort+'/';
    console.log('本机展馆：'+url);
    if(lan)for(const ip of lanIPs())console.log('同一局域网入馆： http://'+ip+':'+actualPort+'/');
    console.log('参观时请保持窗口开启。');show(url);return;
  }
  throw Error('未能找到空闲的展馆端口。');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
