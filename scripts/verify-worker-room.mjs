import {museumPoint} from '../presence-coordinates.js';
// End-to-end Worker + SQLite DO in workerd, including a new process over the same local storage.
// Set MINIFLARE_MODULE and ESBUILD_MODULE to installed, pinned packages if not in node_modules.
import assert from 'node:assert/strict';
import {roomAt} from '../building-plan.js';
import {createRequire} from 'node:module';
import {mkdtemp,rm,readFile,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {Miniflare,convertV4MiniflareOptions}=require(process.env.MINIFLARE_MODULE||'miniflare');
const {build}=require(process.env.ESBUILD_MODULE||'esbuild');
const dir=dirname(dirname(fileURLToPath(import.meta.url))),config=JSON.parse(await readFile(join(dir,'deploy/cloudflare/wrangler.json')));
const js=(await build({entryPoints:[join(dir,'deploy/cloudflare/worker.mjs')],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'})).outputFiles[0].text;
const storage=await mkdtemp(join(tmpdir(),'shiku-worker-'));
const backup=await mkdtemp(join(tmpdir(),'shiku-room-snapshot-'));
const restored=await mkdtemp(join(tmpdir(),'shiku-room-restore-'));
const origin=config.vars.PUBLIC_ORIGIN;let mf;
const create=async(directory=storage)=>{mf=new Miniflare(convertV4MiniflareOptions({cf:false,host:'127.0.0.1',resourcePersistencePath:directory,isolatedResourcePersistencePath:directory,workers:[{name:'shiku',modules:true,script:js,compatibilityDate:config.compatibility_date,bindings:{PUBLIC_ORIGIN:origin},serviceBindings:{ASSETS:r=>new Response(new URL(r.url).pathname)},durableObjects:{SHIKU_ROOM:{className:'MuseumRoom',useSQLite:true}}}]}));
 await mf.ready;};
const get=async(p)=>mf.dispatchFetch(origin+p);
const post=async(p,b={},token,site=origin)=>mf.dispatchFetch(origin+'/api/'+p,{method:'POST',headers:{'Content-Type':'application/json',Origin:site,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(b)});
async function request(p,b,t,status=200){const res=await post(p,b,t);const data=await res.json();assert.equal(res.status,status,p+' '+JSON.stringify(data).slice(0,150));return data;}
const abortRead=(p)=>{let t;return Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error('stream timeout')),5000);})]).finally(()=>clearTimeout(t));};
try{
 await create();
 assert.equal((await mf.dispatchFetch('https://other.invalid/api/room')).status,403);assert.equal((await post('join',{},null,'https://other.invalid')).status,403);
 assert.equal(await (await get('/')).text(),'/index.html');
 const metric={event:'ready',device:'touch',entry:'work',elapsedMs:1701};
 for(const event of ['ready','artwork','audio_played'])assert.equal((await post('visit-metric',{...metric,event})).status,204);
 assert.equal((await post('visit-metric',{...metric,token:'invalid extra field'})).status,400);
 assert.equal((await post('visit-metric',metric,null,'https://other.invalid')).status,403);
 const initial=await (await get('/api/room')).json();assert.deepEqual([initial.capacity,initial.occupancy,initial.waiting],[50,0,0]);
 const inputs=Array.from({length:52},(_,i)=>({name:'公开验收'+i,avatarId:i%2?'heng':'qing',rosterVersion:2,admissionKey:crypto.randomUUID()}));
 const joined=await Promise.all(inputs.slice(0,50).map(b=>request('join',b,null,201)));
 const positions=joined.map(p=>p.visitors.find(v=>v.id===p.selfId));
 assert.equal(new Set(positions.map(museumPoint).map(roomAt)).size,9,'all nine galleries received arrivals');
 for(const [i,p] of positions.entries())for(const other of positions.slice(0,i))assert(Math.hypot(other.x-p.x,other.z-p.z)>=1.25);
 await Promise.all(joined.map(p=>request('pulse',{},p.token)));
 const finite=await request('pulse',{snapshot:true},joined[1].token);
 assert.equal(finite.visitors.length,50);assert(finite.visitors.every(p=>!p.token&&!p.ticket));
 const q1=await request('join',inputs[50],null,202),q2=await request('join',inputs[51],null,202);assert.deepEqual([q1.ahead,q2.ahead],[0,1]);
 const res=await post('stream',{},joined[1].token);assert.equal(res.status,200);const reader=res.body.getReader();
 assert.match(new TextDecoder().decode((await abortRead(reader.read())).value),/"type":"snapshot"/);
 await request('update',{pose:{x:3.4,z:2.1,heading:.4}},joined[0].token);
 assert.match(new TextDecoder().decode((await abortRead(reader.read())).value),/"type":"update"/);await reader.cancel();
 await mf.dispose();mf=null;
 // Snapshot only after stopping the isolated writer, so the SQLite and journal files agree.
 await cp(storage,backup,{recursive:true});await create();
 const after=await (await get('/api/room')).json();assert.deepEqual([after.occupancy,after.waiting],[50,2]);
 const resume=await request('join',inputs[0],null,201);assert.equal(resume.token,joined[0].token);assert.equal(resume.visitors.find(v=>v.id===resume.selfId).x,3.4);
 assert.equal((await request('queue/status',{},q2.ticket,202)).ahead,1);
 await request('leave',{},joined[0].token);assert.equal((await request('queue/status',{},q2.ticket,202)).ahead,1);
 const next=await request('queue/status',{},q1.ticket,201);assert(next.token);await request('queue/cancel',{},q2.ticket);assert.equal((await (await get('/api/room')).json()).waiting,0);
 await mf.dispose();mf=null;
 // Restore to a separate directory; the post-checkpoint departure and promotion
 // above must not silently affect the backup. Never point this test at a live room.
 await cp(backup,restored,{recursive:true});await create(restored);
 const restoredRoom=await (await get('/api/room')).json();
 assert.deepEqual([restoredRoom.occupancy,restoredRoom.waiting],[50,2]);
 const restoredGuest=await request('pulse',{snapshot:true},joined[0].token);
 assert.equal(restoredGuest.visitors.find(v=>v.id===joined[0].selfId).x,3.4);
 assert.equal((await request('queue/status',{},q2.ticket,202)).ahead,1);
 await request('leave',{},joined[0].token);
 assert.equal((await post('pulse',{},joined[0].token)).status,401);
 console.log('隔离备份恢复至独立目录：席位、最近位置、候位顺序回到快照；快照时有效的令牌再次有效，离馆后撤销。');
 console.log('workerd：精确来源、50 并发入馆、两名候位、双人实时消息、进程重启后的名额/令牌/位置/FIFO、取消与补位均通过。');
}finally{if(mf)await mf.dispose();await Promise.all([storage,backup,restored].map(dir=>rm(dir,{recursive:true,force:true})));}
