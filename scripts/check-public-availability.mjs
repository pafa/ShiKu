// Run without accounts, cookies or a room seat. Totals and version are public.
import assert from 'node:assert/strict';
import {appendFile} from 'node:fs/promises';

const origin='https://shiku.xiaoha.org';
const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const expected=process.env.SHIKU_EXPECTED_VERSION?.trim();
if(expected && !uuid.test(expected))throw Error('Expected Worker version must be a UUID.');
const checkpoints=[
  ['Entrance','/',async res=>{
    assert.match(res.headers.get('content-type')||'',/text\/html/i);
    const body=await res.text();
    assert(body.includes('id="visit-cover"') && body.includes('id="open-registration"'),'Missing progress cover or registration.');
  }],
  ['Worker version','/api/version',async res=>{
    const info=await res.json();assert.equal(info.service,'shiku');assert.match(info.version,uuid);
    if(expected)assert.equal(info.version,expected,'Unexpected Worker version.');
    return info.version;
  }],
  ['Room summary','/api/room',async res=>{
    const room=await res.json();assert.equal(room.service,'shiku-presence');assert.equal(room.capacity,50);
    assert(Number.isInteger(room.occupancy)&&room.occupancy>=0&&room.occupancy<=room.capacity,'Invalid occupancy.');
    assert(Number.isInteger(room.waiting)&&room.waiting>=0,'Invalid queue size.');
  }],
  ['Illustrated guide','/exhibition-guide.html',async res=>{
    assert.match(res.headers.get('content-type')||'',/text\/html/i);
    assert((await res.text()).includes('全馆平面与逐件导览'),'Missing illustrated guide.');
  }],
  ['Exhibit image','/assets/space-studies/maijishan-202.webp',async res=>{
    assert.match(res.headers.get('content-type')||'',/image\/webp/i);
    const bytes=Buffer.from(await res.arrayBuffer());
    assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'Incomplete WebP file.');
  }],
  ['Mandarin audio','/assets/walk/voices/mogao-158--threshold.mp3',async res=>{
    assert.match(res.headers.get('content-type')||'',/audio\/mpeg/i);
    assert.match(res.headers.get('content-range')||'',/^bytes 0-255\/[0-9]+$/);
    assert.equal((await res.arrayBuffer()).byteLength,256);
  },{Range:'bytes=0-255'}]
];
async function probe([label,path,verify,headers]){
  const start=performance.now();
  for(let attempt=1;attempt<=2;attempt++){
    try{
      const res=await fetch(origin+path,{headers,redirect:'error',signal:AbortSignal.timeout(18000)});
      if(res.status!==(headers?.Range?206:200)){
        await res.body?.cancel();throw Error('HTTP '+res.status);
      }
      const detail=await verify(res);
      return {label,detail,attempt,ok:true,ms:Math.round(performance.now()-start)};
    }catch(err){
      if(attempt===2)return {label,ok:false,reason:String(err.message).slice(0,300)};
      await new Promise(resolve=>setTimeout(resolve,1200));
    }
  }
}
const results=await Promise.all(checkpoints.map(probe));
const rows=results.map(r=>r.ok
  ?'✓ '+r.label+' · '+r.ms+' ms · attempt '+r.attempt+(r.detail?' · '+r.detail:'')
  :'✗ '+r.label+' · '+r.reason);
console.log(rows.join('\n'));
if(process.env.GITHUB_STEP_SUMMARY){
  const summary=rows.map(row=>row.replaceAll('|','\\|').replaceAll('<','&lt;').replaceAll('>','&gt;'));
  await appendFile(process.env.GITHUB_STEP_SUMMARY,'## ShiKu public availability\n\n'+summary.map(row=>'- '+row).join('\n')+'\n');
}
if(results.some(r=>!r.ok))process.exitCode=1;
