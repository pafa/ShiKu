// Stage only a hash-verified public export for Wrangler. No uploads, Git or credentials.
import {readdir,readFile,writeFile,mkdir,lstat,realpath,mkdtemp,rename,rm,copyFile,access} from 'node:fs/promises';
import {resolve,join,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {securityHeaders} from '../server/security-headers.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url))), deploy=join(root,'deploy/cloudflare'),out=join(deploy,'dist');
const sha=b=>createHash('sha256').update(b).digest('hex');
let manifest;try{manifest=await readFile(join(root,'SHA256SUMS'),'utf8');await access(join(root,'assets/credits.json'));}catch{throw Error('请在全新导出的公开候选目录中执行，不能从内部工作区向 Workers 打包。');}
const checks=new Map();
for(const l of manifest.trimEnd().split('\n')){
  const m=/^([a-f0-9]{64})  (.+)$/.exec(l);
  if(!m||m[2].startsWith('/')||m[2].includes('\\')||m[2].split('/').includes('..')||checks.has(m[2]))throw Error('无效的公开清单');
  checks.set(m[2],m[1]);
}
const publicFile=p=>{
  const ext=extname(p);
  if(p.startsWith('assets/')||p.startsWith('real-viewer/'))return true;
  if(p==='preview/yungang-frontal-check.jpg')return true;
  if(!p.includes('/'))return ['.html','.css','.js','.svg','.png'].includes(ext);
  return false;
};
const paths=[...checks.keys()].filter(publicFile).sort();
if(paths.length+1>20000||!paths.includes('index.html')||!paths.includes('assets/credits.html'))throw Error('部署素材目录不完整或超过静态文件预算');
const stage=await mkdtemp(join(deploy,'.static-'));
try{
  await mkdir(join(stage,'assets'));
  let bytes=0,max=0;
  for(const [p,expected] of checks){const src=join(root,p);
    if(await realpath(src)!==src || !(await lstat(src)).isFile())throw Error('清单中有符号链接或无效文件 '+p);
    const data=await readFile(src);if(sha(data)!==expected)throw Error('公开候选已改变：'+p);
    if(!publicFile(p))continue;
    if(data.length>25*1024*1024)throw Error('文件超出 Workers 的单文件限额：'+p);
    const dst=join(stage,'assets',p);await mkdir(dirname(dst),{recursive:true});await writeFile(dst,data);
    bytes+=data.length;max=Math.max(max,data.length);
  }
  const headerLines = Object.entries(securityHeaders).map(([name, value]) => '  ' + name + ': ' + value);
  await writeFile(join(stage,'assets/_headers'), ['/*', ...headerLines, ''].join('\n'));
  const id=sha(manifest);await writeFile(join(stage,'receipt.json'),JSON.stringify({publicManifest:id,files:paths.length+1,bytes,max},null,2)+'\n');
  try{await access(out);throw Error('dist 已存在，请重新使用干净的候选目录。');}catch(e){if(e.code!=='ENOENT')throw e;}
  await rename(stage,out);console.log(JSON.stringify({publicManifest:id,staticFiles:paths.length+1,bytes,max}));
}catch(e){await rm(stage,{recursive:true,force:true});throw e;}
