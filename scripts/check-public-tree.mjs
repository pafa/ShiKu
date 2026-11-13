// Run from a Git checkout after generating a fresh public export.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstat, readdir, readFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';

const [flag, directory, ...extra] = process.argv.slice(2);
if (flag !== '--dir' || !directory || extra.length) {
  throw Error('用法：node scripts/check-public-tree.mjs --dir <全新公开导出目录>');
}
const exported = resolve(directory);
if (!(await lstat(exported)).isDirectory()) throw Error('导出目录必须是普通目录');
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf8'}).trimEnd();
if (root === exported) throw Error('请选择单独导出的目录');

// Use the staged blob, so a local check also verifies what the next commit would contain.
const listing = execFileSync('git', ['ls-files', '--cached', '--stage', '-z'], {cwd: root, encoding: 'utf8'});
const tracked = new Map();
for (const entry of listing.split('\0').filter(Boolean)) {
  const match = /^(100(?:644|755)) ([a-f0-9]+) 0\t([\s\S]+)$/.exec(entry);
  if (!match) throw Error('Git 索引含符号链接、子模块或未解决的冲突：' + JSON.stringify(entry));
  tracked.set(match[3], match[2]);
}

const files = new Set();
async function visit(prefix) {
  for (const entry of await readdir(join(exported, prefix), {withFileTypes: true})) {
    const path = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) await visit(path);
    else if (entry.isFile()) files.add(path);
    else throw Error('导出含符号链接或特殊文件：' + JSON.stringify(path));
  }
}
await visit('');
if (!files.has('SHA256SUMS')) throw Error('导出缺少 SHA256SUMS');

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const failures = [];
for (const [path, blob] of tracked) {
  if (!files.has(path)) {
    failures.push('仅 Git 跟踪：' + JSON.stringify(path));
    continue;
  }
  // The public-release audit rejects individual files at or above GitHub's 100 MiB limit.
  const staged = execFileSync('git', ['cat-file', 'blob', blob], {cwd: root, maxBuffer: 100 * 1024 ** 2});
  if (sha256(staged) !== sha256(await readFile(join(exported, path)))) {
    failures.push('内容不同：' + JSON.stringify(path));
  }
}
for (const path of files) {
  if (!tracked.has(path)) failures.push('仅公开导出：' + JSON.stringify(path));
}
if (failures.length) throw Error('Git 索引与公开导出不一致\n' + failures.join('\n'));
console.log(`Git 索引与公开导出一致（${files.size} 个文件，含 SHA256SUMS）。`);
