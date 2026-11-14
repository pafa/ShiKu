export { MuseumRoom } from './room.mjs';

// Keep the singleton name, namespace and migration stable across code updates.
const key='museum-public-v1';
const api=new Set(['room','join','queue/status','queue/cancel','stream','pulse','update','leave'].map(s=>'/api/'+s));
function error(status,message){
  return Response.json({error:message},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
// These narration files are all short mono clips. Handle one byte range explicitly:
// the Static Assets binding can return the whole file even when a browser seeks.
async function narration(request,env){
  const headers=new Headers(request.headers),range=headers.get('Range');headers.delete('Range');headers.delete('If-Range');
  const full=await env.ASSETS.fetch(new Request(request.url,{method:'GET',headers}));
  if(full.status!==200)return full;
  const h=new Headers(full.headers);h.set('Accept-Ranges','bytes');
  const result=(body,status)=>new Response(body,{status,headers:h});
  if(!range && request.method!=='HEAD')return result(full.body,200);
  const ifRange=request.headers.get('If-Range');
  if(ifRange && ifRange!==h.get('ETag') && ifRange!==h.get('Last-Modified'))return result(request.method==='HEAD'?null:full.body,200);
  const limit=2*1024*1024;
  if(Number(h.get('Content-Length'))>limit || !full.body){await full.body?.cancel();return error(503,'音轨不可用。');}
  // Static Assets may omit Content-Length internally even when the edge sends one.
  const reader=full.body.getReader(),parts=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;
    if((size+=value.byteLength)>limit){await reader.cancel();return error(503,'音轨不可用。');}
    parts.push(value);
  }}finally{reader.releaseLock();}
  if(!size)return error(503,'音轨不可用。');
  if(!range){h.set('Content-Length',String(size));return result(null,200);}
  const m=/^bytes=(\d*)-(\d*)$/.exec(range);
  const first=m?.[1]?Number(m[1]):null,last=m?.[2]?Number(m[2]):null;
  const start=first??Math.max(0,size-(last??0)),end=first!==null&&last!==null?Math.min(last,size-1):size-1;
  if(!m || (first===null&&last===null) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start>end || start>=size){
    h.set('Content-Range','bytes */'+size);h.set('Content-Length','0');return result(null,416);
  }
  h.set('Content-Length',String(end-start+1));h.set('Content-Range','bytes '+start+'-'+end+'/'+size);
  if(request.method==='HEAD')return result(null,206);
  const slice=new Uint8Array(end-start+1);let offset=0;
  for(const part of parts){const a=Math.max(0,start-offset),b=Math.min(part.length,end+1-offset);if(a<b)slice.set(part.subarray(a,b),offset+a-start);offset+=part.length;if(offset>end)break;}
  return result(slice,206);
}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.origin!==env.PUBLIC_ORIGIN)return error(403,'请从展馆地址进入。');
  if(url.pathname==='/api/version'){
    if(request.method!=='GET')return error(405,'请求方法无效。');
    return Response.json({service:'shiku',version:env.VERSION?.id||null},{headers:{'Cache-Control':'no-store'}});
  }
  if(url.pathname.startsWith('/api/')){
    if(!api.has(url.pathname))return error(404,'接口不存在。');
    const read=url.pathname==='/api/room';
    if(request.method!==(read?'GET':'POST'))return error(405,'请求方法无效。');
    if(!read&&request.headers.get('Origin')!==env.PUBLIC_ORIGIN)return error(403,'请从展馆页面连接。');
    if(!read&&!/^(application\/json|text\/plain)(;|$)/i.test(request.headers.get('Content-Type')||''))return error(415,'请求格式无效。');
    if(!read&&Number(request.headers.get('Content-Length'))>3072)return error(413,'请求过长。');
    return env.SHIKU_ROOM.get(env.SHIKU_ROOM.idFromName(key)).fetch(request);
  }
  if(!['GET','HEAD'].includes(request.method))return error(405,'请求方法无效。');
  if(/^\/assets\/walk\/voices\/[a-z0-9-]+\.mp3$/.test(url.pathname))return narration(request,env);
  if(url.pathname==='/real-viewer'){url.pathname+='/';return Response.redirect(url,308);}
  if(url.pathname==='/'||url.pathname==='/real-viewer/')url.pathname+='index.html';
  const response=await env.ASSETS.fetch(new Request(url,request));
  return response;
}};
