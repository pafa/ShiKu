// Start a loopback museum from the checkout that contains this file.
import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createMuseumServer } from '../server/museum.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const profiles = new Map([
  ['feature', { label: '功能试玩', port: 4174 }],
  ['test', { label: '回归验证', port: 4175 }],
]);
const usage = '用法：node scripts/start-local.mjs feature|test [--port PORT]';

function revision() {
  const git = (...args) => execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  try {
    if (resolve(git('rev-parse', '--show-toplevel')) !== root) throw new Error();
    const commit = git('rev-parse', '--verify', 'HEAD');
    const branch = git('branch', '--show-current') || 'detached HEAD';
    const dirty = Boolean(git('status', '--porcelain', '--untracked-files=normal', '--ignore-submodules=none'));
    return {branch, commit, dirty};
  } catch {
    return null;
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true, options: { port: { type: 'string' }, help: { type: 'boolean', short: 'h' } },
  });
  if (values.help) { console.log(usage); return; }
  const profile = profiles.get(positionals[0]);
  if (!profile || positionals.length !== 1) throw new Error(usage);
  const port = values.port === undefined ? profile.port : Number(values.port);
  if ((values.port !== undefined && !/^\d+$/.test(values.port)) || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('端口必须是 1 到 65535 之间的整数。');
  if (port === 4173) throw new Error('4173 留给线上版本的本地对照，请使用其他端口。');

  const source = revision();
  if (positionals[0] === 'test') {
    if (!source) throw new Error('无法确认此目录的 Git 提交。请在指定提交的干净 Git 工作副本中运行回归验证。');
    if (source.dirty) throw new Error('回归验证要求干净的 Git 工作副本。请另行检出指定提交；要查看未提交修改，请使用 feature。');
  }
  const description = source
    ? `分支：${source.branch}　提交：${source.commit}　工作区：${source.dirty ? '有未提交改动' : '干净'}`
    : '未取得此目录的 Git 版本。若来自发布包，可用 SHA256SUMS 核验文件。';
  const host = '127.0.0.1';
  const server = createMuseumServer();
  const ready = once(server, 'listening');
  server.listen(port, host);
  try {
    await ready;
  } catch (error) {
    if (error.code === 'EADDRINUSE') throw new Error(`本机端口 ${port} 已占用，请显式选择其他 --port。`);
    throw error;
  }

  // Node owns the listening socket and all visitor streams in this process.
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  console.log(`${profile.label}　http://${host}:${port}/\n来源：${root}\n${description}\n按 Ctrl+C 结束此房间。`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
