// Optional read-only inventory. No auth discovery or network request without --account.
const flags=process.argv.slice(2);
if(flags.length!==1||flags[0]!=='--account'){
  console.log('只读检查。显式传入 --account，并在本机环境提供 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN。');
  process.exit(flags.length?2:0);
}
const account=process.env.CLOUDFLARE_ACCOUNT_ID, token=process.env.CLOUDFLARE_API_TOKEN;
if(!/^[a-f0-9]{32}$/i.test(account||'')||!token)throw Error('缺少账号 ID 或只读 API 令牌；请在本机设置。');
const host='shiku.xiaoha.org', script='shiku';
async function get(path,{missing=false}={}){
  const response=await fetch('https://api.cloudflare.com/client/v4'+path,{method:'GET',
    headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(12000)});
  const value=await response.json();
  if(missing&&response.status===404)return null;
  if(!response.ok||!value.success)throw Error('只读请求未完成：HTTP '+response.status+'，Cloudflare 错误代码 '+(value.errors||[]).map(e=>e.code).join(','));
  return value;
}
const base='/accounts/'+account+'/workers';
const zones=(await get('/zones?name=xiaoha.org&account.id='+account)).result;
if(zones.length!==1||zones[0].account.id!==account)throw Error('未能在指定账号确认 xiaoha.org；停止。');
const zone=zones[0], dns=(await get('/zones/'+zone.id+'/dns_records?name='+host+'&per_page=100')).result;
const domains=(await get(base+'/domains?hostname='+host)).result;
const ownDomains=(await get(base+'/domains?service='+script)).result;
const deployments=await get(base+'/scripts/'+script+'/deployments?per_page=1',{missing:true});
const subdomain=deployments?await get(base+'/scripts/'+script+'/subdomain'):null;
const routes=(await get('/zones/'+zone.id+'/workers/routes')).result;
const targetPaths=routes.filter(r=>r.script===script||r.pattern.includes(host)||r.pattern.includes('*.xiaoha.org')||r.pattern.includes('*xiaoha.org'));
console.log(JSON.stringify({at:new Date().toISOString(),zone:zone.name,status:zone.status,host,
  dns:dns.map(({id,type,name,content,proxied,ttl})=>({id,type,name,content,proxied,ttl})),
  domains:domains.map(({id,hostname,service,enabled,previews_enabled})=>({id,hostname,service,enabled,previews_enabled})),
  otherDomainsForWorker:ownDomains.filter(d=>d.hostname!==host).map(d=>d.hostname),
  candidateRoutes:targetPaths.map(({pattern,script})=>({pattern,script})),
  currentDeployment:deployments?.result?.deployments?.[0]?.versions??null,
  workerSubdomain:subdomain?.result??null},null,2));
