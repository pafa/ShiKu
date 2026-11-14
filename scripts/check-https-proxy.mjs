// Run on loopback with nginx and openssl. No DNS records or machine trust settings change.
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {spawn, execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {createMuseumServer} from '../server/museum.mjs';

const host = 'shiku.xiaoha.org';
const origin = 'https://' + host;
const temp = await mkdtemp(join(tmpdir(), 'shiku-https-'));
const museum = createMuseumServer({publicOrigin:origin});
let proxy;

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}
async function freePort() {
  const socket = net.createServer();
  const port = await listen(socket);
  await new Promise(resolve => socket.close(resolve));
  return port;
}

try {
  const upstream = await listen(museum);
  const tlsPort = await freePort();
  let httpPort = await freePort();
  while (httpPort === tlsPort) httpPort = await freePort();

  await mkdir(join(temp,'logs'));
  const cert=join(temp,'cert.pem'), key=join(temp,'key.pem');
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN='+host,'-addext','subjectAltName=DNS:'+host,'-keyout',key,'-out',cert],{stdio:'ignore'});
  const ca = await readFile(cert);
  const site = (await readFile(new URL('../deploy/shiku.nginx.conf',import.meta.url),'utf8'))
    .replaceAll('/var/log/nginx/shiku-status.log', join(temp,'logs','status.log'))
    .replace('listen 80;', 'listen 127.0.0.1:'+httpPort+';')
    .replace('listen 443 ssl;', 'listen 127.0.0.1:'+tlsPort+' ssl;')
    .replace('/etc/letsencrypt/live/'+host+'/fullchain.pem', cert)
    .replace('/etc/letsencrypt/live/'+host+'/privkey.pem', key)
    .replace('http://127.0.0.1:4173', 'http://127.0.0.1:'+upstream);
  await writeFile(join(temp,'nginx.conf'), 'pid logs/nginx.pid;\nerror_log logs/error.log;\nevents {}\nhttp {\naccess_log off;\nclient_body_temp_path client;\nproxy_temp_path proxy;\nfastcgi_temp_path fastcgi;\nuwsgi_temp_path uwsgi;\nscgi_temp_path scgi;\n'+site+'\n}');
  const flags=['-p',temp+'/', '-c',join(temp,'nginx.conf')];
  execFileSync('nginx',[...flags,'-t'],{stdio:'pipe'});
  proxy=spawn('nginx',[...flags,'-g','daemon off;'],{stdio:'ignore'});

  function request(path,{body,headers={},stream=false}={}) {
    return new Promise((resolve,reject)=>{
      const req=https.request({host:'127.0.0.1',port:tlsPort,servername:host,ca,path,
        method:body===undefined?'GET':'POST',headers:{Host:host,...(body===undefined?{}:{Origin:origin,'Content-Type':'application/json'}),...headers},agent:false},res=>{
        if(stream){resolve(res);return;}
        const parts=[];
        res.on('data',part=>parts.push(part));
        res.on('error',reject);
        res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(parts)}));
      });
      req.setTimeout(4000,()=>req.destroy(Error('local HTTPS request timeout')));
      req.once('error',reject);
      req.end(body===undefined?undefined:JSON.stringify(body));
    });
  }
  for(let attempt=0;;attempt++){
    try {assert.equal((await request('/')).status,200);break;}
    catch(e){if(attempt>=30||proxy.exitCode!==null)throw e;await delay(60);}
  }
  const room=JSON.parse((await request('/api/room')).body);
  assert.equal(room.capacity,50);assert.deepEqual(room.lanUrls,[]);
  const health=await fetch('http://127.0.0.1:'+upstream+'/api/room');
  assert.equal((await health.json()).service,'shiku-presence');
  const redirect=await new Promise((resolve,reject)=>{
    http.get({host:'127.0.0.1',port:httpPort,path:'/?cave=mogao-158',headers:{Host:host}},r=>{r.resume();resolve(r);}).on('error',reject);
  });
  assert.equal(redirect.statusCode,308);assert.equal(redirect.headers.location,origin+'/?cave=mogao-158');
  assert.equal((await request('/api/room',{headers:{Host:'unlisted.invalid'}})).status,421);
  const invalid={body:{name:'来源测试',avatarId:'qing'},headers:{Origin:'https://unlisted.invalid','X-Forwarded-Host':host}};
  assert.equal((await request('/api/join',invalid)).status,403);
  assert.equal((await request('/api/join',{...invalid,headers:{Origin:''}})).status,403);
  const ranged=await request('/assets/walk/voices/mogao-158--threshold.mp3?v=cn-guide-2',{headers:{Range:'bytes=0-127'}});
  assert.equal(ranged.status,206);assert.equal(ranged.body.length,128);assert.equal(ranged.headers['content-type'],'audio/mpeg');
  assert.equal((await request('/server/museum.mjs')).status,404);
  assert.equal((await request('/api/stream',{body:{}})).status,401);

  const joinGuest = () => request('/api/join',{body:{name:'代理验收',avatarId:'qing',admissionKey:randomUUID(),rosterVersion:2}});
  const first=JSON.parse((await joinGuest()).body);
  const auth={Authorization:'Bearer '+first.token};
  const stream=await request('/api/stream',{body:{},headers:auth,stream:true});
  assert.equal(stream.statusCode,200);assert.match(stream.headers['content-type'],/ndjson/);
  const lines=stream.iterator();let pending='';
  async function nextEvent(type) {
    for(;;){
      if(pending.includes('\n')){
        const index=pending.indexOf('\n'),event=JSON.parse(pending.slice(0,index));
        pending=pending.slice(index+1);
        if(event.type===type)return event;
      }else{
        const {value,done}=await lines.next();
        assert(!done,'multiplayer stream ended early');pending+=value.toString();
      }
    }
  }
  try {
    const snap=await nextEvent('snapshot');
    assert.equal(snap.visitors[0].id,first.selfId);
    assert(!JSON.stringify(snap).includes(first.token));
    const second=JSON.parse((await joinGuest()).body);
    assert.equal((await nextEvent('join')).visitor.id,second.selfId);
    assert.equal((await request('/api/update',{headers:{Authorization:'Bearer '+second.token},body:{pose:{x:1,z:2,heading:0}}})).status,200);
    assert.equal((await nextEvent('update')).x,1);
    for(let i=2;i<50;i++)assert.equal((await joinGuest()).status,201);
    const queued=await joinGuest();assert.equal(queued.status,202);
    const wait=JSON.parse(queued.body);assert.equal(wait.ahead,0);
    assert.equal((await request('/api/leave',{headers:{Authorization:'Bearer '+second.token},body:{}})).status,200);
    const admitted=await request('/api/queue/status',{headers:{Authorization:'Bearer '+wait.ticket},body:{}});
    assert.equal(admitted.status,201);
  } finally {stream.destroy();}
  const log = await readFile(join(temp,'logs','status.log'), 'utf8');
  const entries = log.trim().split('\n');
  assert(entries.length >= 50, 'expected visitor traffic in the status-only log');
  assert(entries.every(entry => /^\S+ (GET|POST|HEAD) [0-9]{3} [0-9.]+s$/.test(entry)),
    'status log should only contain time, method, status and elapsed time');
  console.log('本机 HTTPS 反代演练通过。已核对域名、来源、HTTP 跳转、健康、音轨分段、双访客实时动作及第 51 人候位补位。');
} finally {
  if(proxy?.pid && proxy.exitCode===null && proxy.signalCode===null){
    const exit=once(proxy,'exit');proxy.kill('SIGTERM');await exit;
  }
  museum.closeAllConnections();if(museum.listening)await new Promise(resolve=>museum.close(resolve));
  await rm(temp,{recursive:true,force:true});
}
