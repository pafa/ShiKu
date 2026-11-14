// Audit an unpacked public candidate before creating its remote. No remote service is used.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readdir,readFile,stat,lstat,realpath} from 'node:fs/promises';
import {extname,dirname,basename,join,relative,resolve,sep} from 'node:path';

const args=process.argv.slice(2);
const dirAt=args.indexOf('--dir');
if(dirAt<0||!args[dirAt+1]||args[dirAt+1].startsWith('--'))
  throw Error('用法：node scripts/check-public-release.mjs --dir <已解压的候选目录> [--browser] [--files-only]');
assert(!(await lstat(args[dirAt+1])).isSymbolicLink(),'候选根目录不能是符号链接');
const root=await realpath(args[dirAt+1]);
const issues=[],files=new Map(),media=new Set();
const problem=(path,reason)=>issues.push(path+' — '+reason);
const docsExt=/\.(?:md|cff|html?|m?js|css|json|txt|xml|svg|csv|command|sh|py|ya?ml|toml|lock|service|conf)$/i;
const mediaExt=/\.(?:avif|gif|jpe?g|tiff?|png|webp|svg|mp3|m4a|aac|opus|wav|ogg|flac|webm|mp4|mov|glb|gltf|bin|drc|dds|ktx2?|hdr|exr|woff2?|ttf|otf|pdf|fbx|obj|mtl)$/i;
const deniedDirs=new Set(['.git','.aws','.ssh','.codex','.agents','.config','.wrangler','.cache','node_modules','__pycache__','review','preview','release-output','output','coverage','.venv','.DS_Store']);
const credentialName=/^(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|\.npmrc|\.pypirc|\.netrc|\.git-credentials|id_(?:rsa|ed25519|dsa|ecdsa)(?:\.pub)?|credentials(?:\.json)?)$|\.(?:key|pem|pfx|p12|kdbx|sqlite3?|log|bak|tar|tgz|zip|7z)$/i;
const checks=[
  ['私钥材料', /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/],
  ['内嵌凭据', /(?:https?|ssh):\/\/[^\s/:@"']{2,}:([^\s/@"']{8,})@/],
  ['令牌格式', /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{70,255}|AKIA[A-Z0-9]{16}|sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/],
  ['本机个人目录', /(?:\/Users\/|\/home\/)[^\s<>"'`/:]+\/(?:[^\s<>"'`]+)|[A-Za-z]:\\Users\\[^\s"<>']+|\/private\/(?:tmp\/shiku[^\s"']*|var\/folders\/[^\s"']+)/i],
];

async function walk(dir) {
  for(const e of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,e.name),k=relative(root,path).split(sep).join('/');
    if(e.isSymbolicLink()||(!e.isDirectory()&&!e.isFile())){problem(k,'非法链接或特殊文件');continue;}
    if(deniedDirs.has(e.name)||credentialName.test(e.name)||e.name==='LOCAL-WORKBENCH.md'){problem(k,'开发私有目录或文件类型');continue;}
    if(e.isDirectory()){await walk(path);continue;}
    const size=(await stat(path)).size;files.set(k,size);
    if(size>=100*1024**2)problem(k,'达到 GitHub 每文件 100 MiB 限制');
    if(mediaExt.test(e.name))media.add(k);
    if(docsExt.test(e.name)||!extname(e.name)||e.name.endsWith('.glb')){
      let value;
      if(e.name.endsWith('.glb')){
        // GLB metadata can include original artist workstation paths.
        const data=await readFile(path);
        if(data.length<20||data.readUInt32LE(16)!==0x4e4f534a){problem(k,'无效的 GLB 元数据');continue;}
        value=data.subarray(20,20+data.readUInt32LE(12)).toString('utf8');
      }else value=await readFile(path,'utf8');
      for(const [reason,re] of checks)if(re.test(value))problem(k,reason);
    }
  }
}

async function checkInventory(){
  const path='SHA256SUMS';
  if(!files.has(path)){problem(path,'缺少完整候选清单');return;}
  const seen=new Set();
  for(const line of (await readFile(join(root,path),'utf8')).trimEnd().split('\n')){
    const match=/^([0-9a-f]{64})  (.+)$/.exec(line);
    if(!match){problem(path,'无效的清单行');continue;}
    const [,hash,k]=match;
    if(k===path||!files.has(k)||seen.has(k)){problem(k,'候选清单重复或文件缺失');continue;}
    seen.add(k);
    if(createHash('sha256').update(await readFile(join(root,k))).digest('hex')!==hash)problem(k,'文件与候选清单不一致');
  }
  for(const k of files.keys())if(k!==path&&!seen.has(k))problem(k,'未在候选清单登记');
}

async function checkReadmes(){
  const documents=[...files.keys()].filter(k=>/^README(?:\.[^.\/]+)?\.md$/i.test(basename(k)));
  if(!documents.includes('README.md'))problem('README.md','缺少中文入口');
  let count=0;
  for(const path of documents){
    const md=await readFile(join(root,path),'utf8');
    const prose=md.replace(/^`{3,}[^\n]*\n[\s\S]*?^`{3,}[^\n]*$/gm,'');
    const targets=[
      ...Array.from(prose.matchAll(/\]\((?:<([^>]+)>|([^()\s]+))(?:\s+(?:"[^"]*"|'[^']*'))?\)/g),m=>m[1]||m[2]),
      ...Array.from(prose.matchAll(/^\s*\[[^\]]+\]:\s*<?([^>\s]+)>?/gm),m=>m[1]),
      ...Array.from(prose.matchAll(/<(?:a|img)\s+[^>]*?(?:href|src)\s*=\s*["']([^"']+)/gi),m=>m[1])
    ];
    for(const raw of targets){
      if(/^(?:https?:|mailto:|\/\/|#)/i.test(raw))continue;
      const target=decodeURIComponent(raw.split(/[?#]/)[0]);if(!target)continue;
      const destination=resolve(target.startsWith('/')?root:join(root,dirname(path)),target.replace(/^\//,''));
      if(destination!==root&&!destination.startsWith(root+sep)){problem(path,'链接越过发布目录 '+target);continue;}
      try{await stat(destination);count++;}catch{problem(path,'失效链接 '+target);}
    }
  }
  return count;
}

async function checkCredits(){
  const manifest='assets/credits.json';
  if(!files.has(manifest)){problem(manifest,'缺少公开授权清单');return new Map();}
  const data=JSON.parse(await readFile(join(root,manifest),'utf8'));
  const entries=data.files||data.assets||data;
  assert(Array.isArray(entries),'assets/credits.json 需要逐项清单');
  const allowed=new Map();
  for(const row of entries){
    if(!row||typeof row.path!=='string'){problem(manifest,'无效的素材行');continue;}
    const k=row.path;
    if(allowed.has(k))problem(k,'素材清单重复路径');
    allowed.set(k,row);
    if(!files.has(k)){problem(k,'已登记但文件缺失');continue;}
    if(!row.license || !row.credit || !row.source || !/^[a-f\d]{64}$/.test(row.sha256||'')){problem(k,'许可、署名、来源或哈希缺失');continue;}
    if(/(?:待核|未核实|仅限研究|非商业|noncommercial|all rights reserved|\bNC\b|unknown)/i.test(row.license))problem(k,'公开范围未确认的授权');
    const digest=createHash('sha256').update(await readFile(join(root,k))).digest('hex');
    if(digest!==row.sha256)problem(k,'与授权清单哈希不符');
  }
  for(const k of media)if(!allowed.has(k))problem(k,'媒体未列入公开授权清单');
  return allowed;
}

async function startCandidate(){
  const env={...process.env};delete env.SHIKU_PUBLIC_ORIGIN;
  const child=spawn(process.execPath,['server/museum.mjs','--host','127.0.0.1','--port','0'],{cwd:root,env,stdio:['ignore','pipe','pipe']});
  let stderr='';
  child.stderr.on('data',c=>{stderr=(stderr+c).slice(-500);});
  let timer;
  const start=new Promise((resolve,reject)=>{
    let output='';
    child.stdout.on('data',c=>{output+=c;const address=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(address)resolve(address[0]);});
    child.once('error',reject);child.once('exit',code=>reject(Error('候选服务启动失败 '+code+' '+stderr)));
    timer=setTimeout(()=>reject(Error('候选服务未在限时内启动')),9000);
  });
  try{return {child,base:new URL(await start)};}catch(e){child.kill();throw e;}finally{clearTimeout(timer);}
}

async function runtime(base){
  const get=(p,opts={})=>fetch(new URL(p,base),{...opts,signal:AbortSignal.timeout(6000)});
  const post=(p,data,token)=>get('api/'+p,{method:'POST',headers:{Origin:base.origin,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});
  const response=await get('/');assert(response.ok);assert((await response.text()).includes('石窟'));
  for (const path of ['/', '/walk-study.html', '/real-viewer/', '/real-viewer/relief.html']) {
    const page = await get(path);
    assert.equal(page.status, 200);
    const policy = page.headers.get('content-security-policy') || '';
    assert.match(policy, /(?:^|;\s*)frame-ancestors 'self'(?:;|$)/);
    const scripts = policy.split(';').map(value => value.trim()).find(value => value.startsWith('script-src '));
    assert(scripts && !scripts.includes("'unsafe-inline'") && !scripts.includes("'unsafe-eval'"));
    for (const [, attributes, contents] of (await page.text()).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/i.test(attributes)) continue;
      const digest = createHash('sha256').update(contents).digest('base64');
      assert(scripts.includes("'sha256-" + digest + "'"), path + ' 缺少内联脚本或 import map 对应的 CSP 授权');
    }
  }
  const room=await (await get('api/room')).json();
  assert.equal(room.capacity,50);assert.equal(room.occupancy,0);assert.deepEqual(room.lanUrls,[]);
  const sound=await get('assets/walk/voices/mogao-158--threshold.mp3?v=cn-guide-2',{headers:{Range:'bytes=0-255'}});
  assert.equal(sound.status,206);assert.equal(sound.headers.get('content-type'),'audio/mpeg');assert.equal((await sound.arrayBuffer()).byteLength,256);
  const joined=await post('join',{name:'验收',avatarId:'qing',rosterVersion:2});
  assert.equal(joined.status,201);const guest=await joined.json();
  assert(guest.visitors.some(x=>x.id===guest.selfId));assert.equal((await post('leave',{},guest.token)).status,200);
  for(const privateFile of ['.git/config','deploy/shiku.service','server/museum.mjs'])assert.equal((await get(privateFile)).status,404);
}

async function browserAudit(base,allowed) {
  const require=createRequire(import.meta.url);
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-proxy-server','--disable-background-networking','--enable-webgl','--ignore-gpu-blocklist',...(process.platform==='darwin'?['--use-angle=metal']:[])]});
  const assets=new Set();
  try{
    for(const [id,visitor,button] of [['longmen-1280','heng','#stroll-sound'],['mogao-285','qing','#cave-audio']]){
      const ctx=await browser.newContext({viewport:{width:visitor==='qing'?390:1150,height:800},reducedMotion:'reduce',serviceWorkers:'block'});
      try{
        const page=await ctx.newPage(),runtimeErrors=new Set();
        page.setDefaultTimeout(35000);
        await ctx.route('**/*',route=>{
          const url=new URL(route.request().url());
          if(/^https?:$/.test(url.protocol)&&url.origin!==base.origin){runtimeErrors.add('自动请求未经核准的外部资源 '+url.origin+url.pathname);return route.abort();}
          return route.continue();
        });
        page.on('pageerror',e=>runtimeErrors.add(e.message));
        page.on('console',m=>{if(m.type()==='error')runtimeErrors.add(m.text().slice(0,360));});
        page.on('response',r=>{const url=new URL(r.url());if(url.origin!==base.origin)return;
          const k=decodeURIComponent(url.pathname.slice(1));
          if(r.status()>=400)runtimeErrors.add(r.status()+' '+k);
          if(mediaExt.test(k)){assets.add(k);if(!allowed.has(k))runtimeErrors.add('自动请求未经登记的媒体 '+k);}
        });
        await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.testGuide=this;return play.call(this);};});
        // Keep a required texture pending: the page must not expose half a scene.
        let releaseTexture;
        const pendingTexture=new Promise(resolve=>{releaseTexture=resolve;});
        await page.route('**/assets/museum/garden/autumn-forest.webp',async route=>{
          await pendingTexture;await route.continue();
        });
        await page.goto(new URL('?cave='+id,base).href);
        await page.locator('#open-registration').click();
        await page.locator('#guest-looks label').filter({has:page.locator('input[value="'+visitor+'"]')}).click();
        await page.locator('#inspect-look').click();
        await page.locator('.gs-view[data-mode=model]').waitFor();
        const reference=page.locator('.gs-reference-toggle');
        if(await reference.isVisible() && await reference.isEnabled()){
          await reference.click();
          const photo=page.locator('.gs-reference img');
          if(await photo.isVisible())await page.waitForFunction(()=>document.querySelector('.gs-reference img')?.naturalWidth>0);
          await page.keyboard.press('Escape');
        }
        await page.getByRole('button',{name:'选用此形象'}).click();
        await page.locator('#guest-name').fill('公开版验收');await page.locator('#join-room').click();
        try{
          await page.waitForFunction(()=>!document.querySelector('#visit-cover').hidden&&document.querySelector('#cover-progress').value>=38&&document.querySelector('#cover-title').textContent==='步入展馆');
          assert(await page.locator('#visit-cover').isVisible());
          assert(await page.locator('#museum').evaluate(node=>node.inert));
          assert(!await page.locator('#world canvas').isVisible());
        }finally{releaseTexture();}
        await page.waitForFunction(()=>document.querySelector('#visit-cover').hidden&&!document.querySelector('#museum').inert);
        assert.equal(await page.locator('#cover-progress').evaluate(el=>el.value),100);

        await page.locator('#world canvas').first().waitFor();
        await page.locator(button).click();
        await page.waitForFunction(()=>window.testGuide?.currentTime>0.3);
        await page.locator(button).click();
        await page.locator(button==='#stroll-sound'?'#stroll-structure':'#cave-structure').click();
        await page.locator('.evidence-desk').waitFor();await page.keyboard.press('Escape');
        await page.locator('[data-action=person]').click();
        await page.getByRole('button',{name:'离馆',exact:true}).click();await page.locator('#open-registration').waitFor();
        assert.deepEqual([...runtimeErrors],[],id+' 前端回归');
      }finally{await ctx.close();}
    }
    assert(assets.size>10,'未实际加载足够的 3D 场景及影像');
    return assets.size;
  }finally{await browser.close();}
}

await walk(root);
await checkInventory();
const linkCount=await checkReadmes(),allowed=await checkCredits();
if(issues.length){console.error(issues.slice(0,100).join('\n'));throw Error('候选审查发现 '+issues.length+' 项');}
console.log(files.size+' 个已核哈希文件、'+allowed.size+' 项授权记录（含 '+media.size+' 件媒体文件）、'+linkCount+' 个 README 本地链接通过。');
if(!args.includes('--files-only')){
  const {base,child}=await startCandidate();
  try{
    await runtime(base);
    console.log('候选单独启动、静态首页、MP3 Range、入馆与离馆通过。');
    if(args.includes('--browser'))console.log('浏览器双人物入窟、普通话播放、观展与登出通过，共载入 '+await browserAudit(base,allowed)+' 项已授权媒体。');
  }finally{const closed=once(child,'exit');child.kill('SIGTERM');await closed;}
}
