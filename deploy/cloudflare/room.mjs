// One named SQLite Durable Object owns all admissions and present visitors.
// SQL mutations between awaits are atomic. Stream controllers and trail history
// are deliberately ephemeral; live seats and FIFO registration survive eviction.
import {legacyVisitorId, resolveVisitorId} from '../../visitor-roster.js';

const capacity = 50, queueLimit = 500, requestLimit = 8192, trailLimit = 180;
const queueTTL = 180_000, seatTTL = 95_000, connectTTL = 12_000, checkpointMs = 5_000;
const encoder = new TextEncoder();
const validKey = key => typeof key === 'string' && /^[\w-]{16,128}$/.test(key);
const failure = (status,message) => Object.assign(new Error(message), {status});
const busy = () => failure(503,'候位登记已满，请稍后再试。已有排位继续有效。');
const expired = () => failure(410,'候位已结束，请重新入馆。');
const secret = () => crypto.randomUUID() + crypto.randomUUID();
const json = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',...([429,503].includes(status)?{'Retry-After':'5'}:{})}});

function checkedProfile(body) {
  if(typeof body.name !== 'string' || /[\p{C}\u2028\u2029]/u.test(body.name)) throw failure(400,'请使用可显示的名字。');
  const name = body.name.normalize('NFC').trim().replace(/\s+/gu,' ');
  if(!name || [...name].length>20) throw failure(400,'名字请填写 1 到 20 个字。');
  const avatar = resolveVisitorId(body.avatarId);
  if(!avatar) throw failure(400,'请选择馆内已有的形象。');
  return {name,avatar};
}
function checkedPose(p) {
  if(!p || ![p.x,p.z,p.heading].every(Number.isFinite) || Math.max(Math.abs(p.x),Math.abs(p.z))>2000)
    throw failure(400,'位置无效。');
  return {x:+p.x.toFixed(3),z:+p.z.toFixed(3),heading:+Math.atan2(Math.sin(p.heading), Math.cos(p.heading)).toFixed(4)};
}
async function payload(request) {
  if(!/^(application\/json|text\/plain)(;|$)/i.test(request.headers.get('Content-Type')||'')) throw failure(415,'请求格式无效。');
  if(Number(request.headers.get('Content-Length'))>3072) throw failure(413,'请求过长。');
  const reader = request.body?.getReader();
  if(!reader) throw failure(400,'请求内容无效。');
  const bytes = new Uint8Array(3072);
  let used=0;
  try {
    for(;;) {
      const {done,value}=await reader.read();
      if(done) break;
      if(used+value.length>bytes.length){void reader.cancel();throw failure(413,'请求过长。');}
      bytes.set(value,used);used+=value.length;
    }
  } finally {reader.releaseLock();}
  try {
    const body=JSON.parse(new TextDecoder().decode(bytes.subarray(0,used)));
    if(body && typeof body==='object' && !Array.isArray(body)) return body;
  } catch {}
  throw failure(400,'请求内容无效。');
}

export class MuseumRoom {
  constructor(ctx) {
    this.ctx = ctx;
    this.sql = ctx.storage.sql;
    this.peers = new Map();
    this.live = new Map();
    this.nextAlarm = 0;
    this.nextSweep = 0;
    this.heartbeat = null;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS registration (
        seq INTEGER PRIMARY KEY AUTOINCREMENT, reqkey TEXT UNIQUE, ticket TEXT UNIQUE,
        name TEXT NOT NULL, initial_avatar TEXT NOT NULL, avatar TEXT NOT NULL, legacy INTEGER NOT NULL,
        enqueued INTEGER NOT NULL, expires INTEGER NOT NULL, admitted INTEGER, confirmed INTEGER NOT NULL DEFAULT 0,
        pid TEXT UNIQUE, token TEXT UNIQUE, x REAL, z REAL, heading REAL
      );
      CREATE INDEX IF NOT EXISTS reg_expiry ON registration(expires);
      CREATE INDEX IF NOT EXISTS reg_wait ON registration(admitted,seq);
      CREATE TABLE IF NOT EXISTS retired (reqkey TEXT PRIMARY KEY, expires INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS retired_expiry ON retired(expires);
      CREATE TABLE IF NOT EXISTS samples (seq INTEGER PRIMARY KEY, duration INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS room_clock (slot INTEGER PRIMARY KEY, last_release INTEGER NOT NULL);
    `);
  }

  one(statement,...args) { return this.sql.exec(statement,...args).toArray()[0]; }
  count(statement,...args) { return this.one(statement,...args).n; }
  seated() { return this.count('SELECT COUNT(*) AS n FROM registration WHERE admitted IS NOT NULL'); }
  waiting() { return this.count('SELECT COUNT(*) AS n FROM registration WHERE admitted IS NULL'); }
  full() {
    return this.count('SELECT (SELECT COUNT(*) FROM registration)+(SELECT COUNT(*) FROM retired) AS n') >= requestLimit;
  }
  runtime(row) {
    let data = this.live.get(row.pid);
    if(!data) {
      data = {x:row.x,z:row.z,heading:row.heading,trail:[{x:row.x,z:row.z,break:true}],
        checkpoint:0,credits:4,refilled:Date.now()};
      this.live.set(row.pid,data);
    }
    return data;
  }
  appearance(row,legacy) {
    const {x,z,heading,trail}=this.runtime(row);
    return {id:row.pid,name:row.name,avatarId:legacy?legacyVisitorId(row.avatar):row.avatar,x,z,heading,trail};
  }
  snapshot(legacy) {
    return this.sql.exec('SELECT * FROM registration WHERE admitted IS NOT NULL ORDER BY seq').toArray().map(r=>this.appearance(r,legacy));
  }
  send(peer,event) {
    const bytes = encoder.encode(JSON.stringify(event)+'\n');
    try {
      if(peer.control.desiredSize < bytes.byteLength) { peer.control.error(Error('slow connection'));return false; }
      peer.control.enqueue(bytes);
      return true;
    } catch {return false;}
  }
  drop(id,peer) {
    if(this.peers.get(id)!==peer)return;
    this.peers.delete(id);
    if(!this.peers.size && this.heartbeat){clearInterval(this.heartbeat);this.heartbeat=null;}
  }
  broadcast(event) {
    for(const [id,peer] of this.peers) {
      let view = event;
      if(peer.legacy && event.type==='join') view={...event,visitor:{...event.visitor,avatarId:legacyVisitorId(event.visitor.avatarId)}};
      if(peer.legacy && event.type==='update') view={...event,avatarId:legacyVisitorId(event.avatarId)};
      if(!this.send(peer,view))this.drop(id,peer);
    }
  }
  stream(row,now) {
    this.confirm(row,now);
    const old=this.peers.get(row.pid);
    if(old) {try {old.control.close();} catch {} this.drop(row.pid,old);}
    const peer={legacy:row.legacy,control:null};
    const body=new ReadableStream({
      start: control => {
        peer.control=control;
        this.peers.set(row.pid,peer);
        if(!this.send(peer,{type:'snapshot',visitors:this.snapshot(row.legacy)})) this.drop(row.pid,peer);
      },
      cancel: () => this.drop(row.pid,peer)
    }, {highWaterMark:1024*1024,size:chunk=>chunk.byteLength});
    if(!this.heartbeat && this.peers.size) {
      this.heartbeat = setInterval(()=>this.broadcast({type:'pulse'}),6000);
    }
    return new Response(body,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store, no-transform','X-Content-Type-Options':'nosniff'}});
  }
  confirm(row,now) {
    const data=this.runtime(row);
    this.sql.exec('UPDATE registration SET confirmed=1,expires=?,x=?,z=?,heading=? WHERE seq=?',
      now+seatTTL,data.x,data.z,data.heading,row.seq);
    data.checkpoint=now;
  }
  retire(row,now) {
    if(row.reqkey) this.sql.exec('INSERT OR REPLACE INTO retired VALUES (?,?)',row.reqkey,now+queueTTL);
    this.sql.exec('DELETE FROM registration WHERE seq=?',row.seq);
    if(!row.pid)return;
    if(row.confirmed && now>row.admitted) {
      this.sql.exec('INSERT INTO samples(duration) VALUES (?)',Math.max(1,Math.min(now,row.expires)-row.admitted));
      this.sql.exec('DELETE FROM samples WHERE seq <= (SELECT MAX(seq)-40 FROM samples)');
    }
    this.sql.exec('INSERT OR REPLACE INTO room_clock VALUES(1,?)',now);
    const peer=this.peers.get(row.pid);
    if(peer){try {peer.control.close();} catch {} this.drop(row.pid,peer);}
    this.live.delete(row.pid);
    this.broadcast({type:'leave',id:row.pid});
  }
  sweep(now) {
    this.sql.exec('DELETE FROM retired WHERE expires<=?',now);
    for(const row of this.sql.exec('SELECT * FROM registration WHERE expires<=?',now).toArray())this.retire(row,now);
    this.nextSweep=now+500;
  }
  async schedule(now, newDeadline = Infinity) {
    // Avoid rescheduling on every ordinary movement. A new short lease can still
    // bring forward an old alarm that was waiting only for a tombstone or queue.
    if(this.nextAlarm>now && this.nextAlarm<=newDeadline) return;
    const earliest=this.one('SELECT MIN(expiry) AS due FROM (SELECT MIN(expires) AS expiry FROM registration UNION ALL SELECT MIN(expires) FROM retired)').due;
    if(earliest==null){this.nextAlarm=0;return;}
    const due=Math.max(earliest,now+1);
    if(this.nextAlarm>now && this.nextAlarm<=due)return;
    this.nextAlarm=due;
    try {await this.ctx.storage.setAlarm(due);}
    catch(error){this.nextAlarm=0;throw error;}
  }
  async alarm() {
    const now=Date.now();
    this.nextAlarm=0;
    this.sweep(now);
    await this.schedule(now);
  }
  choosePose() {
    const others=this.sql.exec('SELECT * FROM registration WHERE admitted IS NOT NULL').toArray().map(r=>this.runtime(r));
    let best=null, bestGap=-1;
    for(const z of [8.2,6.7,9.7,5.2,11.2,3.7,12.7,2.2,1])for(const x of [-.65,.65,-1.95,1.95,0]) {
      const gap=Math.min(Infinity,...others.map(p=>Math.hypot(p.x-x,p.z-z)));
      const pose={x,z,heading:x<0?-.59:.59};
      if(gap>=1.25)return pose;
      if(gap>bestGap){best=pose;bestGap=gap;}
    }
    return best;
  }
  resolve(row,now) {
    if(!row.pid) {
      const ahead=this.count('SELECT COUNT(*) AS n FROM registration WHERE admitted IS NULL AND seq<?',row.seq);
      const occupancy=this.seated(), departures=ahead+1-(capacity-occupancy);
      if(departures>0) {
        this.sql.exec('UPDATE registration SET expires=? WHERE seq=?',now+queueTTL,row.seq);
        const samples=this.one('SELECT COUNT(*) AS n, AVG(duration) AS duration FROM samples');
        const interval=(samples.n>=3?samples.duration:900000)/capacity;
        const last=this.one('SELECT last_release FROM room_clock WHERE slot=1')?.last_release||0;
        const elapsed=Math.min(interval,Math.max(0,now-Math.max(last,row.enqueued)));
        return json({queued:true,ticket:row.ticket,ahead,etaSeconds:Math.max(0,Math.ceil((interval*departures-elapsed)/1000)),estimatingFromHistory:samples.n>=3,occupancy,capacity},202);
      }
      const pose=row.x===null?this.choosePose():row;
      this.sql.exec('UPDATE registration SET pid=?,token=?,admitted=?,expires=?,x=?,z=?,heading=? WHERE seq=?',
        crypto.randomUUID(),secret(),now,now+connectTTL,pose.x,pose.z,pose.heading,row.seq);
      row=this.one('SELECT * FROM registration WHERE seq=?',row.seq);
      this.broadcast({type:'join',visitor:this.appearance(row,false)});
    }
    return json({selfId:row.pid,token:row.token,visitors:this.snapshot(row.legacy),trailLimit,rosterVersion:2},201);
  }
  join(body,now) {
    const {name,avatar}=checkedProfile(body), key=body.admissionKey;
    const pose=body.pose?checkedPose(body.pose):null;
    if(key!==undefined) {
      if(!validKey(key))throw failure(400,'入馆请求编号无效。');
      if(this.one('SELECT 1 FROM retired WHERE reqkey=?',key))throw expired();
      const earlier=this.one('SELECT * FROM registration WHERE reqkey=?',key);
      if(earlier) {
        if(earlier.expires<=now)throw expired();
        if(earlier.name!==name || earlier.initial_avatar!==avatar) throw failure(409,'此入馆请求的名字或形象已改变。');
        return this.resolve(earlier,now);
      }
    } else if(this.seated()+this.waiting()>=capacity) {
      throw failure(503,'当前名额已满，请刷新入馆页后排队。');
    }
    if(this.full()||this.waiting()>=queueLimit)throw busy();
    const ticket=secret();
    this.sql.exec('INSERT INTO registration(reqkey,ticket,name,initial_avatar,avatar,legacy,enqueued,expires,x,z,heading) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      key??null,ticket,name,avatar,avatar,Number(body.rosterVersion!==2 && avatar!==body.avatarId),now,now+queueTTL,pose?.x??null,pose?.z??null,pose?.heading??null);
    return this.resolve(this.one('SELECT * FROM registration WHERE ticket=?',ticket),now);
  }
  queue(path,token,body,now) {
    if(path==='queue/status') {
      const row=this.one('SELECT * FROM registration WHERE ticket=?',token);
      if(!row || row.expires<=now)throw expired();
      return this.resolve(row,now);
    }
    if(!token && !validKey(body.admissionKey))throw failure(400,'缺少有效的候位编号。');
    const row=token?this.one('SELECT * FROM registration WHERE ticket=?',token):this.one('SELECT * FROM registration WHERE reqkey=?',body.admissionKey);
    if(row) {
      if(!row.confirmed)this.retire(row,now);
    } else if(!token && !this.one('SELECT 1 FROM retired WHERE reqkey=?',body.admissionKey)) {
      if(this.full())throw busy();
      this.sql.exec('INSERT INTO retired VALUES(?,?)',body.admissionKey,now+queueTTL);
    }
    return json({});
  }
  move(row,body,now) {
    const data=this.runtime(row);
    const credits=Math.min(4,data.credits+Math.max(0,now-data.refilled)/80);
    if(credits<1)throw failure(429,'位置更新过于频繁，请稍后再试。');
    const pose=body.pose?checkedPose(body.pose):null;
    const avatar=body.avatarId===undefined?row.avatar:resolveVisitorId(body.avatarId);
    if(!avatar)throw failure(400,'形象无效。');
    data.refilled=now;data.credits=credits-1;
    let point;
    if(pose) {
      const jump=body.teleport===true||Math.hypot(data.x-pose.x,data.z-pose.z)>3.2;
      Object.assign(data,pose);
      const previous=data.trail.at(-1);
      if(jump||Math.hypot(previous.x-data.x,previous.z-data.z)>=.38) {
        point={x:data.x,z:data.z,...(jump?{break:true}:{})};data.trail.push(point);
        if(data.trail.length>trailLimit)data.trail.shift();
      }
    }
    if(now-data.checkpoint>=checkpointMs || avatar!==row.avatar || !data.moved) {
      this.sql.exec('UPDATE registration SET avatar=?,confirmed=1,expires=?,x=?,z=?,heading=? WHERE seq=?',
        avatar,now+seatTTL,data.x,data.z,data.heading,row.seq);
      data.checkpoint=now;
    }
    data.moved=true;
    this.broadcast({type:'update',id:row.pid,x:data.x,z:data.z,heading:data.heading,avatarId:avatar,point});
    return json({});
  }
  async fetch(request) {
    const path=new URL(request.url).pathname.replace(/^\/api\//,'');
    try {
      const reading=path==='room'&&request.method==='GET';
      if(!reading && request.method!=='POST')throw failure(405,'请求方法无效。');
      const body=reading?{}:await payload(request);
      const now=Date.now();
      if(now>=this.nextSweep)this.sweep(now);
      let response;
      const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||body.token||'';
      if(typeof token!=='string')throw failure(400,'会话编号无效。');
      if(reading)response=json({service:'shiku-presence',site:'shiku',version:1,rosterVersion:2,capacity,occupancy:this.seated(),waiting:this.waiting(),lanUrls:[]});
      else if(path==='join')response=this.join(body,now);
      else if(path==='queue/status'||path==='queue/cancel')response=this.queue(path,token,body,now);
      else {
        const row=this.one('SELECT * FROM registration WHERE token=?',token);
        if(!row||row.expires<=now)throw failure(401,'入馆会话已过期。');
        if(path==='stream')response=this.stream(row,now);
        else if(path==='pulse'){this.confirm(row,now);response=json({});}
        else if(path==='update')response=this.move(row,body,now);
        else if(path==='leave'){this.retire(row,now);response=json({});}
        else throw failure(404,'接口不存在。');
      }
      const promotes = path==='join' || path==='queue/status';
      await this.schedule(now,promotes?now+connectTTL:path==='queue/cancel'?now+queueTTL:Infinity);
      return response;
    } catch(error) {
      return json({error:error.status?error.message:'展馆暂时无法连接，请稍后再试。'},error.status||500);
    }
  }
}
